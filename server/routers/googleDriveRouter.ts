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
import { beginGoogleDriveOAuth, getGoogleDriveOAuthStatus } from "../services/googleDriveOAuthService";
import {
  createKnowledgeDocument,
  updateKnowledgeDocument,
  calculateContentHash,
  hasContentChanged,
  getKnowledgeDocuments,
  getKnowledgeDocumentByDriveFileId,
} from "../knowledgeBaseDb";
import {
  getDriveIngestionStatus,
  processDriveIngestionBatch,
  startDriveIngestionRun,
} from "../services/googleDriveIngestionService";

const DEFAULT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

export const googleDriveRouter = router({
  /** Start an administrator-initiated, read-only Google OAuth connection. */
  beginOAuth: protectedProcedure.mutation(async ({ ctx }) => {
    const authorizationUrl = await beginGoogleDriveOAuth(ctx.user?.id);
    return { authorizationUrl };
  }),

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
   * Read the last bounded Drive-to-Knowledge Base ingestion state.
   * This is intentionally separate from xAI sync status.
   */
  ingestionStatus: protectedProcedure.query(async () => {
    return getDriveIngestionStatus();
  }),

  /** Start or resume the persistent bounded ingestion run without a recursive browser request. */
  startIngestion: protectedProcedure.mutation(async () => {
    return startDriveIngestionRun();
  }),

  /**
   * Process a small server-side batch: up to twelve folder pages or, after
   * discovery completes, up to six document imports. Individual errors stay
   * on the affected item and never abort the entire run.
   */
  processIngestionBatch: protectedProcedure.mutation(async () => {
    return processDriveIngestionBatch();
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

      const existingDriveDocument = input.existingDocId
        ? null
        : await getKnowledgeDocumentByDriveFileId(file.id);
      const existingDocId = input.existingDocId || existingDriveDocument?.id;

      if (existingDocId) {
        // Check if content has changed before updating
        const changed = await hasContentChanged(existingDocId, content || "");

        if (!changed) {
          return {
            action: "skipped",
            reason: "Content unchanged",
            docId: existingDocId,
            fileName: file.name,
          };
        }

        // Update existing document
        await updateKnowledgeDocument(existingDocId, {
          title: file.name,
          source: "google_drive",
          sourceUrl: file.webViewLink || undefined,
          fileType,
          content: content || undefined,
          drive_file_id: file.id,
          drive_mime_type: file.mimeType,
          drive_modified_at: file.modifiedTime,
          source_path: file.name,
          ingestion_status: "imported",
          ingestion_error: undefined,
          ingested_at: new Date().toISOString(),
          // Reset sync flag since content changed
          synced_to_xai: 0,
          status: "needs_review",
        });

        return {
          action: "updated",
          docId: existingDocId,
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
          drive_file_id: file.id,
          drive_mime_type: file.mimeType,
          drive_modified_at: file.modifiedTime,
          source_path: file.name,
          ingestion_status: "imported",
          ingested_at: new Date().toISOString(),
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
          const existingDocument = await getKnowledgeDocumentByDriveFileId(file.id);

          if (existingDocument) {
            const changed = await hasContentChanged(existingDocument.id, content || "");
            if (changed) {
              await updateKnowledgeDocument(existingDocument.id, {
                title: file.name,
                source: "google_drive",
                sourceUrl: file.webViewLink || undefined,
                fileType,
                content: content || undefined,
                drive_file_id: file.id,
                drive_mime_type: file.mimeType,
                drive_modified_at: file.modifiedTime,
                source_path: file.name,
                ingestion_status: "imported",
                ingested_at: new Date().toISOString(),
                synced_to_xai: 0,
                status: "needs_review",
              });
              results.push({ fileId: file.id, fileName: file.name, action: "updated", contentExtracted: !!content });
            } else {
              results.push({ fileId: file.id, fileName: file.name, action: "skipped", contentExtracted: !!content });
            }
            continue;
          }

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
            drive_file_id: file.id,
            drive_mime_type: file.mimeType,
            drive_modified_at: file.modifiedTime,
            source_path: file.name,
            ingestion_status: "imported",
            ingested_at: new Date().toISOString(),
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
    const oauth = await getGoogleDriveOAuthStatus();
    let hasServiceAccount = false;
    try {
      hasServiceAccount = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON));
    } catch {
      hasServiceAccount = false;
    }
    const hasFolderId = !!process.env.GOOGLE_DRIVE_FOLDER_ID;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

    return {
      configured: hasFolderId && (oauth.connected || hasServiceAccount),
      hasServiceAccount,
      hasFolderId,
      folderId,
      authMode: oauth.connected ? "oauth" : hasServiceAccount ? "service_account" : "not_connected",
      oauth,
    };
  }),
});
