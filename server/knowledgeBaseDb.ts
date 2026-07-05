import { eq, like, and } from "drizzle-orm";
import { knowledgeDocuments } from "../drizzle/schema";
import { getDb } from "./db";
import crypto from "crypto";

/**
 * Calculate SHA256 hash of document content for change detection
 */
export function calculateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function getKnowledgeDocuments(filters?: {
  category?: string;
  status?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.category) {
    conditions.push(eq(knowledgeDocuments.category, filters.category));
  }

  if (filters?.status) {
    conditions.push(eq(knowledgeDocuments.status, filters.status as any));
  }

  if (filters?.search) {
    conditions.push(like(knowledgeDocuments.title, `%${filters.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  if (whereClause) {
    return db.select().from(knowledgeDocuments).where(whereClause);
  }
  
  return db.select().from(knowledgeDocuments);
}

export async function getKnowledgeDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createKnowledgeDocument(data: {
  title: string;
  category: string;
  subcategory?: string;
  source: string;
  sourceUrl?: string;
  fileType?: string;
  content?: string;
  summary?: string;
  status?: string;
  source_system?: 'google_drive' | 'upload' | 'xai_collection' | 'manual';
  workspace_id?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const contentHash = data.content ? calculateContentHash(data.content) : null;

  const result = await db.insert(knowledgeDocuments).values({
    title: data.title,
    category: data.category,
    subcategory: data.subcategory,
    source: data.source,
    source_system: data.source_system || 'google_drive',
    sourceUrl: data.sourceUrl,
    fileType: data.fileType,
    content: data.content,
    summary: data.summary,
    status: (data.status as any) || "active",
    content_hash: contentHash,
    workspace_id: data.workspace_id,
  });

  return result;
}

/**
 * Check if document content has changed by comparing hashes
 */
export async function hasContentChanged(docId: number, newContent: string): Promise<boolean> {
  const doc = await getKnowledgeDocumentById(docId);
  if (!doc) return true; // New document
  
  const newHash = calculateContentHash(newContent);
  return newHash !== doc.content_hash;
}

export async function updateKnowledgeDocument(
  id: number,
  data: {
    title?: string;
    category?: string;
    subcategory?: string;
    summary?: string;
    status?: 'active' | 'archived' | 'needs_review';
    adminNotes?: string;
    isProcessed?: number;
    content?: string;
    synced_to_xai?: number;
    xai_collection_id?: string;
    last_synced_at?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // If content is being updated, recalculate hash
  const updateData: any = { ...data };
  if (data.content) {
    updateData.content_hash = calculateContentHash(data.content);
  }

  const result = await db
    .update(knowledgeDocuments)
    .set(updateData)
    .where(eq(knowledgeDocuments.id, id));

  return result;
}

export async function deleteKnowledgeDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .delete(knowledgeDocuments)
    .where(eq(knowledgeDocuments.id, id));

  return result;
}

export async function getDocumentsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(knowledgeDocuments)
    .where(
      and(
        eq(knowledgeDocuments.category, category),
        eq(knowledgeDocuments.status, "active")
      )
    );
}

export async function getDocumentsNeedingReview() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.status, "needs_review"));
}

/**
 * Get documents pending sync to xAI Collections
 */
export async function getDocumentsPendingSync() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(knowledgeDocuments)
    .where(
      and(
        eq(knowledgeDocuments.synced_to_xai, 0),
        eq(knowledgeDocuments.status, "active")
      )
    );
}

export async function getKnowledgeBaseStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, archived: 0, needsReview: 0, syncPending: 0 };

  const all = await db.select().from(knowledgeDocuments);
  const active = await db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.status, "active"));
  const archived = await db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.status, "archived"));
  const needsReview = await db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.status, "needs_review"));
  const syncPending = await db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.synced_to_xai, 0));

  return {
    total: all.length,
    active: active.length,
    archived: archived.length,
    needsReview: needsReview.length,
    syncPending: syncPending.length,
  };
}
