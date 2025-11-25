import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversational AI tables for consumer advocacy chatbot
 */

// Case category enum
export const caseCategories = [
  "debt_collection",
  "eviction",
  "credit_errors",
  "unemployment",
  "bank_issues",
  "wage_garnishment",
  "discrimination",
  "other"
] as const;

export type CaseCategory = typeof caseCategories[number];

// Conversation status enum
export const conversationStatuses = [
  "active",
  "awaiting_upload",
  "analyzing",
  "completed",
  "abandoned"
] as const;

export type ConversationStatus = typeof conversationStatuses[number];

// Lead status enum
export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "closed"
] as const;

export type LeadStatus = typeof leadStatuses[number];

// Message role enum
export const messageRoles = ["user", "assistant", "system"] as const;
export type MessageRole = typeof messageRoles[number];

/**
 * Conversations table - tracks each chat session
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  /** Optional user ID if authenticated (most will be anonymous) */
  userId: int("userId"),
  /** Detected case category based on initial story */
  category: varchar("category", { length: 50 }),
  /** Current conversation status */
  status: varchar("status", { length: 50 }).default("active").notNull(),
  /** Summary of the case for quick reference */
  summary: text("summary"),
  /** Number of messages in this conversation */
  messageCount: int("messageCount").default(0).notNull(),
  /** Number of evidence files uploaded */
  evidenceCount: int("evidenceCount").default(0).notNull(),
  /** Whether this conversation resulted in a lead */
  convertedToLead: int("convertedToLead").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table - stores user and AI messages
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  /** Role: user, assistant, or system */
  role: varchar("role", { length: 20 }).notNull(),
  /** Message content */
  content: text("content").notNull(),
  /** Metadata (JSON string for additional data like question type, etc.) */
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Evidence uploads table - tracks uploaded files
 */
export const evidenceUploads = mysqlTable("evidence_uploads", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  /** S3 file key */
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  /** Public S3 URL */
  fileUrl: text("fileUrl").notNull(),
  /** Original filename */
  filename: varchar("filename", { length: 255 }),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 100 }),
  /** File size in bytes */
  fileSize: int("fileSize"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type EvidenceUpload = typeof evidenceUploads.$inferSelect;
export type InsertEvidenceUpload = typeof evidenceUploads.$inferInsert;

/**
 * Leads table - captured contact information for sales follow-up
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  /** Full name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Email address */
  email: varchar("email", { length: 320 }).notNull(),
  /** Phone number */
  phone: varchar("phone", { length: 50 }),
  /** Best time to call: morning, afternoon, evening */
  bestTimeToCall: varchar("bestTimeToCall", { length: 20 }),
  /** Lead status for tracking */
  status: varchar("status", { length: 50 }).default("new").notNull(),
  /** Notes from admin */
  notes: text("notes"),
  /** Case category (copied from conversation for quick filtering) */
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Case Messages table - client-admin communication
 * Structured for future AI analysis and summarization
 */
export const caseMessages = mysqlTable("case_messages", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to conversations table (case_id maps to conversation_id) */
  caseId: int("caseId").notNull(),
  /** Sender type: 'client' or 'admin' */
  sender: varchar("sender", { length: 20 }).notNull(),
  /** Name of the person who sent the message */
  senderName: varchar("senderName", { length: 255 }),
  /** Text content of the message, nullable if only file is sent */
  messageText: text("messageText"),
  /** S3 URL or file path, nullable if only text message */
  filePath: text("filePath"),
  /** Original filename for display */
  fileName: varchar("fileName", { length: 255 }),
  /** MIME type (e.g., 'application/pdf', 'image/jpeg') */
  fileType: varchar("fileType", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CaseMessage = typeof caseMessages.$inferSelect;
export type InsertCaseMessage = typeof caseMessages.$inferInsert;

/**
 * Cases table - tracks individual legal cases
 */
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  /** Case title/name */
  title: varchar("title", { length: 255 }).notNull(),
  /** Case category */
  category: varchar("category", { length: 50 }),
  /** Case status: open, closed, pending */
  status: varchar("status", { length: 50 }).default("open").notNull(),
  /** Case description/summary */
  description: text("description"),
  /** Client name */
  clientName: varchar("clientName", { length: 255 }),
  /** Client email */
  clientEmail: varchar("clientEmail", { length: 320 }),
  /** Client phone */
  clientPhone: varchar("clientPhone", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

/**
 * Case Documents table - stores uploaded files for each case
 */
export const caseDocuments = mysqlTable("case_documents", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to cases table */
  caseId: int("caseId").notNull(),
  /** S3 file key */
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  /** Public S3 URL */
  fileUrl: text("fileUrl").notNull(),
  /** Original filename */
  fileName: varchar("fileName", { length: 255 }).notNull(),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 100 }),
  /** File size in bytes */
  fileSize: int("fileSize"),
  /** Note/tag for this document */
  note: text("note"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type CaseDocument = typeof caseDocuments.$inferSelect;
export type InsertCaseDocument = typeof caseDocuments.$inferInsert;
