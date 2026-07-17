/**
 * Workspaces Router — Full CRUD for workspaces and sub-entities
 * Tasks, Notes, Documents, Timeline, Next Actions
 */
import { TRPCError } from "@trpc/server";
import { desc, eq, sql, ne, and, like, or } from "drizzle-orm";
import { z } from "zod";
import {
  workspaces,
  workspaceTasks,
  workspaceNotes,
  workspaceDocuments,
  workspaceTimeline,
  workspaceNextActions,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

// Helper: log timeline event
async function logTimeline(workspaceId: number, event: string, eventType: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(workspaceTimeline).values({ workspaceId, event, eventType });
}

// ── WORKSPACES CRUD ───────────────────────────────────────────────────────────
const workspacesCrud = router({
  list: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let query = db.select().from(workspaces);
      const conditions: any[] = [];

      if (input?.status && input.status !== 'all') {
        conditions.push(eq(workspaces.status, input.status as any));
      } else {
        // By default exclude archived
        conditions.push(ne(workspaces.status, 'archived'));
      }

      if (input?.type && input.type !== 'all') {
        conditions.push(eq(workspaces.type, input.type as any));
      }

      if (input?.priority && input.priority !== 'all') {
        conditions.push(eq(workspaces.priority, input.priority as any));
      }

      if (input?.search) {
        conditions.push(like(workspaces.name, `%${input.search}%`));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      return (query as any).orderBy(desc(workspaces.updatedAt));
    }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const results = await db.select().from(workspaces).where(eq(workspaces.id, input.id)).limit(1);
      if (results.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return results[0];
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      type: z.enum(['internal_case', 'consumer_case', 'client_project', 'business_project']),
      description: z.string().optional(),
      status: z.enum(['planning', 'active', 'waiting', 'completed', 'archived']).optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      assignedTo: z.string().max(255).optional(),
      dueDate: z.string().max(50).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(workspaces).values({
        name: input.name,
        type: input.type,
        description: input.description || null,
        status: input.status || 'planning',
        priority: input.priority || 'normal',
        assignedTo: input.assignedTo || null,
        dueDate: input.dueDate || null,
        notes: input.notes || null,
      });
      const id = Number(result[0].insertId);
      await logTimeline(id, 'Workspace Created', 'workspace_created');
      return { success: true, id };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      type: z.enum(['internal_case', 'consumer_case', 'client_project', 'business_project']).optional(),
      description: z.string().optional().nullable(),
      status: z.enum(['planning', 'active', 'waiting', 'completed', 'archived']).optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      assignedTo: z.string().max(255).optional().nullable(),
      dueDate: z.string().max(50).optional().nullable(),
      notes: z.string().optional().nullable(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...rest } = input;

      // Check if status changed for timeline
      if (rest.status) {
        const [current] = await db.select({ status: workspaces.status }).from(workspaces).where(eq(workspaces.id, id)).limit(1);
        if (current && current.status !== rest.status) {
          await logTimeline(id, `Status changed to ${rest.status}`, 'status_changed');
        }
      }

      await db.update(workspaces).set(rest).where(eq(workspaces.id, id));
      return { success: true };
    }),

  archive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(workspaces).set({ status: 'archived' }).where(eq(workspaces.id, input.id));
      await logTimeline(input.id, 'Workspace Archived', 'workspace_archived');
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Delete all related records
      await db.delete(workspaceTasks).where(eq(workspaceTasks.workspaceId, input.id));
      await db.delete(workspaceNotes).where(eq(workspaceNotes.workspaceId, input.id));
      await db.delete(workspaceDocuments).where(eq(workspaceDocuments.workspaceId, input.id));
      await db.delete(workspaceTimeline).where(eq(workspaceTimeline.workspaceId, input.id));
      await db.delete(workspaceNextActions).where(eq(workspaceNextActions.workspaceId, input.id));
      await db.delete(workspaces).where(eq(workspaces.id, input.id));
      return { success: true };
    }),

  metrics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [open] = await db.select({ count: sql<number>`count(*)` }).from(workspaces).where(and(ne(workspaces.status, 'archived'), ne(workspaces.status, 'completed')));
    const [waiting] = await db.select({ count: sql<number>`count(*)` }).from(workspaces).where(eq(workspaces.status, 'waiting'));
    const [completedWeek] = await db.select({ count: sql<number>`count(*)` }).from(workspaces).where(and(eq(workspaces.status, 'completed'), sql`updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`));
    // Due today: workspaces with due_date = today
    const today = new Date().toISOString().split('T')[0];
    const [dueToday] = await db.select({ count: sql<number>`count(*)` }).from(workspaces).where(and(eq(workspaces.dueDate, today), ne(workspaces.status, 'completed'), ne(workspaces.status, 'archived')));
    return {
      openWorkspaces: open.count,
      dueToday: dueToday.count,
      waiting: waiting.count,
      completedThisWeek: completedWeek.count,
    };
  }),
});

// ── WORKSPACE TASKS ───────────────────────────────────────────────────────────
const tasksRouter = router({
  list: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(workspaceTasks).where(eq(workspaceTasks.workspaceId, input.workspaceId)).orderBy(desc(workspaceTasks.createdAt));
    }),

  add: adminProcedure
    .input(z.object({
      workspaceId: z.number(),
      title: z.string().min(1).max(500),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      dueDate: z.string().max(50).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(workspaceTasks).values({
        workspaceId: input.workspaceId,
        title: input.title,
        priority: input.priority || 'normal',
        dueDate: input.dueDate || null,
        notes: input.notes || null,
        status: 'pending',
      });
      await logTimeline(input.workspaceId, `Task Added: ${input.title}`, 'task_added');
      return { success: true };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(500).optional(),
      status: z.enum(['pending', 'in_progress', 'completed']).optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      dueDate: z.string().max(50).optional().nullable(),
      notes: z.string().optional().nullable(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...rest } = input;
      await db.update(workspaceTasks).set(rest).where(eq(workspaceTasks.id, id));
      return { success: true };
    }),

  complete: adminProcedure
    .input(z.object({ id: z.number(), workspaceId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [task] = await db.select({ title: workspaceTasks.title }).from(workspaceTasks).where(eq(workspaceTasks.id, input.id)).limit(1);
      await db.update(workspaceTasks).set({ status: 'completed' }).where(eq(workspaceTasks.id, input.id));
      if (task) await logTimeline(input.workspaceId, `Task Completed: ${task.title}`, 'task_completed');
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(workspaceTasks).where(eq(workspaceTasks.id, input.id));
      return { success: true };
    }),
});

// ── WORKSPACE NOTES ───────────────────────────────────────────────────────────
const notesRouter = router({
  list: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(workspaceNotes).where(eq(workspaceNotes.workspaceId, input.workspaceId)).orderBy(desc(workspaceNotes.createdAt));
    }),

  add: adminProcedure
    .input(z.object({
      workspaceId: z.number(),
      content: z.string().min(1),
      author: z.string().max(255).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(workspaceNotes).values({
        workspaceId: input.workspaceId,
        content: input.content,
        author: input.author || 'Demarcus',
      });
      await logTimeline(input.workspaceId, 'Note Added', 'note_added');
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(workspaceNotes).where(eq(workspaceNotes.id, input.id));
      return { success: true };
    }),
});

// ── WORKSPACE DOCUMENTS ───────────────────────────────────────────────────────
const documentsRouter = router({
  list: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(workspaceDocuments).where(eq(workspaceDocuments.workspaceId, input.workspaceId)).orderBy(desc(workspaceDocuments.uploadedAt));
    }),

  upload: adminProcedure
    .input(z.object({
      workspaceId: z.number(),
      fileName: z.string(),
      fileData: z.string(), // base64
      mimeType: z.string(),
      fileSize: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const buffer = Buffer.from(input.fileData, 'base64');
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `workspaces/${input.workspaceId}/${randomSuffix}-${input.fileName}`;

      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Determine file type from extension
      const ext = input.fileName.split('.').pop()?.toLowerCase() || '';

      await db.insert(workspaceDocuments).values({
        workspaceId: input.workspaceId,
        fileName: input.fileName,
        fileUrl: url,
        fileType: ext,
        fileSize: input.fileSize || buffer.length,
      });

      await logTimeline(input.workspaceId, `Document Uploaded: ${input.fileName}`, 'document_uploaded');
      return { success: true, url };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number(), workspaceId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(workspaceDocuments).where(eq(workspaceDocuments.id, input.id));
      await logTimeline(input.workspaceId, 'Document Deleted', 'document_deleted');
      return { success: true };
    }),
});

// ── WORKSPACE TIMELINE ────────────────────────────────────────────────────────
const timelineRouter = router({
  list: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(workspaceTimeline).where(eq(workspaceTimeline.workspaceId, input.workspaceId)).orderBy(desc(workspaceTimeline.createdAt));
    }),
});

// ── WORKSPACE NEXT ACTIONS ────────────────────────────────────────────────────
const nextActionsRouter = router({
  list: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(workspaceNextActions).where(eq(workspaceNextActions.workspaceId, input.workspaceId)).orderBy(desc(workspaceNextActions.createdAt));
    }),

  add: adminProcedure
    .input(z.object({
      workspaceId: z.number(),
      action: z.string().min(1).max(500),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(workspaceNextActions).values({
        workspaceId: input.workspaceId,
        action: input.action,
        completed: 0,
      });
      return { success: true };
    }),

  toggle: adminProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(workspaceNextActions).set({ completed: input.completed ? 1 : 0 }).where(eq(workspaceNextActions.id, input.id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(workspaceNextActions).where(eq(workspaceNextActions.id, input.id));
      return { success: true };
    }),
});

// ── COMBINED WORKSPACES ROUTER ────────────────────────────────────────────────
export const workspacesRouter = router({
  workspaces: workspacesCrud,
  tasks: tasksRouter,
  notes: notesRouter,
  documents: documentsRouter,
  timeline: timelineRouter,
  nextActions: nextActionsRouter,
});
