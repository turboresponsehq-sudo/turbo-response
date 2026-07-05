/**
 * xAI Collections Sync Service
 * Handles syncing knowledge base documents to xAI Collections
 * Includes retry logic, error handling, and change detection
 */

import { getXAICollectionsService } from "./xaiCollectionsService";
import {
  getKnowledgeDocumentById,
  getDocumentsPendingSync,
  updateKnowledgeDocument,
  calculateContentHash,
} from "../knowledgeBaseDb";

interface SyncResult {
  success: boolean;
  documentId: number;
  xaiDocumentId?: string;
  xaiCollectionId?: string;
  error?: string;
  timestamp: string;
}

interface SyncOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  collectionId?: string; // Override default collection ID
}

const DEFAULT_COLLECTION_ID = process.env.XAI_COLLECTION_ID || "collection_66089751-0963-42d8-a1e2-49e4dc20a4b8";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sync a single document to xAI Collections with retry logic
 */
export async function syncDocumentToXAI(
  documentId: number,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? RETRY_DELAY_MS;
  const collectionId = options.collectionId ?? DEFAULT_COLLECTION_ID;

  const doc = await getKnowledgeDocumentById(documentId);
  if (!doc) {
    return {
      success: false,
      documentId,
      error: "Document not found",
      timestamp: new Date().toISOString(),
    };
  }

  if (!doc.content) {
    return {
      success: false,
      documentId,
      error: "Document has no content to sync",
      timestamp: new Date().toISOString(),
    };
  }

  const xaiService = getXAICollectionsService();
  let lastError: string | null = null;
  let xaiDocumentId: string | undefined;

  // Retry logic
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Upload document to xAI Collections
      const result = await xaiService.uploadDocument(
        collectionId,
        `${doc.title}-${doc.id}.txt`,
        doc.content,
        {
          document_id: doc.id.toString(),
          category: doc.category,
          source: doc.source,
          source_system: doc.source_system,
        }
      );

      xaiDocumentId = result.document_id;

      // Update database with sync status
      await updateKnowledgeDocument(documentId, {
        synced_to_xai: 1,
        xai_collection_id: collectionId,
        last_synced_at: new Date().toISOString(),
      });

      return {
        success: true,
        documentId,
        xaiDocumentId,
        xaiCollectionId: collectionId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(
        `[xAI Sync] Attempt ${attempt + 1}/${maxRetries} failed for document ${documentId}: ${lastError}`
      );

      // Wait before retrying (except on last attempt)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
      }
    }
  }

  return {
    success: false,
    documentId,
    error: `Failed after ${maxRetries} attempts: ${lastError}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sync all pending documents to xAI Collections
 */
export async function syncPendingDocumentsToXAI(
  options: SyncOptions = {}
): Promise<SyncResult[]> {
  const pendingDocs = await getDocumentsPendingSync();

  if (pendingDocs.length === 0) {
    console.log("[xAI Sync] No pending documents to sync");
    return [];
  }

  console.log(`[xAI Sync] Starting sync of ${pendingDocs.length} pending documents`);

  const results: SyncResult[] = [];

  for (const doc of pendingDocs) {
    const result = await syncDocumentToXAI(doc.id, options);
    results.push(result);

    if (result.success) {
      console.log(`[xAI Sync] ✓ Document ${doc.id} synced successfully`);
    } else {
      console.error(`[xAI Sync] ✗ Document ${doc.id} failed: ${result.error}`);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `[xAI Sync] Completed: ${successCount}/${results.length} documents synced successfully`
  );

  return results;
}

/**
 * Re-sync a document if its content has changed
 */
export async function resyncDocumentIfChanged(
  documentId: number,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const doc = await getKnowledgeDocumentById(documentId);
  if (!doc) {
    return {
      success: false,
      documentId,
      error: "Document not found",
      timestamp: new Date().toISOString(),
    };
  }

  if (!doc.content) {
    return {
      success: false,
      documentId,
      error: "Document has no content",
      timestamp: new Date().toISOString(),
    };
  }

  // Check if content has changed
  const currentHash = calculateContentHash(doc.content);
  const hasChanged = currentHash !== doc.content_hash;

  if (!hasChanged && doc.synced_to_xai === 1) {
    return {
      success: true,
      documentId,
      xaiDocumentId: doc.id.toString(),
      xaiCollectionId: doc.xai_collection_id || DEFAULT_COLLECTION_ID,
      timestamp: new Date().toISOString(),
    };
  }

  // Re-sync if changed
  return syncDocumentToXAI(documentId, options);
}

/**
 * Get sync status for a document
 */
export async function getDocumentSyncStatus(documentId: number) {
  const doc = await getKnowledgeDocumentById(documentId);
  if (!doc) {
    return null;
  }

  return {
    documentId: doc.id,
    title: doc.title,
    synced: doc.synced_to_xai === 1,
    xaiCollectionId: doc.xai_collection_id,
    lastSyncedAt: doc.last_synced_at,
    contentHash: doc.content_hash,
  };
}
