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

/**
 * Resource requests table - stores grant/resource intake form submissions
 * This is the system of record for all client resource requests
 * Email notifications are backups; this table is the source of truth
 */
export const resourceRequests = mysqlTable("resource_requests", {
  /** Unique identifier for each request */
  id: int("id").autoincrement().primaryKey(),
  /** Submitter's full name */
  fullName: varchar("fullName", { length: 255 }).notNull(),
  /** Submitter's email address */
  email: varchar("email", { length: 320 }).notNull(),
  /** Submitter's phone number */
  phone: varchar("phone", { length: 20 }).notNull(),
  /** Submitter's location (city/state or region) */
  location: varchar("location", { length: 255 }).notNull(),
  /** JSON array of resource types requested: housing, legal, financial, food, healthcare, etc. */
  resourceTypes: longtext("resourceTypes").notNull(), // JSON array stored as string
  /** Income level: under_30k, 30k_50k, 50k_75k, 75k_100k, over_100k */
  incomeLevel: varchar("incomeLevel", { length: 50 }),
  /** Household size: number of people in household */
  householdSize: varchar("householdSize", { length: 50 }),
  /** JSON array of demographics: veteran, elderly, disabled, student, parent, etc. */
  demographics: longtext("demographics"), // JSON array stored as string
  /** Detailed description of situation/needs */
  description: longtext("description").notNull(),
  /** Status of the request: new, processing, matched, closed, archived */
  status: mysqlEnum("status", ["new", "processing", "matched", "closed", "archived"]).default("new").notNull(),
  /** When the request was submitted */
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  /** When the request was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  /** Admin notes about this request (internal use only) */
  adminNotes: longtext("adminNotes"),
});

export type ResourceRequest = typeof resourceRequests.$inferSelect;
export type InsertResourceRequest = typeof resourceRequests.$inferInsert;

/**
 * Intake leads table - stores all form submissions from TurboIntakeForm and IntakeForm
 * This is the central lead database for the Command Center
 */
export const intakeLeads = mysqlTable("intake_leads", {
  id: int("id").autoincrement().primaryKey(),
  /** Full name of the submitter */
  fullName: varchar("fullName", { length: 255 }).notNull(),
  /** Email address */
  email: varchar("email", { length: 320 }).notNull(),
  /** Phone number */
  phone: varchar("phone", { length: 100 }),
  /** Instagram/TikTok/Facebook handle if provided */
  socialHandle: varchar("socialHandle", { length: 255 }),
  /** Short preview of their situation (first 500 chars of description) */
  situationPreview: text("situationPreview"),
  /** Full situation description */
  fullSituation: longtext("fullSituation"),
  /** Source of submission: turbo-intake (offense) or intake (defense) */
  source: varchar("source", { length: 50 }).default("intake").notNull(),
  /** Lead status for pipeline tracking */
  status: mysqlEnum("status", ["new_lead", "reviewing", "follow_up", "converted"]).default("new_lead").notNull(),
  /** Internal admin notes */
  adminNotes: longtext("adminNotes"),
  /** When the lead was submitted */
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  /** When the record was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IntakeLead = typeof intakeLeads.$inferSelect;
export type InsertIntakeLead = typeof intakeLeads.$inferInsert;

/**
 * CEO Home priorities — daily focus list, manual entry by owner
 * Resets are handled by the UI (marking done), not by the DB
 */
export const priorities = mysqlTable("priorities", {
  id: int("id").autoincrement().primaryKey(),
  text: varchar("text", { length: 500 }).notNull(),
  urgent: int("urgent").default(0).notNull(), // 1 = urgent, 0 = normal
  done: int("done").default(0).notNull(),     // 1 = done, 0 = pending
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Priority = typeof priorities.$inferSelect;
export type InsertPriority = typeof priorities.$inferInsert;

/**
 * Projects — long-term initiatives with multiple steps
 * Manual entry by owner only
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "paused", "done"]).default("active").notNull(),
  progress: int("progress").default(0).notNull(), // 0-100
  nextStep: varchar("nextStep", { length: 500 }),
  objective: text("objective"),
  keySteps: longtext("keySteps"), // JSON array stored as string
  notes: longtext("notes"),
  /** Google Drive folder or doc URL — source of truth for project files */
  driveUrl: varchar("driveUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Tasks — execution list, simple and flat
 * Buckets: today / week / someday
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  text: varchar("text", { length: 500 }).notNull(),
  bucket: mysqlEnum("bucket", ["today", "week", "someday"]).default("today").notNull(),
  done: int("done").default(0).notNull(), // 1 = done, 0 = pending
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Dashboard leads — lightweight display layer only
 * HubSpot is the source of truth; this table stores name/status/link for quick display
 * Future: replace with live HubSpot API pull
 */
export const dashboardLeads = mysqlTable("dashboard_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["new", "reviewing", "follow_up", "converted", "closed"]).default("new").notNull(),
  /** Short note about this lead */
  note: varchar("note", { length: 500 }),
  /** Direct link to HubSpot contact/deal record */
  hubspotUrl: varchar("hubspotUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DashboardLead = typeof dashboardLeads.$inferSelect;
export type InsertDashboardLead = typeof dashboardLeads.$inferInsert;
