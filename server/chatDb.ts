import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  conversations,
  messages,
  evidenceUploads,
  leads,
  leadNotes,
  type InsertConversation,
  type InsertMessage,
  type InsertEvidenceUpload,
  type InsertLead,
  type InsertLeadNote,
} from "../drizzle/schema";

/**
 * Chat database helpers
 * All functions return raw Drizzle results for use in tRPC procedures
 */

// ============================================================================
// CONVERSATIONS
// ============================================================================

export async function createConversation(data: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(conversations).values(data);
  return Number(result[0].insertId);
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result[0];
}

export async function updateConversation(id: number, data: Partial<InsertConversation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(conversations).set(data).where(eq(conversations.id, id));
}

export async function getAllConversations(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(conversations).orderBy(desc(conversations.createdAt)).limit(limit);
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(data);
  
  // Increment message count in conversation
  await db.update(conversations)
    .set({ messageCount: sql`${conversations.messageCount} + 1` })
    .where(eq(conversations.id, data.conversationId));
  
  return Number(result[0].insertId);
}

export async function getMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

// ============================================================================
// EVIDENCE UPLOADS
// ============================================================================

export async function createEvidenceUpload(data: InsertEvidenceUpload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(evidenceUploads).values(data);
  
  // Increment evidence count in conversation
  await db.update(conversations)
    .set({ evidenceCount: sql`${evidenceUploads.conversationId} + 1` })
    .where(eq(conversations.id, data.conversationId));
  
  return Number(result[0].insertId);
}

export async function getEvidenceByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(evidenceUploads)
    .where(eq(evidenceUploads.conversationId, conversationId))
    .orderBy(evidenceUploads.uploadedAt);
}

// ============================================================================
// LEADS
// ============================================================================

export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(leads).values(data);
  
  // Mark conversation as converted to lead
  await db.update(conversations)
    .set({ convertedToLead: 1, status: "completed" })
    .where(eq(conversations.id, data.conversationId));
  
  return Number(result[0].insertId);
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

export async function getAllLeads(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}

export async function updateLeadStatus(id: number, status: string, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  await db.update(leads).set(updateData).where(eq(leads.id, id));
}

// ============================================================================
// COMBINED QUERIES
// ============================================================================

/**
 * Get full conversation with messages and evidence
 */
export async function getFullConversation(conversationId: number) {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return null;

  const conversationMessages = await getMessagesByConversationId(conversationId);
  const evidence = await getEvidenceByConversationId(conversationId);

  return {
    conversation,
    messages: conversationMessages,
    evidence,
  };
}

/**
 * Get lead with full conversation details
 */
export async function getLeadWithConversation(leadId: number) {
  const lead = await getLeadById(leadId);
  if (!lead) return null;

  const fullConversation = await getFullConversation(lead.conversationId);

  return {
    lead,
    ...fullConversation,
  };
}


// ============================================================================
// LEAD NOTES (Phase 3: Intelligence Upgrade)
// ============================================================================

export async function createLeadNote(data: InsertLeadNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(leadNotes).values(data);
  return Number(result[0].insertId);
}

export async function getLeadNotes(leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, leadId))
    .orderBy(desc(leadNotes.createdAt));
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(leads).set(data).where(eq(leads.id, id));
}

// ============================================================================
// ANALYTICS (Phase 3: Intelligence Upgrade)
// ============================================================================

export async function getAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all leads
  const allLeads = await db.select().from(leads);

  // Calculate metrics
  const totalLeads = allLeads.length;
  const convertedLeads = allLeads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Group by category
  const byCategory: Record<string, number> = {};
  allLeads.forEach((lead) => {
    const cat = lead.category || "unknown";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  // Group by status
  const byStatus: Record<string, number> = {};
  allLeads.forEach((lead) => {
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
  });

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLeads = allLeads.filter((l) => new Date(l.createdAt) >= sevenDaysAgo);

  return {
    totalLeads,
    convertedLeads,
    conversionRate: Math.round(conversionRate * 10) / 10,
    byCategory,
    byStatus,
    recentActivity: {
      last7Days: recentLeads.length,
      newLeads: recentLeads.filter((l) => l.status === "new").length,
      contacted: recentLeads.filter((l) => l.status === "contacted").length,
    },
  };
}

