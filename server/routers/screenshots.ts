import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveScreenshot, getUserScreenshots, getScreenshot, markScreenshotAsSaved, deleteScreenshot } from "../db";
import { storagePut, storageGet } from "../storage";
import { invokeLLM } from "../_core/llm";

/**
 * Screenshot Capture Router
 * Handles uploading, processing, and managing research screenshots
 */
export const screenshotRouter = router({
  /**
   * Upload a screenshot with description and optional research notes
   * Processes OCR, extracts metadata, stores in S3
   */
  upload: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string().describe("Base64-encoded image data"),
        mimeType: z.string().describe("MIME type (image/png, image/jpeg, etc)"),
        description: z.string().describe("User's description of the screenshot"),
        researchNotes: z.string().optional().describe("Optional research notes, Grok output, etc"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(input.imageBase64, "base64");
        const fileSize = imageBuffer.length;

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `screenshots/${ctx.user.id}/${timestamp}-${randomSuffix}.${input.mimeType.split("/")[1]}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, imageBuffer, input.mimeType);

        // Extract text using LLM (OCR-like functionality)
        let extractedText = "";
        let extractedDates = "";
        let extractedContacts = "";
        let category = "other";

        try {
          // Use LLM to extract structured data from image
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are an OCR and data extraction expert. Extract all text, dates, names, organizations, emails, phone numbers, and other contact information from the provided image. Return structured JSON with: text (all text found), dates (comma-separated), names (comma-separated), organizations (comma-separated), emails (comma-separated), phones (comma-separated), and category (grant/partnership/lead/alert/event/other).",
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: url, // Use the S3 URL we just uploaded
                      detail: "high",
                    },
                  },
                  {
                    type: "text",
                    text: "Extract all text, dates, names, organizations, emails, and phone numbers from this screenshot.",
                  },
                ],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "screenshot_extraction",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    text: { type: "string", description: "All extracted text" },
                    dates: { type: "string", description: "Comma-separated dates" },
                    names: { type: "string", description: "Comma-separated names" },
                    organizations: { type: "string", description: "Comma-separated organizations" },
                    emails: { type: "string", description: "Comma-separated emails" },
                    phones: { type: "string", description: "Comma-separated phone numbers" },
                    category: {
                      type: "string",
                      enum: ["grant", "partnership", "lead", "alert", "event", "other"],
                    },
                  },
                  required: ["text", "dates", "names", "organizations", "emails", "phones", "category"],
                  additionalProperties: false,
                },
              },
            },
          });

          if (response.choices?.[0]?.message?.content) {
            const content = response.choices[0].message.content;
            const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
            const extracted = JSON.parse(contentStr);
            extractedText = extracted.text || "";
            extractedDates = extracted.dates || "";
            extractedContacts = JSON.stringify({
              names: extracted.names,
              organizations: extracted.organizations,
              emails: extracted.emails,
              phones: extracted.phones,
            });
            category = extracted.category || "other";
          }
        } catch (error) {
          console.error("[Screenshot] OCR extraction error:", error);
          // Continue without extraction if LLM fails
        }

        // Calculate expiration date (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Save to database
        const screenshot = await saveScreenshot({
          userId: ctx.user.id,
          imageKey: fileKey,
          imageUrl: url,
          description: input.description,
          researchNotes: input.researchNotes || null,
          extractedText: extractedText || null,
          category,
          extractedDates: extractedDates || null,
          extractedContacts: extractedContacts || null,
          fileSize,
          mimeType: input.mimeType,
          expiresAt,
          isSaved: 0,
          internalNotes: null,
        });

        return {
          success: true,
          screenshotId: screenshot?.id,
          message: "Screenshot uploaded successfully",
          data: {
            id: screenshot?.id,
            description: screenshot?.description,
            category: screenshot?.category,
            extractedText: screenshot?.extractedText,
            expiresAt: screenshot?.expiresAt,
          },
        };
      } catch (error) {
        console.error("[Screenshot] Upload error:", error);
        throw new Error(`Failed to upload screenshot: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Get all screenshots for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userScreenshots = await getUserScreenshots(ctx.user.id);
      return {
        success: true,
        data: userScreenshots.map((s) => ({
          id: s.id,
          description: s.description,
          category: s.category,
          extractedText: s.extractedText,
          extractedDates: s.extractedDates,
          extractedContacts: s.extractedContacts,
          researchNotes: s.researchNotes,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          isSaved: s.isSaved === 1,
          imageUrl: s.imageUrl,
        })),
      };
    } catch (error) {
      console.error("[Screenshot] List error:", error);
      throw new Error("Failed to fetch screenshots");
    }
  }),

  /**
   * Get a single screenshot by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const screenshot = await getScreenshot(input.id);

        if (!screenshot || screenshot.userId !== ctx.user.id) {
          throw new Error("Screenshot not found or access denied");
        }

        return {
          success: true,
          data: {
            id: screenshot.id,
            description: screenshot.description,
            category: screenshot.category,
            extractedText: screenshot.extractedText,
            extractedDates: screenshot.extractedDates,
            extractedContacts: screenshot.extractedContacts,
            researchNotes: screenshot.researchNotes,
            createdAt: screenshot.createdAt,
            expiresAt: screenshot.expiresAt,
            isSaved: screenshot.isSaved === 1,
            imageUrl: screenshot.imageUrl,
            fileSize: screenshot.fileSize,
            mimeType: screenshot.mimeType,
          },
        };
      } catch (error) {
        console.error("[Screenshot] Get error:", error);
        throw new Error("Failed to fetch screenshot");
      }
    }),

  /**
   * Mark a screenshot as saved (prevents auto-delete)
   */
  save: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const screenshot = await getScreenshot(input.id);

        if (!screenshot || screenshot.userId !== ctx.user.id) {
          throw new Error("Screenshot not found or access denied");
        }

        await markScreenshotAsSaved(input.id);

        return {
          success: true,
          message: "Screenshot saved successfully",
        };
      } catch (error) {
        console.error("[Screenshot] Save error:", error);
        throw new Error("Failed to save screenshot");
      }
    }),

  /**
   * Delete a screenshot
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const screenshot = await getScreenshot(input.id);

        if (!screenshot || screenshot.userId !== ctx.user.id) {
          throw new Error("Screenshot not found or access denied");
        }

        await deleteScreenshot(input.id);

        return {
          success: true,
          message: "Screenshot deleted successfully",
        };
      } catch (error) {
        console.error("[Screenshot] Delete error:", error);
        throw new Error("Failed to delete screenshot");
      }
    }),
});
