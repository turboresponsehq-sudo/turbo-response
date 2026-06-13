/**
 * Dashboard Router — Layer 1 Core Operations
 * Handles CRUD for: priorities (CEO Home), projects (with Drive links), tasks, leads (with HubSpot links)
 * All procedures are admin-only
 *
 * Architecture note:
 * - CEO Home priorities: owned by this DB
 * - Projects: stored here with Google Drive URL; future upgrade = Google Sheets API
 * - Tasks: NOT stored here — dashboard links to Google Tasks directly
 * - Leads: stored here as display layer; future upgrade = live HubSpot API pull
 */
import { TRPCError } from "@trpc/server";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { dashboardLeads, priorities, projects, tasks } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

// Guard: admin only
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

// ── PRIORITIES (CEO Home) ─────────────────────────────────────────────────────
const prioritiesRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(priorities).orderBy(desc(priorities.urgent), asc(priorities.createdAt));
  }),

  add: adminProcedure
    .input(z.object({ text: z.string().min(1).max(500), urgent: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(priorities).values({ text: input.text, urgent: input.urgent ? 1 : 0, done: 0 });
      return { success: true };
    }),

  toggle: adminProcedure
    .input(z.object({ id: z.number(), done: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(priorities).set({ done: input.done ? 1 : 0 }).where(eq(priorities.id, input.id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(priorities).where(eq(priorities.id, input.id));
      return { success: true };
    }),

  clearDone: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(priorities).where(eq(priorities.done, 1));
    return { success: true };
  }),
});

// ── PROJECTS (with Google Drive link) ────────────────────────────────────────
const projectsRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(projects).orderBy(asc(projects.createdAt));
  }),

  add: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      status: z.enum(["active", "paused", "done"]).optional(),
      progress: z.number().min(0).max(100).optional(),
      nextStep: z.string().max(500).optional(),
      objective: z.string().optional(),
      notes: z.string().optional(),
      /** Google Drive folder or doc URL */
      driveUrl: z.string().url().optional().or(z.literal("")),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(projects).values({
        name: input.name,
        status: input.status ?? "active",
        progress: input.progress ?? 0,
        nextStep: input.nextStep ?? null,
        objective: input.objective ?? null,
        notes: input.notes ?? null,
        driveUrl: input.driveUrl || null,
      });
      return { success: true };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      status: z.enum(["active", "paused", "done"]).optional(),
      progress: z.number().min(0).max(100).optional(),
      nextStep: z.string().max(500).optional().nullable(),
      objective: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      driveUrl: z.string().optional().nullable(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...rest } = input;
      await db.update(projects).set(rest).where(eq(projects.id, id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),
});

// ── TASKS — no DB storage, just a passthrough for the Google Tasks URL ────────
// Tasks live in Google Tasks. This router is a placeholder for future API integration.
const tasksRouter = router({
  // Future: list tasks from Google Tasks API
  // Future: add task to Google Tasks API
  ping: adminProcedure.query(() => ({
    googleTasksUrl: "https://tasks.google.com/tasks/?pli=1",
    message: "Tasks are managed in Google Tasks. Use the link to open.",
  })),
});

// ── LEADS (display layer — HubSpot is source of truth) ───────────────────────
const leadsRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(dashboardLeads).orderBy(desc(dashboardLeads.createdAt));
  }),

  add: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      status: z.enum(["new", "reviewing", "follow_up", "converted", "closed"]).optional(),
      note: z.string().max(500).optional(),
      /** Direct link to HubSpot contact or deal */
      hubspotUrl: z.string().url().optional().or(z.literal("")),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(dashboardLeads).values({
        name: input.name,
        status: input.status ?? "new",
        note: input.note ?? null,
        hubspotUrl: input.hubspotUrl || null,
      });
      return { success: true };
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "reviewing", "follow_up", "converted", "closed"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(dashboardLeads).set({ status: input.status }).where(eq(dashboardLeads.id, input.id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(dashboardLeads).where(eq(dashboardLeads.id, input.id));
      return { success: true };
    }),
});

// ── COMBINED DASHBOARD ROUTER ─────────────────────────────────────────────────
export const dashboardRouter = router({
  priorities: prioritiesRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  leads: leadsRouter,
});
