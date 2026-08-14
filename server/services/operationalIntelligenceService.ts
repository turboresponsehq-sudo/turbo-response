import { and, eq, ne } from "drizzle-orm";
import { missionTasks, pipelineOpportunities, turboSignals } from "../../drizzle/schema";
import { getDb } from "../db";

type OperationalEvent = {
  eventKey: string;
  sourceType: string;
  sourceId: number;
  label: string;
  contactName?: string | null;
  contactEmail?: string | null;
  sourceLink?: string | null;
  signalType: string;
  taskTitle: string;
  taskPriority: "low" | "medium" | "high" | "urgent";
  notes: string;
  createPipeline?: boolean;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Produce one durable Signal and Task from a real source event. The event key is
 * unique in production, so retries cannot inflate the operator's queue.
 */
export async function recordOperationalEvent(event: OperationalEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(turboSignals).values({
    companyName: event.label,
    contactName: event.contactName || null,
    contactEmail: event.contactEmail || null,
    sourceType: event.sourceType,
    sourceLink: event.sourceLink || null,
    signalType: event.signalType,
    dateCaptured: today(),
    notes: event.notes,
    recommendedAction: event.taskTitle,
    sourceEventKey: event.eventKey,
    sourceEntityType: event.sourceType,
    sourceEntityId: event.sourceId,
  }).onConflictDoNothing();

  const [signal] = await db.select().from(turboSignals)
    .where(eq(turboSignals.sourceEventKey, event.eventKey)).limit(1);
  if (!signal) throw new Error(`Operational signal was not available for ${event.eventKey}`);

  if (event.createPipeline) {
    await db.insert(pipelineOpportunities).values({
      signalId: signal.id,
      companyName: event.label,
      contactName: event.contactName || null,
      contactEmail: event.contactEmail || null,
      recommendedAction: event.taskTitle,
      stage: "lead",
      nextStep: event.taskTitle,
      followUpDate: today(),
    }).onConflictDoNothing();

    const [pipeline] = await db.select().from(pipelineOpportunities)
      .where(eq(pipelineOpportunities.signalId, signal.id)).limit(1);
    if (pipeline && signal.pipelineId !== pipeline.id) {
      await db.update(turboSignals).set({ pipelineId: pipeline.id }).where(eq(turboSignals.id, signal.id));
    }
  }

  await db.insert(missionTasks).values({
    title: event.taskTitle,
    companyName: event.label,
    contactName: event.contactName || null,
    signalId: signal.id,
    dueDate: today(),
    priority: event.taskPriority,
    notes: event.notes,
    status: "pending",
    sourceEventKey: event.eventKey,
    sourceEntityType: event.sourceType,
    sourceEntityId: event.sourceId,
  }).onConflictDoNothing();

  return { signalId: signal.id };
}

export async function resolveOperationalEvent(eventKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(missionTasks)
    .set({ status: "completed" })
    .where(and(eq(missionTasks.sourceEventKey, eventKey), ne(missionTasks.status, "completed")));
}

export function newIntakeEvent(input: {
  leadId: number;
  fullName: string;
  email: string;
  source: string;
}) : OperationalEvent {
  const sourceLabel = input.source.replace(/[-_]/g, " ");
  return {
    eventKey: `intake-lead:${input.leadId}`,
    sourceType: "intake_lead",
    sourceId: input.leadId,
    label: input.fullName,
    contactName: input.fullName,
    contactEmail: input.email,
    sourceLink: "/admin/command-center",
    signalType: "new_lead",
    taskTitle: `Review new ${sourceLabel} intake from ${input.fullName}`,
    taskPriority: "high",
    notes: `Real ${sourceLabel} intake received. Review the submitted information and determine the next action.`,
    createPipeline: true,
  };
}

export function newChatLeadEvent(input: {
  leadId: number;
  name: string;
  email: string;
  category?: string | null;
}): OperationalEvent {
  return {
    eventKey: `chat-lead:${input.leadId}`,
    sourceType: "chat_lead",
    sourceId: input.leadId,
    label: input.name,
    contactName: input.name,
    contactEmail: input.email,
    sourceLink: "/admin/command-center",
    signalType: "new_lead",
    taskTitle: `Follow up with new chat lead ${input.name}`,
    taskPriority: "high",
    notes: `Real conversational intake${input.category ? ` for ${input.category}` : ""} submitted contact information.`,
    createPipeline: true,
  };
}

export function clientMessageEvent(input: {
  caseId: number;
  messageId: number;
  senderName?: string | null;
}): OperationalEvent {
  const label = `Case #${input.caseId}`;
  return {
    eventKey: `case-message:${input.messageId}`,
    sourceType: "case_message",
    sourceId: input.messageId,
    label,
    contactName: input.senderName || "Client",
    sourceLink: "/admin/command-center",
    signalType: "client_message",
    taskTitle: `Review new client message for ${label}`,
    taskPriority: "high",
    notes: "A real client message is unread and requires owner review.",
  };
}

export function xaiSyncFailureEvent(input: { documentId: number; error?: string }) : OperationalEvent {
  return {
    eventKey: `xai-sync:${input.documentId}`,
    sourceType: "knowledge_sync",
    sourceId: input.documentId,
    label: `Knowledge Base document #${input.documentId}`,
    sourceLink: "/admin/command-center",
    signalType: "sync_failure",
    taskTitle: `Resolve xAI sync failure for Knowledge Base document #${input.documentId}`,
    taskPriority: "high",
    notes: `Real xAI sync failed: ${input.error || "No error detail returned"}`,
  };
}

export async function recordNewIntakeLead(input: { leadId: number; fullName: string; email: string; source: string }) {
  return recordOperationalEvent(newIntakeEvent(input));
}

export async function recordNewChatLead(input: { leadId: number; name: string; email: string; category?: string | null }) {
  return recordOperationalEvent(newChatLeadEvent(input));
}

export async function recordClientMessage(input: { caseId: number; messageId: number; senderName?: string | null }) {
  return recordOperationalEvent(clientMessageEvent(input));
}

export async function recordXaiSyncFailure(input: { documentId: number; error?: string }) {
  return recordOperationalEvent(xaiSyncFailureEvent(input));
}
