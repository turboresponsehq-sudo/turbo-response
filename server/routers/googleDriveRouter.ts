/**
 * Google Drive Router
 * tRPC procedures for listing Drive files and importing them into the Knowledge Base.
 * All procedures require admin authentication.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  listDriveFiles,
  listDriveFilesRecursive,
  extractTextFromDriveFile,
  getDriveFileMetadata,
  mimeTypeToFileType,
  type DriveFile,
} from "../googleDriveService";
import {
  createKnowledgeDocument,
  updateKnowledgeDocument,
  calculateContentHash,
  hasContentChanged,
  getKnowledgeDocuments,
} from "../knowledgeBaseDb";

const DEFAULT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

export const googleDriveRouter = router({
  /**
   * List files in a Google Drive folder (shallow, one level)
   */
  listFiles: protectedProcedure
    .input(
      z.object({
        folderId: z.string().optional(),
        pageToken: z.string().optional(),
        pageSize: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      const folderId = input.folderId || DEFAULT_FOLDER_ID;
      if (!folderId) {
        throw new Error("No folder ID provided and GOOGLE_DRIVE_FOLDER_ID is not configured");
      }
      return listDriveFiles(folderId, {
        pageToken: input.pageToken,
        pageSize: input.pageSize,
      });
    }),

  /**
   * List all files recursively in a folder tree
   */
  listFilesRecursive: protectedProcedure
    .input(z.object({ folderId: z.string().optional() }))
    .query(async ({ input }) => {
      const folderId = input.folderId || DEFAULT_FOLDER_ID;
      if (!folderId) {
        throw new Error("No folder ID provided and GOOGLE_DRIVE_FOLDER_ID is not configured");
      }
      const files = await listDriveFilesRecursive(folderId);
      return { files, total: files.length };
    }),

  /**
   * Import a single Drive file into the Knowledge Base
   * Extracts text content and creates or updates the document record
   */
  importFile: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        category: z.string(),
        subcategory: z.string().optional(),
        existingDocId: z.number().optional(), // If provided, update existing doc
      })
    )
    .mutation(async ({ input }) => {
      // Get file metadata
      const file = await getDriveFileMetadata(input.fileId);

      // Extract text content
      const content = await extractTextFromDriveFile(file);
      const fileType = mimeTypeToFileType(file.mimeType);

      if (input.existingDocId) {
        // Check if content has changed before updating
        const changed = await hasContentChanged(input.existingDocId, content || "");

        if (!changed) {
          return {
            action: "skipped",
            reason: "Content unchanged",
            docId: input.existingDocId,
            fileName: file.name,
          };
        }

        // Update existing document
        await updateKnowledgeDocument(input.existingDocId, {
          title: file.name,
          content: content || undefined,
          // Reset sync flag since content changed
          synced_to_xai: 0,
          status: "needs_review",
        });

        return {
          action: "updated",
          docId: input.existingDocId,
          fileName: file.name,
          contentExtracted: !!content,
        };
      } else {
        // Create new document
        const result = await createKnowledgeDocument({
          title: file.name,
          category: input.category,
          subcategory: input.subcategory,
          source: "google_drive",
          source_system: "google_drive",
          sourceUrl: file.webViewLink || undefined,
          fileType,
          content: content || undefined,
          status: "needs_review",
        });

        return {
          action: "created",
          fileName: file.name,
          contentExtracted: !!content,
          result,
        };
      }
    }),

  /**
   * Bulk import multiple Drive files into the Knowledge Base
   */
  bulkImport: protectedProcedure
    .input(
      z.object({
        files: z.array(
          z.object({
            fileId: z.string(),
            category: z.string(),
            subcategory: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const results: Array<{
        fileId: string;
        fileName: string;
        action: string;
        contentExtracted: boolean;
        error?: string;
      }> = [];

      for (const fileInput of input.files) {
        try {
          const file = await getDriveFileMetadata(fileInput.fileId);
          const content = await extractTextFromDriveFile(file);
          const fileType = mimeTypeToFileType(file.mimeType);

          await createKnowledgeDocument({
            title: file.name,
            category: fileInput.category,
            subcategory: fileInput.subcategory,
            source: "google_drive",
            source_system: "google_drive",
            sourceUrl: file.webViewLink || undefined,
            fileType,
            content: content || undefined,
            status: "needs_review",
          });

          results.push({
            fileId: fileInput.fileId,
            fileName: file.name,
            action: "created",
            contentExtracted: !!content,
          });
        } catch (err: any) {
          results.push({
            fileId: fileInput.fileId,
            fileName: fileInput.fileId,
            action: "error",
            contentExtracted: false,
            error: err.message || "Unknown error",
          });
        }
      }

      const succeeded = results.filter((r) => r.action === "created").length;
      const failed = results.filter((r) => r.action === "error").length;

      return { results, succeeded, failed };
    }),

  /**
   * Check if the Google Drive integration is configured
   */
  checkConfig: protectedProcedure.query(async () => {
    const hasServiceAccount = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const hasFolderId = !!process.env.GOOGLE_DRIVE_FOLDER_ID;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

    return {
      configured: hasServiceAccount && hasFolderId,
      hasServiceAccount,
      hasFolderId,
      folderId,
    };
  }),
});
