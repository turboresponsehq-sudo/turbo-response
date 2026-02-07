import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, longtext } from "drizzle-orm/mysql-core";

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
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Screenshots table for research capture feature
 * Stores uploaded screenshots with descriptions, research notes, and extracted text
 * Auto-deletes after 30 days via S3 lifecycle policy
 */
export const screenshots = mysqlTable("screenshots", {
  id: int("id").autoincrement().primaryKey(),
  /** User who uploaded the screenshot */
  userId: int("userId").notNull(),
  /** S3 file key for the original image */
  imageKey: varchar("imageKey", { length: 512 }).notNull(),
  /** S3 URL to the image (for easy access) */
  imageUrl: text("imageUrl").notNull(),
  /** User's quick description of the screenshot */
  description: text("description").notNull(),
  /** Optional research notes, Grok output, contact info, etc. */
  researchNotes: longtext("researchNotes"),
  /** Extracted text from OCR processing */
  extractedText: longtext("extractedText"),
  /** Auto-detected category: grant, partnership, lead, alert, event, other */
  category: varchar("category", { length: 50 }).default("other"),
  /** Extracted dates found in the screenshot (comma-separated) */
  extractedDates: text("extractedDates"),
  /** Extracted contact info: names, emails, phone numbers */
  extractedContacts: longtext("extractedContacts"),
  /** File size in bytes */
  fileSize: int("fileSize"),
  /** MIME type of uploaded file */
  mimeType: varchar("mimeType", { length: 50 }),
  /** When the screenshot was uploaded */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** When the screenshot will be deleted from S3 (30 days after upload) */
  expiresAt: timestamp("expiresAt").notNull(),
  /** Whether user manually saved this (prevents auto-delete) */
  isSaved: int("isSaved").default(0).notNull(),
  /** Notes about the screenshot for internal use */
  internalNotes: text("internalNotes"),
});

export type Screenshot = typeof screenshots.$inferSelect;
export type InsertScreenshot = typeof screenshots.$inferInsert;
