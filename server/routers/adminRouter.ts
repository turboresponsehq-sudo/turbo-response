import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllLeads,
  getAllConversations,
  getLeadWithConversation,
  updateLeadStatus,
} from "../chatDb";
import { getAllIntakeLeads, updateIntakeLeadStatus } from "../intakeLeadsDb";

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
   * Get all intake form leads (from intake_leads table)
   */
  getIntakeLeads: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await getAllIntakeLeads(input?.limit || 100);
    }),

  /**
   * Update intake lead status and optional admin notes
   */
  updateIntakeLeadStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new_lead", "reviewing", "follow_up", "converted"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await updateIntakeLeadStatus(input.id, input.status, input.adminNotes);
      return { success: true };
    }),
});

