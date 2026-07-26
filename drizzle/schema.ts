import { pgTable, index, bigserial, serial, integer, text, jsonb, varchar, timestamp, numeric, smallint } from "drizzle-orm/pg-core"

export const brainEmbeddings = pgTable("brain_embeddings", {
	id: bigserial({ mode: "number" }).notNull(),
	documentId: integer("document_id").notNull(),
	chunkIndex: integer("chunk_index").notNull(),
	chunkText: text("chunk_text").notNull(),
	chunkTokens: integer("chunk_tokens"),
	embedding: jsonb().notNull(),
	documentTitle: text("document_title"),
	documentDomain: varchar("document_domain", { length: 100 }),
	documentCategory: varchar("document_category", { length: 100 }),
	documentTags: text("document_tags"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("document_id").on(table.documentId, table.chunkIndex),
	index("id").on(table.id),
	index("idx_embeddings_document").on(table.documentId),
	index("idx_embeddings_domain").on(table.documentDomain),
	index("idx_embeddings_category").on(table.documentCategory),
]);

export const businessIntakes = pgTable("business_intakes", {
	id: serial().primaryKey(),
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
	portalEnabled: smallint("portal_enabled").default(0),
	unreadMessagesCount: integer("unread_messages_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const caseAnalyses = pgTable("case_analyses", {
	id: serial().primaryKey(),
	caseId: integer("case_id").notNull(),
	violations: text(),
	lawsCited: text("laws_cited"),
	recommendedActions: text("recommended_actions"),
	urgencyLevel: varchar("urgency_level", { length: 50 }),
	estimatedValue: numeric("estimated_value", { precision: 10, scale: 2 }),
	successProbability: numeric("success_probability", { precision: 3, scale: 2 }),
	pricingSuggestion: numeric("pricing_suggestion", { precision: 10, scale: 2 }),
	pricingTier: varchar("pricing_tier", { length: 50 }),
	summary: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_case_id").on(table.caseId),
	index("case_id").on(table.caseId),
]);

export const caseDocuments = pgTable("case_documents", {
	id: serial().primaryKey(),
	caseId: integer().notNull(),
	fileKey: varchar({ length: 500 }).notNull(),
	fileUrl: text().notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	mimeType: varchar({ length: 100 }),
	fileSize: integer(),
	note: text(),
	uploadedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const caseMessages = pgTable("case_messages", {
	id: serial().primaryKey(),
	caseId: integer().notNull(),
	sender: varchar({ length: 20 }).notNull(),
	senderName: varchar({ length: 255 }),
	messageText: text(),
	filePath: text(),
	fileName: varchar({ length: 255 }),
	fileType: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const cases = pgTable("cases", {
	id: serial().primaryKey(),
	conversationId: integer("conversationId"),
	title: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 50 }),
	caseType: varchar({ length: 20 }),
	status: varchar({ length: 50 }).default('open').notNull(),
	description: text(),
	clientName: varchar({ length: 255 }),
	clientEmail: varchar({ length: 320 }),
	clientPhone: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
	id: serial().primaryKey(),
	userId: integer(),
	category: varchar({ length: 50 }),
	status: varchar({ length: 50 }).default('active').notNull(),
	summary: text(),
	messageCount: integer().default(0).notNull(),
	evidenceCount: integer().default(0).notNull(),
	convertedToLead: integer().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const dashboardLeads = pgTable("dashboard_leads", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 50 }).$type<'new' | 'reviewing' | 'follow_up' | 'converted' | 'closed'>().default('new').notNull(),
	note: varchar({ length: 500 }),
	hubspotUrl: varchar({ length: 1000 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const defenseCases = pgTable("defense_cases", {
	id: serial().primaryKey(),
	fullName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	address: text(),
	caseCategory: varchar({ length: 50 }).notNull(),
	caseDescription: text().notNull(),
	status: varchar({ length: 50 }).default('open').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const eligibilityProfiles = pgTable("eligibility_profiles", {
	id: serial().primaryKey(),
	defenseCaseId: integer(),
	caseId: integer().notNull(),
	userEmail: varchar({ length: 320 }).notNull(),
	zipCode: varchar({ length: 10 }),
	state: varchar({ length: 2 }),
	county: varchar({ length: 100 }),
	householdSize: integer(),
	monthlyIncomeRange: varchar({ length: 50 }),
	housingStatus: varchar({ length: 50 }),
	employmentStatus: varchar({ length: 50 }),
	specialCircumstances: text(),
	benefitsConsent: integer().default(0).notNull(),
	lastMatchedAt: timestamp({ mode: 'string' }),
	matchCount: integer().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	matchingStatus: varchar({ length: 20 }).default('pending'),
	matchingScore: integer(),
	matchedPrograms: jsonb(),
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

export const evidenceUploads = pgTable("evidence_uploads", {
	id: serial().primaryKey(),
	conversationId: integer().notNull(),
	fileKey: varchar({ length: 500 }).notNull(),
	fileUrl: text().notNull(),
	filename: varchar({ length: 255 }),
	mimeType: varchar({ length: 100 }),
	fileSize: integer(),
	uploadedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const intakeLeads = pgTable("intake_leads", {
	id: serial().primaryKey(),
	fullName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 100 }),
	socialHandle: varchar({ length: 255 }),
	situationPreview: text(),
	fullSituation: text(),
	source: varchar({ length: 50 }).default('intake').notNull(),
	status: varchar({ length: 50 }).$type<'new_lead' | 'reviewing' | 'follow_up' | 'converted'>().default('new_lead').notNull(),
	adminNotes: text(),
	submittedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const leadNotes = pgTable("lead_notes", {
	id: serial().primaryKey(),
	leadId: integer().notNull(),
	content: text().notNull(),
	noteType: varchar({ length: 50 }).default('general').notNull(),
	createdBy: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const leads = pgTable("leads", {
	id: serial().primaryKey(),
	conversationId: integer().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	bestTimeToCall: varchar({ length: 20 }),
	status: varchar({ length: 50 }).default('new').notNull(),
	notes: text(),
	category: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	id: serial().primaryKey(),
	conversationId: integer().notNull(),
	role: varchar({ length: 20 }).notNull(),
	content: text().notNull(),
	metadata: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const offenseCases = pgTable("offense_cases", {
	id: serial().primaryKey(),
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
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const priorities = pgTable("priorities", {
	id: serial().primaryKey(),
	text: varchar({ length: 500 }).notNull(),
	urgent: integer().default(0).notNull(),
	done: integer().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const projects = pgTable("projects", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 50 }).$type<'active' | 'paused' | 'done'>().default('active').notNull(),
	progress: integer().default(0).notNull(),
	nextStep: varchar({ length: 500 }),
	objective: text(),
	keySteps: text(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	driveUrl: varchar({ length: 1000 }),
});

export const tasks = pgTable("tasks", {
	id: serial().primaryKey(),
	text: varchar({ length: 500 }).notNull(),
	bucket: varchar({ length: 50 }).$type<'today' | 'week' | 'someday'>().default('today').notNull(),
	done: integer().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const turboIntakeSubmissions = pgTable("turbo_intake_submissions", {
	id: serial().primaryKey(),
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
	auditGenerated: integer().default(0).notNull(),
	auditGeneratedAt: timestamp({ mode: 'string' }),
	auditReportPath: varchar({ length: 500 }),
	blueprintGenerated: integer().default(0).notNull(),
	blueprintGeneratedAt: timestamp({ mode: 'string' }),
	blueprintReportPath: varchar({ length: 500 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("turbo_intake_submissions_submissionId_unique").on(table.submissionId),
]);

export const users = pgTable("users", {
	id: serial().primaryKey(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: varchar({ length: 50 }).$type<'user' | 'admin'>().default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).defaultNow().notNull(),
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
export const knowledgeDocuments = pgTable("knowledge_documents", {
	id: serial().primaryKey(),
	title: varchar({ length: 500 }).notNull(),
	category: varchar({ length: 100 }).notNull(),
	subcategory: varchar({ length: 100 }),
	/** Source system: google_drive, upload, xai_collection, manual */
	source: varchar({ length: 50 }).default('google_drive').notNull(),
	/** Renamed to sourceSystem for clarity with new source_system field */
	source_system: varchar({ length: 50 }).$type<'google_drive' | 'upload' | 'xai_collection' | 'manual'>().default('google_drive').notNull(),
	sourceUrl: varchar({ length: 1000 }),
	fileType: varchar({ length: 50 }),
	content: text(),
	summary: text(),
	status: varchar({ length: 50 }).$type<'active' | 'archived' | 'needs_review'>().default('active').notNull(),
	isProcessed: integer().default(0).notNull(),
	adminNotes: text(),
	/** Timestamp of last sync to xAI Collections */
	last_synced_at: timestamp({ mode: 'string' }),
	/** xAI Collections ID (populated after sync) */
	xai_collection_id: varchar({ length: 255 }),
	/** Flag indicating if document has been synced to xAI Collections */
	synced_to_xai: integer().default(0).notNull(),
	/** SHA256 hash of document content for change detection */
	content_hash: varchar({ length: 64 }),
	/** Workspace ID for future multi-tenant support */
	workspace_id: integer(),
	dateAdded: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
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

export const turboSignals = pgTable("turbo_signals", {
	id: serial().primaryKey(),
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
	opportunityScore: integer("opportunity_score"),
	fileUrl: text("file_url"),
	fileName: varchar("file_name", { length: 255 }),
	pipelineId: integer("pipeline_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const pipelineOpportunities = pgTable("pipeline_opportunities", {
	id: serial().primaryKey(),
	signalId: integer("signal_id"),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	contactName: varchar("contact_name", { length: 255 }),
	contactEmail: varchar("contact_email", { length: 320 }),
	opportunityScore: integer("opportunity_score"),
	recommendedAction: text("recommended_action"),
	stage: varchar({ length: 50 }).$type<'lead' | 'discovery' | 'proposal' | 'client' | 'completed'>().default('lead').notNull(),
	value: numeric({ precision: 10, scale: 2 }),
	nextStep: text("next_step"),
	followUpDate: varchar("follow_up_date", { length: 50 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const missionTasks = pgTable("mission_tasks", {
	id: serial().primaryKey(),
	title: varchar({ length: 500 }).notNull(),
	companyName: varchar("company_name", { length: 255 }),
	contactName: varchar("contact_name", { length: 255 }),
	signalId: integer("signal_id"),
	dueDate: varchar("due_date", { length: 50 }),
	priority: varchar({ length: 50 }).$type<'low' | 'medium' | 'high' | 'urgent'>().default('medium').notNull(),
	notes: text(),
	status: varchar({ length: 50 }).$type<'pending' | 'in_progress' | 'completed'>().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export type TurboSignal = typeof turboSignals.$inferSelect;
export type InsertTurboSignal = typeof turboSignals.$inferInsert;
export type PipelineOpportunity = typeof pipelineOpportunities.$inferSelect;
export type InsertPipelineOpportunity = typeof pipelineOpportunities.$inferInsert;
export type MissionTask = typeof missionTasks.$inferSelect;
export type InsertMissionTask = typeof missionTasks.$inferInsert;



// ── WORKSPACES ─────────────────────────────────────────────────────────────────
export const workspaces = pgTable("workspaces", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 50 }).$type<'internal_case' | 'consumer_case' | 'client_project' | 'business_project'>().notNull(),
	description: text(),
	status: varchar({ length: 50 }).$type<'planning' | 'active' | 'waiting' | 'completed' | 'archived'>().default('planning').notNull(),
	priority: varchar({ length: 50 }).$type<'low' | 'normal' | 'high' | 'urgent'>().default('normal').notNull(),
	assignedTo: varchar("assigned_to", { length: 255 }),
	dueDate: varchar("due_date", { length: 50 }),
	notes: text(),
	// Future-ready fields
	workspaceId: varchar("workspace_id", { length: 64 }), // unique slug for future portals
	clientId: integer("client_id"), // link to client/pipeline
	signalId: integer("signal_id"), // link to originating signal
	metadata: jsonb(), // extensible JSON for AI chat, research, etc.
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const workspaceTasks = pgTable("workspace_tasks", {
	id: serial().primaryKey(),
	workspaceId: integer("workspace_id").notNull(),
	title: varchar({ length: 500 }).notNull(),
	status: varchar({ length: 50 }).$type<'pending' | 'in_progress' | 'completed'>().default('pending').notNull(),
	priority: varchar({ length: 50 }).$type<'low' | 'normal' | 'high' | 'urgent'>().default('normal').notNull(),
	dueDate: varchar("due_date", { length: 50 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const workspaceNotes = pgTable("workspace_notes", {
	id: serial().primaryKey(),
	workspaceId: integer("workspace_id").notNull(),
	author: varchar({ length: 255 }).default('Demarcus'),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const workspaceDocuments = pgTable("workspace_documents", {
	id: serial().primaryKey(),
	workspaceId: integer("workspace_id").notNull(),
	fileName: varchar("file_name", { length: 500 }).notNull(),
	fileUrl: text("file_url").notNull(),
	fileType: varchar("file_type", { length: 50 }),
	fileSize: integer("file_size"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const workspaceTimeline = pgTable("workspace_timeline", {
	id: serial().primaryKey(),
	workspaceId: integer("workspace_id").notNull(),
	event: varchar({ length: 500 }).notNull(),
	eventType: varchar("event_type", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const workspaceNextActions = pgTable("workspace_next_actions", {
	id: serial().primaryKey(),
	workspaceId: integer("workspace_id").notNull(),
	action: varchar({ length: 500 }).notNull(),
	completed: smallint().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;
export type WorkspaceTask = typeof workspaceTasks.$inferSelect;
export type WorkspaceNote = typeof workspaceNotes.$inferSelect;
export type WorkspaceDocument = typeof workspaceDocuments.$inferSelect;
export type WorkspaceTimelineEvent = typeof workspaceTimeline.$inferSelect;
export type WorkspaceNextAction = typeof workspaceNextActions.$inferSelect;


// ── AI BRIEFS ─────────────────────────────────────────────────────────────────
export const aiBriefs = pgTable("ai_briefs", {
	id: serial().primaryKey(),
	sourceType: varchar("sourceType", { length: 32 }).notNull(), // 'workspace' or 'signal'
	sourceId: integer("sourceId").notNull(),
	sourceName: varchar("sourceName", { length: 255 }),
	briefType: varchar("briefType", { length: 64 }).notNull(), // workspace type or 'signal'
	content: jsonb().notNull(), // Structured brief sections as JSON
	rawData: jsonb(), // Raw collected data used to generate the brief
	generatedAt: timestamp("generatedAt", { mode: 'string' }).defaultNow().notNull(),
	metadata: jsonb(), // Future: LLM model used, tokens, etc.
	createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow().notNull(),
});

export type AiBrief = typeof aiBriefs.$inferSelect;
export type InsertAiBrief = typeof aiBriefs.$inferInsert;


// ── WORKSPACE AI ANALYSES ─────────────────────────────────────────────────────
export const workspaceAiAnalyses = pgTable("workspace_ai_analyses", {
	id: serial().primaryKey(),
	workspaceId: integer("workspaceId").notNull(),
	title: varchar({ length: 500 }).notNull(),
	aiSource: varchar("aiSource", { length: 50 }).notNull(), // chatgpt, manus, claude, gemini, grok, perplexity, notebooklm, other
	analysisType: varchar("analysisType", { length: 50 }).notNull(), // strategy, research, case_review, etc.
	content: text().notNull(),
	tags: jsonb(), // Array of string tags
	// Future-ready fields
	generatedBy: varchar("generatedBy", { length: 32 }).default('manual'), // manual or api
	modelVersion: varchar("modelVersion", { length: 100 }),
	confidenceScore: numeric("confidenceScore", { precision: 5, scale: 2 }),
	parentAnalysisId: integer("parentAnalysisId"),
	metadata: jsonb(),
	createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { mode: 'string' }).defaultNow().notNull(),
});

export type WorkspaceAiAnalysis = typeof workspaceAiAnalyses.$inferSelect;
export type InsertWorkspaceAiAnalysis = typeof workspaceAiAnalyses.$inferInsert;
