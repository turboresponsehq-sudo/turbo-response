/**
 * AI Brief Router — Generate structured analysis briefs for Workspaces and Signals
 * Architecture: Data collection → Structured formatting → Storage
 * Future: LLM API integration point clearly marked
 */
import { TRPCError } from "@trpc/server";
import { desc, eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import {
  aiBriefs,
  workspaces,
  workspaceTasks,
  workspaceNotes,
  workspaceDocuments,
  workspaceTimeline,
  workspaceNextActions,
  turboSignals,
  pipelineOpportunities,
  missionTasks,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

// ── BRIEF CONTENT TYPES ───────────────────────────────────────────────────────
interface WorkspaceBriefContent {
  executiveSummary: string;
  currentProgress: string;
  risks: string[];
  opportunities: string[];
  recommendedNextActions: string[];
  missingInformation: string[];
  generatedAt: string;
  dataSnapshot: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalNotes: number;
    totalDocuments: number;
    timelineEvents: number;
    nextActions: number;
    completedActions: number;
  };
}

interface SignalBriefContent {
  whyClient: string;
  recentBuyingSignals: string[];
  suggestedOutreach: string[];
  priorityLevel: string;
  priorityReasoning: string;
  companyProfile: string;
  recommendedNextActions: string[];
  missingInformation: string[];
  generatedAt: string;
  dataSnapshot: {
    opportunityScore: number | null;
    signalType: string | null;
    hasPipeline: boolean;
    pipelineStage: string | null;
    relatedTasks: number;
  };
}

// ── DATA COLLECTION: WORKSPACE ────────────────────────────────────────────────
async function collectWorkspaceData(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (!ws) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });

  const tasks = await db.select().from(workspaceTasks).where(eq(workspaceTasks.workspaceId, workspaceId)).orderBy(desc(workspaceTasks.createdAt));
  const notes = await db.select().from(workspaceNotes).where(eq(workspaceNotes.workspaceId, workspaceId)).orderBy(desc(workspaceNotes.createdAt));
  const documents = await db.select().from(workspaceDocuments).where(eq(workspaceDocuments.workspaceId, workspaceId)).orderBy(desc(workspaceDocuments.uploadedAt));
  const timeline = await db.select().from(workspaceTimeline).where(eq(workspaceTimeline.workspaceId, workspaceId)).orderBy(desc(workspaceTimeline.createdAt));
  const nextActions = await db.select().from(workspaceNextActions).where(eq(workspaceNextActions.workspaceId, workspaceId));

  return { workspace: ws, tasks, notes, documents, timeline, nextActions };
}

// ── DATA COLLECTION: SIGNAL ───────────────────────────────────────────────────
async function collectSignalData(signalId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  const [signal] = await db.select().from(turboSignals).where(eq(turboSignals.id, signalId)).limit(1);
  if (!signal) throw new TRPCError({ code: "NOT_FOUND", message: "Signal not found" });

  // Check if signal has a pipeline entry
  let pipeline = null;
  if (signal.pipelineId) {
    const [p] = await db.select().from(pipelineOpportunities).where(eq(pipelineOpportunities.id, signal.pipelineId)).limit(1);
    pipeline = p || null;
  }

  // Get related tasks
  const relatedTasks = await db.select().from(missionTasks).where(eq(missionTasks.signalId, signalId));

  return { signal, pipeline, relatedTasks };
}

// ── BRIEF GENERATION: WORKSPACE ───────────────────────────────────────────────
/**
 * Generates a structured brief from workspace data.
 * ARCHITECTURE NOTE: This function is the LLM integration point.
 * Currently uses rule-based analysis. To integrate an LLM:
 * 1. Pass `rawData` to the LLM with a structured prompt
 * 2. Parse the LLM response into the same WorkspaceBriefContent shape
 * 3. The rest of the system (storage, UI, history) remains unchanged
 */
function generateWorkspaceBrief(data: Awaited<ReturnType<typeof collectWorkspaceData>>): WorkspaceBriefContent {
  const { workspace: ws, tasks, notes, documents, timeline, nextActions } = data;

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
  const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
  const completedActions = nextActions.filter(a => a.completed === 1);
  const pendingActions = nextActions.filter(a => a.completed === 0);

  // Executive Summary
  const typeLabel = ws.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  let executiveSummary = `"${ws.name}" is a ${typeLabel} currently in ${ws.status} status with ${ws.priority} priority.`;
  if (ws.assignedTo) executiveSummary += ` Assigned to ${ws.assignedTo}.`;
  if (ws.dueDate) executiveSummary += ` Target completion: ${ws.dueDate}.`;
  executiveSummary += `\n\nThis workspace contains ${tasks.length} total tasks (${completedTasks.length} completed, ${pendingTasks.length} pending), ${notes.length} notes, ${documents.length} documents, and ${nextActions.length} next actions.`;
  if (ws.description) executiveSummary += `\n\nDescription: ${ws.description}`;
  if (ws.notes) executiveSummary += `\n\nNotes: ${ws.notes}`;

  // Current Progress
  let currentProgress = '';
  if (completedTasks.length > 0) {
    currentProgress += `Completed ${completedTasks.length} of ${tasks.length} tasks (${Math.round((completedTasks.length / tasks.length) * 100)}% completion rate).\n\n`;
    currentProgress += 'Completed items:\n' + completedTasks.slice(0, 10).map(t => `• ${t.title}`).join('\n');
  } else if (tasks.length === 0) {
    currentProgress = 'No tasks have been created yet. The workspace is in early planning stages.';
  } else {
    currentProgress = 'No tasks have been completed yet. All tasks are still pending.';
  }
  if (completedActions.length > 0) {
    currentProgress += `\n\nCompleted ${completedActions.length} of ${nextActions.length} next actions.`;
  }
  if (documents.length > 0) {
    currentProgress += `\n\n${documents.length} document(s) uploaded: ${documents.map(d => d.fileName).join(', ')}`;
  }

  // Risks
  const risks: string[] = [];
  if (overdueTasks.length > 0) {
    risks.push(`${overdueTasks.length} task(s) are overdue: ${overdueTasks.map(t => `"${t.title}" (due ${t.dueDate})`).join(', ')}`);
  }
  if (ws.dueDate && new Date(ws.dueDate) < new Date()) {
    risks.push(`Workspace due date (${ws.dueDate}) has passed and status is still "${ws.status}".`);
  }
  if (ws.dueDate && new Date(ws.dueDate) > new Date()) {
    const daysLeft = Math.ceil((new Date(ws.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7 && pendingTasks.length > 3) {
      risks.push(`Only ${daysLeft} days remaining with ${pendingTasks.length} pending tasks.`);
    }
  }
  if (urgentTasks.length > 0) {
    risks.push(`${urgentTasks.length} high/urgent priority task(s) still pending.`);
  }
  if (ws.status === 'waiting') {
    risks.push('Workspace is in "waiting" status — may be blocked by external dependency.');
  }
  if (pendingActions.length > 5) {
    risks.push(`${pendingActions.length} next actions remain incomplete — potential action overload.`);
  }
  if (risks.length === 0) {
    risks.push('No significant risks identified at this time.');
  }

  // Opportunities
  const opportunities: string[] = [];
  if (tasks.length === 0) {
    opportunities.push('Break down the project into specific, actionable tasks to track progress.');
  }
  if (documents.length === 0) {
    opportunities.push('Upload relevant documents to centralize project information.');
  }
  if (notes.length === 0) {
    opportunities.push('Add notes from calls, meetings, or research to build institutional knowledge.');
  }
  if (completedTasks.length > 0 && pendingTasks.length > 0) {
    opportunities.push('Good momentum — continue completing tasks to maintain progress.');
  }
  if (ws.status === 'planning' && tasks.length > 3) {
    opportunities.push('Consider moving status to "active" — sufficient tasks are defined to begin execution.');
  }
  if (ws.type === 'client_project' && !ws.dueDate) {
    opportunities.push('Set a due date to establish clear timeline expectations with the client.');
  }
  if (ws.type === 'internal_case') {
    opportunities.push('Review filing deadlines and regulatory timelines for this case type.');
  }
  if (opportunities.length === 0) {
    opportunities.push('Workspace is well-organized. Continue current trajectory.');
  }

  // Recommended Next Actions
  const recommendedNextActions: string[] = [];
  if (pendingActions.length > 0) {
    recommendedNextActions.push(...pendingActions.slice(0, 5).map(a => a.action));
  }
  if (urgentTasks.length > 0) {
    recommendedNextActions.push(`Complete urgent tasks: ${urgentTasks.slice(0, 3).map(t => t.title).join(', ')}`);
  }
  if (overdueTasks.length > 0) {
    recommendedNextActions.push(`Address overdue tasks or update their due dates.`);
  }
  if (ws.status === 'waiting') {
    recommendedNextActions.push('Follow up on blocking dependency and update status when resolved.');
  }
  if (recommendedNextActions.length === 0) {
    recommendedNextActions.push('Review workspace and identify next milestone.');
  }

  // Missing Information
  const missingInformation: string[] = [];
  if (!ws.description) missingInformation.push('No workspace description — add context about the project scope.');
  if (!ws.dueDate) missingInformation.push('No due date set — establish a target completion date.');
  if (!ws.assignedTo) missingInformation.push('No assignee — clarify who is responsible.');
  if (documents.length === 0) missingInformation.push('No documents uploaded — relevant files would strengthen the workspace.');
  if (notes.length === 0) missingInformation.push('No notes recorded — capture key decisions and context.');
  if (missingInformation.length === 0) {
    missingInformation.push('All key fields are populated. Workspace data is comprehensive.');
  }

  return {
    executiveSummary,
    currentProgress,
    risks,
    opportunities,
    recommendedNextActions,
    missingInformation,
    generatedAt: new Date().toISOString(),
    dataSnapshot: {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      totalNotes: notes.length,
      totalDocuments: documents.length,
      timelineEvents: timeline.length,
      nextActions: nextActions.length,
      completedActions: completedActions.length,
    },
  };
}

// ── BRIEF GENERATION: SIGNAL ──────────────────────────────────────────────────
/**
 * Generates a structured brief from signal data.
 * ARCHITECTURE NOTE: Same LLM integration point as workspace briefs.
 */
function generateSignalBrief(data: Awaited<ReturnType<typeof collectSignalData>>): SignalBriefContent {
  const { signal, pipeline, relatedTasks } = data;

  // Why this company may become a client
  let whyClient = `${signal.companyName}`;
  if (signal.industry) whyClient += ` operates in the ${signal.industry} industry.`;
  if (signal.signalType) whyClient += ` Detected signal type: ${signal.signalType}.`;
  if (signal.opportunityScore && signal.opportunityScore >= 70) {
    whyClient += ` High opportunity score (${signal.opportunityScore}/100) indicates strong potential.`;
  } else if (signal.opportunityScore) {
    whyClient += ` Opportunity score: ${signal.opportunityScore}/100.`;
  }
  if (signal.notes) whyClient += `\n\nContext: ${signal.notes}`;
  if (signal.aiSummary) whyClient += `\n\nAI Summary: ${signal.aiSummary}`;

  // Recent Buying Signals
  const recentBuyingSignals: string[] = [];
  if (signal.signalType) recentBuyingSignals.push(`Signal type detected: ${signal.signalType}`);
  if (signal.sourceType) recentBuyingSignals.push(`Source: ${signal.sourceType}${signal.sourceLink ? ` (${signal.sourceLink})` : ''}`);
  if (signal.dateCaptured) recentBuyingSignals.push(`Captured on: ${signal.dateCaptured}`);
  if (signal.opportunityScore && signal.opportunityScore >= 60) recentBuyingSignals.push(`Opportunity score above threshold (${signal.opportunityScore}/100)`);
  if (pipeline) recentBuyingSignals.push(`Already in pipeline at stage: ${pipeline.stage}`);
  if (signal.fileUrl) recentBuyingSignals.push(`Supporting document attached: ${signal.fileName || 'file'}`);
  if (recentBuyingSignals.length === 0) recentBuyingSignals.push('No specific buying signals recorded yet.');

  // Suggested Outreach
  const suggestedOutreach: string[] = [];
  if (signal.contactName && signal.contactEmail) {
    suggestedOutreach.push(`Email ${signal.contactName} (${signal.contactRole || 'Contact'}) at ${signal.contactEmail}`);
  } else if (signal.contactName) {
    suggestedOutreach.push(`Reach out to ${signal.contactName}${signal.contactRole ? ` (${signal.contactRole})` : ''}`);
  }
  if (signal.website) suggestedOutreach.push(`Research company website: ${signal.website}`);
  if (signal.recommendedAction) suggestedOutreach.push(signal.recommendedAction);
  if (!pipeline) {
    suggestedOutreach.push('Move to pipeline to begin formal engagement process.');
  } else if (pipeline.stage === 'lead') {
    suggestedOutreach.push('Schedule discovery call to understand needs.');
  } else if (pipeline.stage === 'discovery') {
    suggestedOutreach.push('Prepare proposal based on discovery findings.');
  }
  if (suggestedOutreach.length === 0) suggestedOutreach.push('Gather contact information and initiate first touchpoint.');

  // Priority Level
  let priorityLevel = 'Normal';
  let priorityReasoning = '';
  if (signal.opportunityScore && signal.opportunityScore >= 80) {
    priorityLevel = 'High';
    priorityReasoning = `High opportunity score (${signal.opportunityScore}/100) combined with `;
  } else if (signal.opportunityScore && signal.opportunityScore >= 60) {
    priorityLevel = 'Medium-High';
    priorityReasoning = `Above-average opportunity score (${signal.opportunityScore}/100). `;
  } else if (signal.opportunityScore && signal.opportunityScore < 40) {
    priorityLevel = 'Low';
    priorityReasoning = `Low opportunity score (${signal.opportunityScore}/100). `;
  } else {
    priorityReasoning = 'Standard priority based on available data. ';
  }
  if (signal.signalType === 'hot_lead' || signal.signalType === 'referral') {
    priorityLevel = 'Urgent';
    priorityReasoning += 'Signal type indicates immediate action needed.';
  }
  if (pipeline && pipeline.stage === 'proposal') {
    priorityLevel = 'High';
    priorityReasoning += 'Active proposal stage — close attention required.';
  }

  // Company Profile
  let companyProfile = signal.companyName;
  if (signal.industry) companyProfile += ` | Industry: ${signal.industry}`;
  if (signal.website) companyProfile += ` | Website: ${signal.website}`;
  if (signal.contactName) companyProfile += `\nPrimary Contact: ${signal.contactName}`;
  if (signal.contactRole) companyProfile += ` (${signal.contactRole})`;
  if (signal.contactEmail) companyProfile += ` — ${signal.contactEmail}`;

  // Recommended Next Actions
  const recommendedNextActions: string[] = [];
  if (relatedTasks.length > 0) {
    const pendingTasks = relatedTasks.filter(t => t.status !== 'completed');
    if (pendingTasks.length > 0) {
      recommendedNextActions.push(...pendingTasks.slice(0, 3).map(t => t.title));
    }
  }
  if (!pipeline) recommendedNextActions.push('Add to pipeline to track engagement formally.');
  if (!signal.contactEmail) recommendedNextActions.push('Find contact email for direct outreach.');
  if (!signal.website) recommendedNextActions.push('Research company website and online presence.');
  if (recommendedNextActions.length === 0) recommendedNextActions.push('Continue monitoring for additional signals.');

  // Missing Information
  const missingInformation: string[] = [];
  if (!signal.contactEmail) missingInformation.push('Contact email missing — needed for outreach.');
  if (!signal.website) missingInformation.push('Company website not recorded.');
  if (!signal.industry) missingInformation.push('Industry not specified.');
  if (!signal.opportunityScore) missingInformation.push('No opportunity score assigned.');
  if (!signal.notes && !signal.aiSummary) missingInformation.push('No notes or AI summary — add context about this opportunity.');
  if (missingInformation.length === 0) missingInformation.push('Signal data is comprehensive.');

  return {
    whyClient,
    recentBuyingSignals,
    suggestedOutreach,
    priorityLevel,
    priorityReasoning,
    companyProfile,
    recommendedNextActions,
    missingInformation,
    generatedAt: new Date().toISOString(),
    dataSnapshot: {
      opportunityScore: signal.opportunityScore,
      signalType: signal.signalType,
      hasPipeline: !!pipeline,
      pipelineStage: pipeline?.stage || null,
      relatedTasks: relatedTasks.length,
    },
  };
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
export const aiBriefRouter = router({
  // Generate brief for a workspace
  generateWorkspaceBrief: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Collect all workspace data
      const rawData = await collectWorkspaceData(input.workspaceId);
      
      // Generate structured brief
      const briefContent = generateWorkspaceBrief(rawData);

      // Save to database
      const result = await db.insert(aiBriefs).values({
        sourceType: 'workspace',
        sourceId: input.workspaceId,
        sourceName: rawData.workspace.name,
        briefType: rawData.workspace.type,
        content: briefContent,
        rawData: {
          workspace: rawData.workspace,
          taskCount: rawData.tasks.length,
          noteCount: rawData.notes.length,
          documentCount: rawData.documents.length,
          timelineCount: rawData.timeline.length,
          nextActionCount: rawData.nextActions.length,
        },
        metadata: {
          generator: 'rule_based_v1',
          llmModel: null, // Future: 'gpt-4', 'claude-3', etc.
          tokensUsed: null,
        },
      });

      return {
        id: Number(result[0].insertId),
        content: briefContent,
        generatedAt: briefContent.generatedAt,
      };
    }),

  // Generate brief for a signal
  generateSignalBrief: adminProcedure
    .input(z.object({ signalId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Collect all signal data
      const rawData = await collectSignalData(input.signalId);
      
      // Generate structured brief
      const briefContent = generateSignalBrief(rawData);

      // Save to database
      const result = await db.insert(aiBriefs).values({
        sourceType: 'signal',
        sourceId: input.signalId,
        sourceName: rawData.signal.companyName,
        briefType: 'signal',
        content: briefContent,
        rawData: {
          signal: rawData.signal,
          pipeline: rawData.pipeline,
          relatedTaskCount: rawData.relatedTasks.length,
        },
        metadata: {
          generator: 'rule_based_v1',
          llmModel: null,
          tokensUsed: null,
        },
      });

      return {
        id: Number(result[0].insertId),
        content: briefContent,
        generatedAt: briefContent.generatedAt,
      };
    }),

  // List briefs for a source (workspace or signal)
  list: adminProcedure
    .input(z.object({
      sourceType: z.enum(['workspace', 'signal']),
      sourceId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(aiBriefs)
        .where(and(eq(aiBriefs.sourceType, input.sourceType), eq(aiBriefs.sourceId, input.sourceId)))
        .orderBy(desc(aiBriefs.generatedAt));
    }),

  // Get a specific brief by ID
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const results = await db.select().from(aiBriefs).where(eq(aiBriefs.id, input.id)).limit(1);
      if (results.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return results[0];
    }),

  // Delete a brief
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(aiBriefs).where(eq(aiBriefs.id, input.id));
      return { success: true };
    }),
});
