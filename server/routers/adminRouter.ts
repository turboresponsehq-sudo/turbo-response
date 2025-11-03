import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllLeads,
  getAllConversations,
  getLeadWithConversation,
  updateLeadStatus,
  createLeadNote,
  getLeadNotes,
  updateLead,
  getAnalytics,
} from "../chatDb";

/**
 * Admin router for managing leads and conversations
 * Protected - requires authentication
 */
export const adminRouter = router({
  /**
   * Get all leads
   */
  getLeads: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit || 100;
      return await getAllLeads(limit);
    }),

  /**
   * Get all conversations
   */
  getConversations: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit || 100;
      return await getAllConversations(limit);
    }),

  /**
   * Get lead with full conversation details
   */
  getLeadDetails: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const result = await getLeadWithConversation(input.leadId);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead not found",
        });
      }
      return result;
    }),

  /**
   * Update lead status
   */
  updateLeadStatus: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        status: z.enum(["new", "contacted", "qualified", "converted", "closed"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await updateLeadStatus(input.leadId, input.status, input.notes);
      return { success: true };
    }),

  /**
   * Phase 3: Add note to lead
   */
  addLeadNote: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        content: z.string(),
        noteType: z.enum(["general", "phone_call", "follow_up", "important"]).default("general"),
        createdBy: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const noteId = await createLeadNote({
        leadId: input.leadId,
        content: input.content,
        noteType: input.noteType,
        createdBy: input.createdBy || ctx.user?.name || "Admin",
      });
      return { success: true, noteId };
    }),

  /**
   * Phase 3: Get all notes for a lead
   */
  getLeadNotes: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      return await getLeadNotes(input.leadId);
    }),

  /**
   * Phase 3: Update lead information
   */
  updateLead: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        bestTimeToCall: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { leadId, ...data } = input;
      await updateLead(leadId, data);
      return { success: true };
    }),

  /**
   * Phase 3: Get analytics dashboard data
   */
  getAnalytics: protectedProcedure.query(async () => {
    return await getAnalytics();
  }),
});

