import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, bigint, int, text, json, varchar, timestamp, decimal, mysqlEnum, longtext, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const brainEmbeddings = mysqlTable("brain_embeddings", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	documentId: int("document_id").notNull(),
	chunkIndex: int("chunk_index").notNull(),
	chunkText: text("chunk_text").notNull(),
	chunkTokens: int("chunk_tokens"),
	embedding: json().notNull(),
	documentTitle: text("document_title"),
	documentDomain: varchar("document_domain", { length: 100 }),
	documentCategory: varchar("document_category", { length: 100 }),
	documentTags: text("document_tags"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => [
	index("document_id").on(table.documentId, table.chunkIndex),
	index("id").on(table.id),
	index("idx_embeddings_document").on(table.documentId),
	index("idx_embeddings_domain").on(table.documentDomain),
	index("idx_embeddings_category").on(table.documentCategory),
]);

export const businessIntakes = mysqlTable("business_intakes", {
	id: int().autoincrement().notNull(),
	businessName: varchar("business_name", { length: 255 }),
	websiteUrl: varchar("website_url", { length: 500 }),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }),
	whatYouSell: text("what_you_sell"),
	idealCustomer: text("ideal_customer"),
	biggestStruggle: text("biggest_struggle"),
	shortTermGoal: text("short_term_goal"),
	longTermVision: text("long_term_vision"),
	instagramUrl: varchar("instagram_url", { length: 500 }),
	tiktokUrl: varchar("tiktok_url", { length: 500 }),
	facebookUrl: varchar("facebook_url", { length: 500 }),
	youtubeUrl: varchar("youtube_url", { length: 500 }),
	linkinbioUrl: varchar("linkinbio_url", { length: 500 }),
	status: varchar({ length: 50 }).default('New'),
	portalEnabled: tinyint("portal_enabled").default(0),
	unreadMessagesCount: int("unread_messages_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

export const caseAnalyses = mysqlTable("case_analyses", {
	id: int().autoincrement().notNull(),
	caseId: int("case_id").notNull(),
	violations: text(),
	lawsCited: text("laws_cited"),
	recommendedActions: text("recommended_actions"),
	urgencyLevel: varchar("urgency_level", { length: 50 }),
	estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
	successProbability: decimal("success_probability", { precision: 3, scale: 2 }),
	pricingSuggestion: decimal("pricing_suggestion", { precision: 10, scale: 2 }),
	pricingTier: varchar("pricing_tier", { length: 50 }),
	summary: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
},
(table) => [
	index("idx_case_id").on(table.caseId),
	index("case_id").on(table.caseId),
]);

export const caseDocuments = mysqlTable("case_documents", {
	id: int().autoincrement().notNull(),
	caseId: int().notNull(),
	fileKey: varchar({ length: 500 }).notNull(),
	fileUrl: text().notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	mimeType: varchar({ length: 100 }),
	fileSize: int(),
	note: text(),
	uploadedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const caseMessages = mysqlTable("case_messages", {
	id: int().autoincrement().notNull(),
	caseId: int().notNull(),
	sender: varchar({ length: 20 }).notNull(),
	senderName: varchar({ length: 255 }),
	messageText: text(),
	filePath: text(),
	fileName: varchar({ length: 255 }),
	fileType: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const cases = mysqlTable("cases", {
	id: int().autoincrement().notNull(),
	conversationId: int("conversationId"),
	title: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 50 }),
	caseType: varchar({ length: 20 }),
	status: varchar({ length: 50 }).default('open').notNull(),
	description: text(),
	clientName: varchar({ length: 255 }),
	clientEmail: varchar({ length: 320 }),
	clientPhone: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
	id: int().autoincrement().notNull(),
	userId: int(),
	category: varchar({ length: 50 }),
	status: varchar({ length: 50 }).default('active').notNull(),
	summary: text(),
	messageCount: int().default(0).notNull(),
	evidenceCount: int().default(0).notNull(),
	convertedToLead: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const dashboardLeads = mysqlTable("dashboard_leads", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['new','reviewing','follow_up','converted','closed']).default('new').notNull(),
	note: varchar({ length: 500 }),
	hubspotUrl: varchar({ length: 1000 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const defenseCases = mysqlTable("defense_cases", {
	id: int().autoincrement().notNull(),
	fullName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	address: text(),
	caseCategory: varchar({ length: 50 }).notNull(),
	caseDescription: text().notNull(),
	status: varchar({ length: 50 }).default('open').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const eligibilityProfiles = mysqlTable("eligibility_profiles", {
	id: int().autoincrement().notNull(),
	defenseCaseId: int(),
	caseId: int().notNull(),
	userEmail: varchar({ length: 320 }).notNull(),
	zipCode: varchar({ length: 10 }),
	state: varchar({ length: 2 }),
	county: varchar({ length: 100 }),
	householdSize: int(),
	monthlyIncomeRange: varchar({ length: 50 }),
	housingStatus: varchar({ length: 50 }),
	employmentStatus: varchar({ length: 50 }),
	specialCircumstances: text(),
	benefitsConsent: int().default(0).notNull(),
	lastMatchedAt: timestamp({ mode: 'string' }),
	matchCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
	matchingStatus: varchar({ length: 20 }).default('pending'),
	matchingScore: int(),
	matchedPrograms: json(),
	reportGeneratedAt: timestamp({ mode: 'string' }),
	approvedBy: varchar({ length: 255 }),
	approvedAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("idx_case_id").on(table.caseId),
	index("idx_user_email").on(table.userEmail),
	index("idx_benefits_consent").on(table.benefitsConsent),
	index("idx_zip_code").on(table.zipCode),
]);

export const evidenceUploads = mysqlTable("evidence_uploads", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	fileKey: varchar({ length: 500 }).notNull(),
	fileUrl: text().notNull(),
	filename: varchar({ length: 255 }),
	mimeType: varchar({ length: 100 }),
	fileSize: int(),
	uploadedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const intakeLeads = mysqlTable("intake_leads", {
	id: int().autoincrement().notNull(),
	fullName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 100 }),
	socialHandle: varchar({ length: 255 }),
	situationPreview: text(),
	fullSituation: longtext(),
	source: varchar({ length: 50 }).default('intake').notNull(),
	status: mysqlEnum(['new_lead','reviewing','follow_up','converted']).default('new_lead').notNull(),
	adminNotes: longtext(),
	submittedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const leadNotes = mysqlTable("lead_notes", {
	id: int().autoincrement().notNull(),
	leadId: int().notNull(),
	content: text().notNull(),
	noteType: varchar({ length: 50 }).default('general').notNull(),
	createdBy: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const leads = mysqlTable("leads", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	bestTimeToCall: varchar({ length: 20 }),
	status: varchar({ length: 50 }).default('new').notNull(),
	notes: text(),
	category: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const messages = mysqlTable("messages", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	role: varchar({ length: 20 }).notNull(),
	content: text().notNull(),
	metadata: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const offenseCases = mysqlTable("offense_cases", {
	id: int().autoincrement().notNull(),
	fullName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	businessName: varchar({ length: 255 }),
	entityType: varchar({ length: 50 }),
	websiteUrl: text(),
	instagramUrl: text(),
	tiktokUrl: text(),
	facebookUrl: text(),
	youtubeUrl: text(),
	linkInBio: text(),
	primaryGoal: varchar({ length: 100 }),
	targetAuthority: text(),
	stage: varchar({ length: 100 }),
	estimatedAmount: varchar({ length: 50 }),
	deadline: varchar({ length: 50 }),
	caseDescription: text().notNull(),
	status: varchar({ length: 50 }).default('open').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const priorities = mysqlTable("priorities", {
	id: int().autoincrement().notNull(),
	text: varchar({ length: 500 }).notNull(),
	urgent: int().default(0).notNull(),
	done: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const projects = mysqlTable("projects", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['active','paused','done']).default('active').notNull(),
	progress: int().default(0).notNull(),
	nextStep: varchar({ length: 500 }),
	objective: text(),
	keySteps: longtext(),
	notes: longtext(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
	driveUrl: varchar({ length: 1000 }),
});

export const tasks = mysqlTable("tasks", {
	id: int().autoincrement().notNull(),
	text: varchar({ length: 500 }).notNull(),
	bucket: mysqlEnum(['today','week','someday']).default('today').notNull(),
	done: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const turboIntakeSubmissions = mysqlTable("turbo_intake_submissions", {
	id: int().autoincrement().notNull(),
	submissionId: varchar({ length: 100 }).notNull(),
	businessName: varchar({ length: 255 }).notNull(),
	ownerName: varchar({ length: 255 }).notNull(),
	industry: varchar({ length: 255 }),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	whatYouSell: text(),
	idealCustomer: text(),
	biggestStruggle: text(),
	goal60To90Days: text(),
	longTermVision: text(),
	websiteUrl: varchar({ length: 500 }),
	instagramHandle: varchar({ length: 100 }),
	facebookUrl: varchar({ length: 500 }),
	tiktokHandle: varchar({ length: 100 }),
	otherSocialMedia: text(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	auditGenerated: int().default(0).notNull(),
	auditGeneratedAt: timestamp({ mode: 'string' }),
	auditReportPath: varchar({ length: 500 }),
	blueprintGenerated: int().default(0).notNull(),
	blueprintGeneratedAt: timestamp({ mode: 'string' }),
	blueprintReportPath: varchar({ length: 500 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => [
	index("turbo_intake_submissions_submissionId_unique").on(table.submissionId),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	password: varchar({ length: 255 }),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

/**
 * Knowledge Base Documents — foundation for RAG system
 * Stores metadata and extracted text from Google Drive documents
 * Google Drive is the source of truth; this table stores searchable content + metadata
 * Later: embeddings stored in Supabase pgvector, not here
 */
export const knowledgeDocuments = mysqlTable("knowledge_documents", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	category: varchar({ length: 100 }).notNull(),
	subcategory: varchar({ length: 100 }),
	/** Source system: google_drive, upload, xai_collection, manual */
	source: varchar({ length: 50 }).default('google_drive').notNull(),
	/** Renamed to sourceSystem for clarity with new source_system field */
	source_system: mysqlEnum(['google_drive', 'upload', 'xai_collection', 'manual']).default('google_drive').notNull(),
	sourceUrl: varchar({ length: 1000 }),
	fileType: varchar({ length: 50 }),
	content: longtext(),
	summary: text(),
	status: mysqlEnum(['active', 'archived', 'needs_review']).default('active').notNull(),
	isProcessed: int().default(0).notNull(),
	adminNotes: text(),
	/** Timestamp of last sync to xAI Collections */
	last_synced_at: timestamp({ mode: 'string' }),
	/** xAI Collections ID (populated after sync) */
	xai_collection_id: varchar({ length: 255 }),
	/** Flag indicating if document has been synced to xAI Collections */
	synced_to_xai: int().default(0).notNull(),
	/** SHA256 hash of document content for change detection */
	content_hash: varchar({ length: 64 }),
	/** Workspace ID for future multi-tenant support */
	workspace_id: int(),
	dateAdded: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = typeof knowledgeDocuments.$inferInsert;

export type IntakeLead = typeof intakeLeads.$inferSelect;
export type InsertIntakeLead = typeof intakeLeads.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export type EvidenceUpload = typeof evidenceUploads.$inferSelect;
export type InsertEvidenceUpload = typeof evidenceUploads.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── TURBO MISSION CONTROL ────────────────────────────────────────────────────

export const turboSignals = mysqlTable("turbo_signals", {
	id: int().autoincrement().primaryKey(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	website: varchar({ length: 500 }),
	industry: varchar({ length: 100 }),
	contactName: varchar("contact_name", { length: 255 }),
	contactRole: varchar("contact_role", { length: 255 }),
	contactEmail: varchar("contact_email", { length: 320 }),
	sourceType: varchar("source_type", { length: 50 }),
	sourceLink: varchar("source_link", { length: 1000 }),
	signalType: varchar("signal_type", { length: 50 }),
	dateCaptured: varchar("date_captured", { length: 50 }),
	notes: text(),
	aiSummary: text("ai_summary"),
	recommendedAction: text("recommended_action"),
	opportunityScore: int("opportunity_score"),
	fileUrl: text("file_url"),
	fileName: varchar("file_name", { length: 255 }),
	pipelineId: int("pipeline_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const pipelineOpportunities = mysqlTable("pipeline_opportunities", {
	id: int().autoincrement().primaryKey(),
	signalId: int("signal_id"),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	contactName: varchar("contact_name", { length: 255 }),
	contactEmail: varchar("contact_email", { length: 320 }),
	opportunityScore: int("opportunity_score"),
	recommendedAction: text("recommended_action"),
	stage: mysqlEnum(['lead', 'discovery', 'proposal', 'client', 'completed']).default('lead').notNull(),
	value: decimal({ precision: 10, scale: 2 }),
	nextStep: text("next_step"),
	followUpDate: varchar("follow_up_date", { length: 50 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const missionTasks = mysqlTable("mission_tasks", {
	id: int().autoincrement().primaryKey(),
	title: varchar({ length: 500 }).notNull(),
	companyName: varchar("company_name", { length: 255 }),
	contactName: varchar("contact_name", { length: 255 }),
	signalId: int("signal_id"),
	dueDate: varchar("due_date", { length: 50 }),
	priority: mysqlEnum(['low', 'medium', 'high', 'urgent']).default('medium').notNull(),
	notes: text(),
	status: mysqlEnum(['pending', 'in_progress', 'completed']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export type TurboSignal = typeof turboSignals.$inferSelect;
export type InsertTurboSignal = typeof turboSignals.$inferInsert;
export type PipelineOpportunity = typeof pipelineOpportunities.$inferSelect;
export type InsertPipelineOpportunity = typeof pipelineOpportunities.$inferInsert;
export type MissionTask = typeof missionTasks.$inferSelect;
export type InsertMissionTask = typeof missionTasks.$inferInsert;



// ── WORKSPACES ─────────────────────────────────────────────────────────────────
export const workspaces = mysqlTable("workspaces", {
	id: int().autoincrement().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	type: mysqlEnum(['internal_case', 'consumer_case', 'client_project', 'business_project']).notNull(),
	description: text(),
	status: mysqlEnum(['planning', 'active', 'waiting', 'completed', 'archived']).default('planning').notNull(),
	priority: mysqlEnum(['low', 'normal', 'high', 'urgent']).default('normal').notNull(),
	assignedTo: varchar("assigned_to", { length: 255 }),
	dueDate: varchar("due_date", { length: 50 }),
	notes: text(),
	// Future-ready fields
	workspaceId: varchar("workspace_id", { length: 64 }), // unique slug for future portals
	clientId: int("client_id"), // link to client/pipeline
	signalId: int("signal_id"), // link to originating signal
	metadata: json(), // extensible JSON for AI chat, research, etc.
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const workspaceTasks = mysqlTable("workspace_tasks", {
	id: int().autoincrement().primaryKey(),
	workspaceId: int("workspace_id").notNull(),
	title: varchar({ length: 500 }).notNull(),
	status: mysqlEnum(['pending', 'in_progress', 'completed']).default('pending').notNull(),
	priority: mysqlEnum(['low', 'normal', 'high', 'urgent']).default('normal').notNull(),
	dueDate: varchar("due_date", { length: 50 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
});

export const workspaceNotes = mysqlTable("workspace_notes", {
	id: int().autoincrement().primaryKey(),
	workspaceId: int("workspace_id").notNull(),
	author: varchar({ length: 255 }).default('Demarcus'),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const workspaceDocuments = mysqlTable("workspace_documents", {
	id: int().autoincrement().primaryKey(),
	workspaceId: int("workspace_id").notNull(),
	fileName: varchar("file_name", { length: 500 }).notNull(),
	fileUrl: text("file_url").notNull(),
	fileType: varchar("file_type", { length: 50 }),
	fileSize: int("file_size"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const workspaceTimeline = mysqlTable("workspace_timeline", {
	id: int().autoincrement().primaryKey(),
	workspaceId: int("workspace_id").notNull(),
	event: varchar({ length: 500 }).notNull(),
	eventType: varchar("event_type", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const workspaceNextActions = mysqlTable("workspace_next_actions", {
	id: int().autoincrement().primaryKey(),
	workspaceId: int("workspace_id").notNull(),
	action: varchar({ length: 500 }).notNull(),
	completed: tinyint().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;
export type WorkspaceTask = typeof workspaceTasks.$inferSelect;
export type WorkspaceNote = typeof workspaceNotes.$inferSelect;
export type WorkspaceDocument = typeof workspaceDocuments.$inferSelect;
export type WorkspaceTimelineEvent = typeof workspaceTimeline.$inferSelect;
export type WorkspaceNextAction = typeof workspaceNextActions.$inferSelect;
