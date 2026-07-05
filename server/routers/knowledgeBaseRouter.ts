import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  createKnowledgeDocument,
  deleteKnowledgeDocument,
  getKnowledgeDocumentById,
  getKnowledgeDocuments,
  getKnowledgeBaseStats,
  updateKnowledgeDocument,
  getDocumentsByCategory,
  getDocumentsNeedingReview,
  getDocumentsPendingSync,
  hasContentChanged,
} from "../knowledgeBaseDb";

export const knowledgeBaseRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getKnowledgeDocuments(input);
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getKnowledgeDocumentById(input.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        category: z.string(),
        subcategory: z.string().optional(),
        source: z.string(),
        sourceUrl: z.string().optional(),
        fileType: z.string().optional(),
        content: z.string().optional(),
        summary: z.string().optional(),
        status: z.string().optional(),
        source_system: z.enum(["google_drive", "upload", "xai_collection", "manual"]).optional(),
        workspace_id: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createKnowledgeDocument(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        summary: z.string().optional(),
        status: z.enum(["active", "archived", "needs_review"]).optional(),
        adminNotes: z.string().optional(),
        isProcessed: z.number().optional(),
        content: z.string().optional(),
        synced_to_xai: z.number().optional(),
        xai_collection_id: z.string().optional(),
        last_synced_at: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateKnowledgeDocument(id, data);
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    return deleteKnowledgeDocument(input.id);
  }),

  getStats: protectedProcedure.query(async () => {
    return getKnowledgeBaseStats();
  }),

  getByCategory: protectedProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
    return getDocumentsByCategory(input.category);
  }),

  getNeedingReview: protectedProcedure.query(async () => {
    return getDocumentsNeedingReview();
  }),

  getPendingSync: protectedProcedure.query(async () => {
    return getDocumentsPendingSync();
  }),

  checkContentChange: protectedProcedure
    .input(z.object({ id: z.number(), newContent: z.string() }))
    .query(async ({ input }) => {
      return hasContentChanged(input.id, input.newContent);
    }),
});
