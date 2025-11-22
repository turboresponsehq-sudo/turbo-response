/**
 * Messaging Router - tRPC procedures for client-admin communication
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { caseMessages } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

export const messagingRouter = router({
  /**
   * Get all messages for a case
   */
  getMessages: publicProcedure
    .input(z.object({
      caseId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const messages = await db
        .select()
        .from(caseMessages)
        .where(eq(caseMessages.caseId, input.caseId))
        .orderBy(asc(caseMessages.createdAt));

      return {
        success: true,
        messages,
      };
    }),

  /**
   * Send a new message
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
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Validate that at least message or file is provided
      if (!input.messageText && !input.filePath) {
        throw new Error("Either message text or file is required");
      }

      const [message] = await db.insert(caseMessages).values({
        caseId: input.caseId,
        sender: input.sender,
        senderName: input.senderName || null,
        messageText: input.messageText || null,
        filePath: input.filePath || null,
        fileName: input.fileName || null,
        fileType: input.fileType || null,
      });

      // TODO: Update unread count if client sent message
      // TODO: Send email notification to admin

      return {
        success: true,
        message,
      };
    }),
});
