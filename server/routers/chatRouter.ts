import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createConversation,
  createMessage,
  getMessagesByConversationId,
  getConversationById,
  updateConversation,
  createEvidenceUpload,
  getEvidenceByConversationId,
  createLead,
  getFullConversation,
} from "../chatDb";
import {
  detectCaseCategory,
  generateFollowUpQuestions,
  generateCaseSummary,
  generateConversationalResponse,
} from "../chatAI";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";

/**
 * Chat router for conversational AI chatbot
 */
export const chatRouter = router({
  /**
   * Start a new conversation
   */
  startConversation: publicProcedure.mutation(async () => {
    const conversationId = await createConversation({
      status: "active",
      messageCount: 0,
      evidenceCount: 0,
      convertedToLead: 0,
    });

    return { conversationId };
  }),

  /**
   * Send a message and get AI response
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string(),
        isInitialStory: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { conversationId, message, isInitialStory } = input;

      // Save user message
      await createMessage({
        conversationId,
        role: "user",
        content: message,
      });

      // Get conversation to check status and category
      const conversation = await getConversationById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      let aiResponse = "";
      let questions: string[] = [];
      let shouldAskQuestions = false;

      // If this is the initial story, detect category and generate questions
      if (isInitialStory) {
        // Detect category
        const { category, confidence } = await detectCaseCategory(message);

        // Update conversation with category
        await updateConversation(conversationId, {
          category,
          summary: message.substring(0, 500), // Store first 500 chars as initial summary
        });

        // Generate follow-up questions
        questions = await generateFollowUpQuestions(category, message, []);

        // Create conversational acknowledgment
        aiResponse = await generateConversationalResponse(
          "User just shared their initial story about a consumer issue",
          message
        );

        aiResponse += `\n\nLet me ask a few questions to understand your situation better:`;

        shouldAskQuestions = true;
      } else {
        // Regular conversational response
        const messages = await getMessagesByConversationId(conversationId);
        const context = messages.map(m => `${m.role}: ${m.content}`).join("\n");

        aiResponse = await generateConversationalResponse(context, message);
      }

      // Save AI response
      await createMessage({
        conversationId,
        role: "assistant",
        content: aiResponse,
        metadata: shouldAskQuestions ? JSON.stringify({ questions }) : undefined,
      });

      return {
        response: aiResponse,
        questions: shouldAskQuestions ? questions : undefined,
      };
    }),

  /**
   * Get conversation history
   */
  getConversation: publicProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return await getFullConversation(input.conversationId);
    }),

  /**
   * Upload evidence file
   */
  uploadEvidence: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        fileData: z.string(), // base64 encoded file data
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { conversationId, fileData, filename, mimeType } = input;

      // Decode base64 data
      const buffer = Buffer.from(fileData, "base64");

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `evidence/${conversationId}/${timestamp}-${randomSuffix}-${filename}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, mimeType);

      // Save to database
      const uploadId = await createEvidenceUpload({
        conversationId,
        fileKey,
        fileUrl: url,
        filename,
        mimeType,
        fileSize: buffer.length,
      });

      return {
        uploadId,
        fileUrl: url,
      };
    }),

  /**
   * Generate case analysis after evidence upload
   */
  generateAnalysis: publicProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input }) => {
      const { conversationId } = input;

      // Get full conversation
      const fullConv = await getFullConversation(conversationId);
      if (!fullConv || !fullConv.conversation) {
        throw new Error("Conversation not found");
      }

      const { conversation, messages: msgs, evidence } = fullConv;

      // Extract initial story and Q&A
      const userMessages = msgs.filter(m => m.role === "user");
      const initialStory = userMessages[0]?.content || "";

      // Extract Q&A pairs (skip first message which is the story)
      const qAndA: Array<{ question: string; answer: string }> = [];
      for (let i = 1; i < msgs.length; i++) {
        if (msgs[i].role === "assistant" && msgs[i + 1]?.role === "user") {
          qAndA.push({
            question: msgs[i].content,
            answer: msgs[i + 1].content,
          });
        }
      }

      // Generate analysis
      const analysis = await generateCaseSummary(
        conversation.category || "other",
        initialStory,
        qAndA,
        evidence.length
      );

      // Update conversation status and summary
      await updateConversation(conversationId, {
        status: "analyzing",
        summary: analysis.summary,
      });

      // Save analysis as system message
      const analysisText = `**Case Analysis**\n\n${analysis.summary}\n\n**Potential Issues:**\n${analysis.potentialIssues.map(i => `• ${i}`).join("\n")}\n\n**Inconsistencies:**\n${analysis.inconsistencies.length > 0 ? analysis.inconsistencies.map(i => `• ${i}`).join("\n") : "None detected"}\n\n**Next Steps:**\n${analysis.nextSteps.map(s => `• ${s}`).join("\n")}`;

      await createMessage({
        conversationId,
        role: "system",
        content: analysisText,
        metadata: JSON.stringify(analysis),
      });

      return analysis;
    }),

  /**
   * Submit lead (contact information)
   */
  submitLead: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        bestTimeToCall: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { conversationId, name, email, phone, bestTimeToCall } = input;

      // Get conversation to get category
      const conversation = await getConversationById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Create lead
      const leadId = await createLead({
        conversationId,
        name,
        email,
        phone: phone || null,
        bestTimeToCall: bestTimeToCall || null,
        status: "new",
        category: conversation.category || null,
      });

      // Get full conversation for notification
      const fullConv = await getFullConversation(conversationId);

      // Notify owner
      const evidenceLinks = fullConv?.evidence.map(e => e.fileUrl).join("\n") || "None";

      await notifyOwner({
        title: `🎯 New Lead: ${name}`,
        content: `**Category:** ${conversation.category || "Unknown"}

**Contact Info:**
• Name: ${name}
• Email: ${email}
• Phone: ${phone || "Not provided"}
• Best time to call: ${bestTimeToCall || "Not specified"}

**Case Summary:**
${conversation.summary || "No summary available"}

**Evidence Files:**
${evidenceLinks}

**Conversation ID:** ${conversationId}
**Lead ID:** ${leadId}`,
      });

      return { leadId, success: true };
    }),
});

