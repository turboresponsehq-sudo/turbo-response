/**
 * Mission Control Router — Turbo Signals, Pipeline, Tasks
 * Full CRUD with persistent database storage
 */
import { TRPCError } from "@trpc/server";
import { asc, desc, eq, sql, and, ne } from "drizzle-orm";
import { z } from "zod";
import { turboSignals, pipelineOpportunities, missionTasks } from "../../drizzle/schema";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";

// Guard: admin only
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

// ── TURBO SIGNALS ─────────────────────────────────────────────────────────────
const signalsRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(turboSignals).orderBy(desc(turboSignals.createdAt));
  }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const results = await db.select().from(turboSignals).where(eq(turboSignals.id, input.id)).limit(1);
      if (results.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return results[0];
    }),

  add: adminProcedure
    .input(z.object({
      companyName: z.string().min(1).max(255),
      website: z.string().max(500).optional(),
      industry: z.string().max(100).optional(),
      contactName: z.string().max(255).optional(),
      contactRole: z.string().max(255).optional(),
      contactEmail: z.string().max(320).optional(),
      sourceType: z.string().max(50).optional(),
      sourceLink: z.string().max(1000).optional(),
      signalType: z.string().max(50).optional(),
      dateCaptured: z.string().max(50).optional(),
      notes: z.string().optional(),
      aiSummary: z.string().optional(),
      recommendedAction: z.string().optional(),
      opportunityScore: z.number().min(0).max(100).optional(),
      fileUrl: z.string().optional(),
      fileName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(turboSignals).values({
        companyName: input.companyName,
        website: input.website || null,
        industry: input.industry || null,
        contactName: input.contactName || null,
        contactRole: input.contactRole || null,
        contactEmail: input.contactEmail || null,
        sourceType: input.sourceType || null,
        sourceLink: input.sourceLink || null,
        signalType: input.signalType || null,
        dateCaptured: input.dateCaptured || new Date().toISOString().split('T')[0],
        notes: input.notes || null,
        aiSummary: input.aiSummary || null,
        recommendedAction: input.recommendedAction || null,
        opportunityScore: input.opportunityScore ?? null,
        fileUrl: input.fileUrl || null,
        fileName: input.fileName || null,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      companyName: z.string().min(1).max(255).optional(),
      website: z.string().max(500).optional().nullable(),
      industry: z.string().max(100).optional().nullable(),
      contactName: z.string().max(255).optional().nullable(),
      contactRole: z.string().max(255).optional().nullable(),
      contactEmail: z.string().max(320).optional().nullable(),
      sourceType: z.string().max(50).optional().nullable(),
      sourceLink: z.string().max(1000).optional().nullable(),
      signalType: z.string().max(50).optional().nullable(),
      dateCaptured: z.string().max(50).optional().nullable(),
      notes: z.string().optional().nullable(),
      aiSummary: z.string().optional().nullable(),
      recommendedAction: z.string().optional().nullable(),
      opportunityScore: z.number().min(0).max(100).optional().nullable(),
      fileUrl: z.string().optional().nullable(),
      fileName: z.string().optional().nullable(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...rest } = input;
      await db.update(turboSignals).set(rest).where(eq(turboSignals.id, id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(turboSignals).where(eq(turboSignals.id, input.id));
      return { success: true };
    }),

  uploadFile: adminProcedure
    .input(z.object({
      signalId: z.number(),
      fileData: z.string(), // base64 encoded
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const buffer = Buffer.from(input.fileData, 'base64');
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `mission-control/signals/${input.signalId}-${randomSuffix}-${input.fileName}`;
      
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      
      await db.update(turboSignals).set({
        fileUrl: url,
        fileName: input.fileName,
      }).where(eq(turboSignals.id, input.signalId));
      
      return { success: true, url, fileName: input.fileName };
    }),
});

// ── PIPELINE ──────────────────────────────────────────────────────────────────
const pipelineRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(pipelineOpportunities).orderBy(desc(pipelineOpportunities.createdAt));
  }),

  addFromSignal: adminProcedure
    .input(z.object({ signalId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Check if already in pipeline
      const existing = await db.select().from(pipelineOpportunities)
        .where(eq(pipelineOpportunities.signalId, input.signalId)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Company already in pipeline" });
      }
      
      // Get signal data
      const signals = await db.select().from(turboSignals)
        .where(eq(turboSignals.id, input.signalId)).limit(1);
      if (signals.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      
      const signal = signals[0];
      
      const result = await db.insert(pipelineOpportunities).values({
        signalId: input.signalId,
        companyName: signal.companyName,
        contactName: signal.contactName,
        contactEmail: signal.contactEmail,
        opportunityScore: signal.opportunityScore,
        recommendedAction: signal.recommendedAction,
        stage: 'lead',
      });
      
      const pipelineId = Number(result[0].insertId);
      
      // Link back to signal
      await db.update(turboSignals).set({ pipelineId }).where(eq(turboSignals.id, input.signalId));
      
      return { success: true, id: pipelineId };
    }),

  updateStage: adminProcedure
    .input(z.object({
      id: z.number(),
      stage: z.enum(['lead', 'discovery', 'proposal', 'client', 'completed']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(pipelineOpportunities).set({ stage: input.stage }).where(eq(pipelineOpportunities.id, input.id));
      return { success: true };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      value: z.string().optional().nullable(),
      nextStep: z.string().optional().nullable(),
      followUpDate: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      stage: z.enum(['lead', 'discovery', 'proposal', 'client', 'completed']).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...rest } = input;
      await db.update(pipelineOpportunities).set(rest).where(eq(pipelineOpportunities.id, id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Also unlink from signal
      await db.update(turboSignals).set({ pipelineId: null })
        .where(eq(turboSignals.pipelineId, input.id));
      await db.delete(pipelineOpportunities).where(eq(pipelineOpportunities.id, input.id));
      return { success: true };
    }),
});

// ── TASKS ─────────────────────────────────────────────────────────────────────
const tasksRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(missionTasks)
      .where(ne(missionTasks.status, 'completed'))
      .orderBy(asc(missionTasks.dueDate));
  }),

  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(missionTasks).orderBy(desc(missionTasks.createdAt));
  }),

  add: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      companyName: z.string().max(255).optional(),
      contactName: z.string().max(255).optional(),
      signalId: z.number().optional(),
      dueDate: z.string().max(50).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(missionTasks).values({
        title: input.title,
        companyName: input.companyName || null,
        contactName: input.contactName || null,
        signalId: input.signalId ?? null,
        dueDate: input.dueDate || null,
        priority: input.priority ?? 'medium',
        notes: input.notes || null,
        status: 'pending',
      });
      return { success: true };
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'in_progress', 'completed']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(missionTasks).set({ status: input.status }).where(eq(missionTasks.id, input.id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(missionTasks).where(eq(missionTasks.id, input.id));
      return { success: true };
    }),
});

// ── DASHBOARD METRICS ─────────────────────────────────────────────────────────
const metricsRouter = router({
  summary: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    
    const [signalCount] = await db.select({ count: sql<number>`count(*)` }).from(turboSignals);
    const [taskCount] = await db.select({ count: sql<number>`count(*)` }).from(missionTasks).where(ne(missionTasks.status, 'completed'));
    const [pipelineData] = await db.select({ 
      count: sql<number>`count(*)`,
      totalValue: sql<string>`COALESCE(SUM(value), 0)`,
    }).from(pipelineOpportunities).where(ne(pipelineOpportunities.stage, 'completed'));
    const [clientCount] = await db.select({ count: sql<number>`count(*)` }).from(pipelineOpportunities).where(eq(pipelineOpportunities.stage, 'client'));
    
    return {
      signals: signalCount.count,
      tasks: taskCount.count,
      pipelineCount: pipelineData.count,
      pipelineValue: pipelineData.totalValue,
      activeClients: clientCount.count,
    };
  }),
});

// ── COMBINED MISSION CONTROL ROUTER ───────────────────────────────────────────
export const missionControlRouter = router({
  signals: signalsRouter,
  pipeline: pipelineRouter,
  tasks: tasksRouter,
  metrics: metricsRouter,
});
