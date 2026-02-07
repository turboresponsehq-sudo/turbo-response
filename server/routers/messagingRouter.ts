/**
 * Messaging Router - tRPC procedures for client-admin communication
 * Note: Currently disabled - caseMessages table not in current schema
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

export const messagingRouter = router({
  /**
   * Get all messages for a case
   * DISABLED: caseMessages table not in current schema
   */
  getMessages: publicProcedure
    .input(z.object({
      caseId: z.number(),
    }))
    .query(async ({ input }) => {
      return {
        success: false,
        error: "Messaging feature temporarily unavailable",
        messages: [],
      };
    }),

  /**
   * Send a new message
   * DISABLED: caseMessages table not in current schema
   */
  sendMessage: publicProcedure
    .input(z.object({
      caseId: z.number(),
      sender: z.enum(["client", "admin"]),
      senderName: z.string().optional(),
      messageText: z.string().optional(),
      filePath: z.string().optional(),
      fileName: z.string().optional(),
      fileType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: false,
        error: "Messaging feature temporarily unavailable",
      };
    }),
});
