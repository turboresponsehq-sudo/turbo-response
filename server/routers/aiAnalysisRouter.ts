/**
 * AI Analysis Router — CRUD for workspace AI analyses
 * Users paste AI responses from ChatGPT, Manus, Claude, Gemini, Grok, Perplexity
 * Future: API-generated analyses, multi-model comparisons, confidence scores
 */
import { TRPCError } from "@trpc/server";
import { desc, eq, and, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { workspaceAiAnalyses, workspaceTimeline } from "../../drizzle/schema";
import { getDb } from "../db";
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

const aiSourceEnum = z.enum(['chatgpt', 'manus', 'claude', 'gemini', 'grok', 'perplexity', 'notebooklm', 'other']);
const analysisTypeEnum = z.enum(['strategy', 'research', 'case_review', 'risk_assessment', 'document_review', 'client_recommendation', 'sales_intelligence', 'general_notes']);

export const aiAnalysisRouter = router({
  // List analyses for a workspace with optional search/filters
  list: adminProcedure
    .input(z.object({
      workspaceId: z.number(),
      search: z.string().optional(),
      aiSource: z.string().optional(),
      analysisType: z.string().optional(),
      tag: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions: any[] = [eq(workspaceAiAnalyses.workspaceId, input.workspaceId)];

      if (input.aiSource && input.aiSource !== 'all') {
        conditions.push(eq(workspaceAiAnalyses.aiSource, input.aiSource));
      }

      if (input.analysisType && input.analysisType !== 'all') {
        conditions.push(eq(workspaceAiAnalyses.analysisType, input.analysisType));
      }

      if (input.search) {
        conditions.push(
          or(
            like(workspaceAiAnalyses.title, `%${input.search}%`),
            like(workspaceAiAnalyses.content, `%${input.search}%`)
          )
        );
      }

      const results = await db.select().from(workspaceAiAnalyses)
        .where(and(...conditions))
        .orderBy(desc(workspaceAiAnalyses.createdAt));

      // Filter by tag in application layer (JSON column)
      if (input.tag) {
        return results.filter((r: any) => {
          const tags = r.tags as string[] | null;
          return tags && tags.some(t => t.toLowerCase().includes(input.tag!.toLowerCase()));
        });
      }

      return results;
    }),

  // Get a single analysis by ID
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const results = await db.select().from(workspaceAiAnalyses).where(eq(workspaceAiAnalyses.id, input.id)).limit(1);
      if (results.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return results[0];
    }),

  // Create a new analysis
  create: adminProcedure
    .input(z.object({
      workspaceId: z.number(),
      title: z.string().min(1).max(500),
      aiSource: aiSourceEnum,
      analysisType: analysisTypeEnum,
      content: z.string().min(1),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db.insert(workspaceAiAnalyses).values({
        workspaceId: input.workspaceId,
        title: input.title,
        aiSource: input.aiSource,
        analysisType: input.analysisType,
        content: input.content,
        tags: input.tags || null,
        generatedBy: 'manual',
      });

      // Log to timeline
      await logTimeline(input.workspaceId, `AI Analysis Added: "${input.title}" (${input.aiSource})`, 'ai_analysis');

      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update an existing analysis
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(500).optional(),
      aiSource: aiSourceEnum.optional(),
      analysisType: analysisTypeEnum.optional(),
      content: z.string().min(1).optional(),
      tags: z.array(z.string()).optional().nullable(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Get existing to find workspaceId for timeline
      const [existing] = await db.select().from(workspaceAiAnalyses).where(eq(workspaceAiAnalyses.id, input.id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.aiSource !== undefined) updateData.aiSource = input.aiSource;
      if (input.analysisType !== undefined) updateData.analysisType = input.analysisType;
      if (input.content !== undefined) updateData.content = input.content;
      if (input.tags !== undefined) updateData.tags = input.tags;

      if (Object.keys(updateData).length > 0) {
        await db.update(workspaceAiAnalyses).set(updateData).where(eq(workspaceAiAnalyses.id, input.id));
        await logTimeline(existing.workspaceId, `AI Analysis Updated: "${input.title || existing.title}"`, 'ai_analysis');
      }

      return { success: true };
    }),

  // Delete an analysis
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] = await db.select().from(workspaceAiAnalyses).where(eq(workspaceAiAnalyses.id, input.id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(workspaceAiAnalyses).where(eq(workspaceAiAnalyses.id, input.id));
      await logTimeline(existing.workspaceId, `AI Analysis Deleted: "${existing.title}"`, 'ai_analysis');

      return { success: true };
    }),

  // Get count for a workspace (for metrics)
  count: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const results = await db.select({ count: sql<number>`COUNT(*)` }).from(workspaceAiAnalyses)
        .where(eq(workspaceAiAnalyses.workspaceId, input.workspaceId));
      return results[0]?.count || 0;
    }),
});
