import { eq, like, and } from "drizzle-orm";
import { knowledgeDocuments } from "../drizzle/schema";
import { getDb } from "./db";

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
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(knowledgeDocuments).values({
    title: data.title,
    category: data.category,
    subcategory: data.subcategory,
    source: data.source,
    sourceUrl: data.sourceUrl,
    fileType: data.fileType,
    content: data.content,
    summary: data.summary,
    status: (data.status as any) || "active",
  });

  return result;
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
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(knowledgeDocuments)
    .set(data)
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

export async function getKnowledgeBaseStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, archived: 0, needsReview: 0 };

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

  return {
    total: all.length,
    active: active.length,
    archived: archived.length,
    needsReview: needsReview.length,
  };
}
