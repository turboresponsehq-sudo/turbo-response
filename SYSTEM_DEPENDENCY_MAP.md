# Turbo Response — System Dependency Map

**Status:** Production architecture reference with Phase 4 configuration status  
**Primary deployment path:** GitHub `main` → Render `turbo-response-backend` → `https://turboresponsehq.ai`  
**Purpose:** Durable handoff map for future development, operational debugging, and Command Center data provenance.

> **Operating rule:** The Render PostgreSQL database is the operational source of truth. External services such as Google Drive and xAI supply source documents or processing capability; their contents must be represented through traceable records rather than copied into competing operational systems.

---

## 1. Runtime Topology

| Layer | Production component | Responsibility | Primary dependencies |
|---|---|---|---|
| Browser client | React 19 + Vite application | Public pages, admin pages, Command Center, intake and chat UI | `/api/trpc`, REST endpoints, browser `admin_session` |
| Application server | Express 4 + tRPC 11 | API routing, legacy REST compatibility, admin login, Drive/Knowledge Base processing, operational events | PostgreSQL, JWT secret, external credentials |
| Data layer | PostgreSQL on Render | Canonical operational records, Knowledge Base metadata, Workspaces, automation artifacts | Drizzle ORM and parameterized SQL |
| Object storage | S3-backed application storage | Uploaded file bytes; database holds file metadata and URLs | `server/storage.ts` |
| External document source | Canonical Turbo Response Google Drive folder | Future Drive document discovery and Knowledge Base import source | Drive API, service-account folder permission |
| AI knowledge service | xAI Collections management API | Knowledge Base document upload, collection membership, sync status | `XAI_MANAGEMENT_API_KEY`, collection ID |
| Delivery | Render web service | Builds and runs the Node bundle from GitHub `main` | Render environment, `node dist/server.js` |
| Repository automation | GitHub Actions | Secret scanning and legacy scheduled intelligence workflow | GitHub Actions permissions and secrets |

---

## 2. Frontend Modules and Command Center Consumers

| Module | Location | Purpose | Live data dependencies |
|---|---|---|---|
| Application routing | `client/src/App.tsx` | Route registration and page composition | Page-level tRPC/REST consumers |
| tRPC client | `client/src/main.tsx`, `client/src/lib/trpc.ts` | Adds the existing admin Bearer token to tRPC transport | `admin_session` browser storage |
| Admin session bridge | `client/src/lib/adminSession.ts`, `client/src/contexts/AdminAuthContext.tsx` | Reads, refreshes, and clears the legacy admin session | `/api/auth/login`, current Render `JWT_SECRET` |
| Admin login | `client/src/pages/AdminLogin.tsx` | Email/password login and safe return to the requested admin page | Legacy REST login endpoint |
| Command Center | `client/src/pages/AdminCommandCenter.tsx` | One-operator view answering what happened, what needs attention, and what comes next | Mission Control, legacy cases, intakes, Knowledge Base, Drive config, health, Voice/Chat leads |
| Workspace views | Workspace pages/components | Workspace records, tasks, notes, documents, timelines, next actions, AI materials | `workspaces` tRPC namespace |
| Knowledge Base views | Knowledge Base pages/components | Document records, pending sync, xAI status, Drive imports | `knowledgeBase`, `googleDrive` tRPC namespaces |

### Command Center Source Map

| Command Center area | Current source | Consumer path | Honest empty/unavailable behavior |
|---|---|---|---|
| Needs Attention | Open mission tasks, high-priority signals, unread legacy messages, failed xAI sync results | `missionControl`, `admin.getOperationalCaseSummary`, `knowledgeBase` | Empty if no real source record exists |
| New Leads | `intake_leads`, `business_intakes`, Voice/Chat `leads` | `admin.getIntakeLeads`, operational summary, `admin.getLeads` | No intake leads recorded |
| Active Cases | Legacy `cases`; Workspaces when they exist | operational summary, `workspaces.workspaces.list` | No active case records |
| Voice Intakes | Existing `leads` created by the conversational flow | `admin.getLeads` | No voice or chat intakes recorded yet |
| Documents & Sync | Knowledge documents, legacy case documents/analyses, Workspace AI records, Drive configuration/listing | `knowledgeBase`, `googleDrive`, operational summary | Reports configuration state instead of inventing a sync count |
| Follow-ups / Tasks | `mission_tasks` plus automation-created tasks | `missionControl.tasks.list` | No tasks recorded |
| Turbo Signals / Pipeline | `turbo_signals`, `pipeline_opportunities` | Mission Control routers | Empty until a real event creates a record |
| System Health | Application health and integration configuration | `system`, `googleDrive.checkConfig` | Compact unhealthy/unconfigured state |

---

## 3. Authentication and Session Flow

### Approved production access boundary

```text
Admin email/password
  → POST /api/auth/login
  → signed legacy admin JWT stored as admin_session
  → Authorization: Bearer <token> on tRPC requests
  → server/_core/context.ts verifies JWT against current JWT_SECRET
  → minimal current-user lookup (id, email, role)
  → protectedProcedure / adminProcedure authorization
```

The tRPC context accepts a numeric or strictly numeric-string user ID only after signature verification. It resolves the current database user and requires the database role to remain `admin`; token claims alone are not authorization. Individual query failures must remain contained in the Command Center and must not redirect the owner into Manus OAuth.

| Component | File | Responsibility |
|---|---|---|
| tRPC context | `server/_core/context.ts` | Manus session first, legacy admin JWT compatibility second |
| Procedure guards | `server/_core/trpc.ts` | `publicProcedure`, `protectedProcedure`, `adminProcedure` |
| Legacy login | `server/_core/index.ts` | Issues the short-lived admin JWT after password verification |
| Browser session | `AdminAuthContext.tsx`, `adminSession.ts` | Persists and forwards the current admin session |

---

## 4. API and Router Map

All tRPC traffic is served under `/api/trpc`. The application router is declared in `server/routers.ts`.

| Namespace | Primary implementation | Responsibility |
|---|---|---|
| `auth` | `server/routers.ts` | Current user and cookie logout |
| `system` | `server/_core/systemRouter.ts` | System operations and owner notification support |
| `chat` | `server/routers/chatRouter.ts` | Conversation handling and Voice/Chat lead conversion |
| `admin` | `server/routers/adminRouter.ts` | Intake leads, Voice/Chat leads, operational case summary |
| `messaging` | `server/routers/messagingRouter.ts` | Client/admin communication operations |
| `dashboard` | `server/routers/dashboardRouter.ts` | Legacy CEO/dashboard data |
| `knowledgeBase` | `server/routers/knowledgeBaseRouter.ts` | Knowledge document management and xAI sync actions |
| `googleDrive` | `server/routers/googleDriveRouter.ts` | Drive listing, recursive discovery, import, and configuration status |
| `missionControl` | `server/routers/missionControlRouter.ts` | Signals, pipeline opportunities, and mission tasks |
| `workspaces` | `server/routers/workspacesRouter.ts` | Workspace CRUD and related operational records |
| `aiBrief` | `server/routers/aiBriefRouter.ts` | Structured AI brief repository |
| `aiAnalysis` | `server/routers/aiAnalysisRouter.ts` | Workspace AI analysis repository |

Legacy REST routes remain mounted by `server/_core/index.ts` for login, consumer/business intake, case extras, uploads, portal flows, and legacy admin compatibility. New operational UI work should prefer existing tRPC routes when an equivalent procedure exists.

---

## 5. Database Domains and Relationships

| Domain | Core tables | Relationship and ownership notes |
|---|---|---|
| Identity | `users` | Current admin role is checked on every protected legacy-session request |
| Legacy operations | `cases`, `case_documents`, `case_messages`, `case_analyses` | `cases` remains the system of record for historical case activity; related records refer to `case_id` |
| Intake | `intake_leads`, `business_intakes`, `turbo_intake_submissions` | Real form and business submissions; source for operator lead activity |
| Voice/Chat | `conversations`, `messages`, `leads`, `evidence_uploads` | Conversation may produce one lead; messages and evidence remain linked to the conversation |
| Knowledge | `knowledge_documents`, `brain_embeddings` | Drive/imported content enters `knowledge_documents`; content hash, sync state, and xAI collection metadata preserve provenance |
| Mission Control | `turbo_signals`, `pipeline_opportunities`, `mission_tasks` | Signals can feed pipeline opportunities and tasks; event keys protect against duplicate automation output |
| Workspaces | `workspaces`, `workspace_tasks`, `workspace_notes`, `workspace_documents`, `workspace_timeline`, `workspace_next_actions` | Workspace is a future-focused operations layer; `legacy_case_id` is an optional reference, not a case copy |
| AI records | `ai_briefs`, `workspace_ai_analyses` | Saved structured briefs and externally/manual AI analyses attached to signals or workspaces |

### No-duplication case rule

Legacy `cases` are the source of truth for existing case records. A Workspace may reference `legacy_case_id` when a workspace is needed for ongoing operational management, but historical cases must not be copied into Workspaces merely to populate a dashboard.

---

## 6. Google Drive and Knowledge Base Flow

```text
Canonical Google Drive folder
  → Google Drive API listing / recursive discovery
  → extract text and metadata
  → knowledge_documents with source_system=google_drive and source URL
  → content hash detects a real change
  → xAI Collections upload
  → synced_to_xai, xai_collection_id, last_synced_at updated
  → Command Center shows real sync/configuration state
```

### Canonical folder and production configuration

The intended canonical folder is the owner-provided main Turbo Response Google Drive folder. The retained secondary folder is not a current code default, Command Center default, or known production environment reference. The one unique audit report was moved into the main folder and the secondary folder was retained.

| Required configuration | Used by | Status at Phase 4 start |
|---|---|---|
| `GOOGLE_DRIVE_FOLDER_ID` | `googleDriveRouter.ts` default folder | Missing in Render when audited; owner began configuration |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | `googleDriveService.ts` authentication | Missing in Render; organization policy currently prevents creating the required JSON key |
| Folder share to service-account email | Google Drive permissions | Pending after key creation |
| `XAI_MANAGEMENT_API_KEY` | `xaiCollectionsService.ts` collection/document management | Missing in Render when audited |
| `XAI_COLLECTION_ID` | `xaiSyncService.ts` collection target | Optional explicit configuration; code currently includes a legacy fallback that should be replaced by an explicit production setting before live sync |

### Current blocker

Google organization policy `iam.disableServiceAccountKeyCreation` blocks creation of the service-account JSON key. A project-only exception or an explicitly approved keyless Drive authentication redesign is required before production server-side Drive discovery can be enabled.

---

## 7. AI Document Intelligence and Provenance

The Knowledge Base schema already supports the core provenance and processing lifecycle:

| Field or behavior | Purpose |
|---|---|
| `source`, `source_system`, `sourceUrl` | Preserve where a document came from and link back to the original Drive file |
| `fileType`, `content` | Retain extracted text and content type without replacing the source file |
| `content_hash` | Detect content changes and prevent unnecessary reprocessing |
| `summary`, `category`, `subcategory` | Store verified processing output when the pipeline has an available AI provider |
| `status`, `isProcessed`, `adminNotes` | Track review and operational state |
| `synced_to_xai`, `xai_collection_id`, `last_synced_at` | Record the external indexing state |

Document extraction, categorization, entity recognition, dates, action items, duplicates, and recommendations must only be stored when produced from real source content. No synthetic document summaries, timelines, entities, or recommendations may be seeded.

---

## 8. Voice/Chat and Operational Intelligence

### Voice/Chat data lifecycle

```text
Real chat or Voice/Chat interaction
  → conversation
  → messages and optional evidence_uploads
  → real lead conversion when contact details are supplied
  → Command Center Voice Intakes and New Leads
  → idempotent Signal, Task, and Pipeline updates when a real qualifying lead is created
```

The `conversations`, `messages`, `leads`, and `evidence_uploads` relations were added as create-only production storage. They begin empty; the Command Center therefore shows a truthful empty state until a real interaction is captured.

### Event-driven automation

`server/services/operationalIntelligenceService.ts` converts real events into operational follow-up records. All generated artifacts carry stable source event keys and are protected by unique indexes.

| Real event | Generated outputs |
|---|---|
| New intake or business intake | One Signal, one follow-up Mission Task, one Pipeline Opportunity |
| Voice/Chat lead conversion | One Signal, one high-priority Task, one Pipeline Opportunity |
| New client message | One review Task and one client-message Signal |
| Failed Knowledge Base/xAI sync | One remediation Task and one sync-failure Signal |

No historical backfill is performed. A retry of the same real source event must reuse the same key and not create duplicate Signals, Tasks, or Opportunities.

---

## 9. Scheduled and Background Work

| Workload | Current location | Trigger | Notes |
|---|---|---|---|
| Operational intelligence | Express request path | Real intake, chat lead, message, or sync-failure event | Event-driven; no polling or schedule required |
| Knowledge Base sync | Admin-triggered tRPC flow | Manual admin action or future explicit event integration | Requires Drive/xAI configuration first |
| Legacy intelligence scanner | `.github/workflows/bi-ops-automation.yml` | GitHub Actions cron and manual dispatch | Repository workflow; not a Render background worker |
| Secret scanning | GitHub Actions workflow | Push/pull-request workflow | Must remain enabled |

No high-frequency polling process is currently required. A future Drive change detector should use a verified provider webhook where available; otherwise it needs an explicitly approved background design rather than a credit-consuming agent schedule.

---

## 10. Deployment, Security, and Operations

| Concern | Current control |
|---|---|
| Source of truth | GitHub repository `turboresponsehq-sudo/turbo-response`, `main` branch |
| Production service | Render `turbo-response-backend` |
| Health probe | `/api/health` |
| Secrets | Render environment variables only; never tracked files, browser code, or documentation |
| Session security | Current JWT secret verification plus database admin-role lookup |
| Code scanning | Gitleaks workflow and release-time secret scans |
| Failure isolation | Individual Command Center query failures remain contained; they must not redirect the admin route |
| Database migrations | Versioned create/additive SQL applied manually and verified through the Render shell |

---

## 11. Phase 4 Handoff Order

1. Resolve the Google project-only service-account key policy exception, or explicitly approve a different Drive authentication architecture.
2. Set Render `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `XAI_MANAGEMENT_API_KEY`, and the intended explicit `XAI_COLLECTION_ID` securely.
3. Share only the canonical Drive folder with the service-account email as Viewer.
4. Verify Drive listing and recursive discovery against the canonical folder without importing documents.
5. Import selected real documents, inspect provenance and text extraction, and use content hashes to avoid duplicates.
6. Verify xAI collection upload and sync status on a real document.
7. Extend document-derived tasks/signals only after actual document processing is confirmed.

---

## 12. Files to Consult for Future Changes

| Concern | Primary files |
|---|---|
| Server boot and legacy routes | `server/_core/index.ts` |
| tRPC identity and authorization | `server/_core/context.ts`, `server/_core/trpc.ts` |
| Command Center | `client/src/pages/AdminCommandCenter.tsx` |
| Mission Control | `server/routers/missionControlRouter.ts`, `server/services/operationalIntelligenceService.ts` |
| Legacy cases and documents | `server/db.ts`, `server/routes/caseExtras.ts` |
| Voice/Chat | `server/routers/chatRouter.ts`, `server/chatDb.ts` |
| Drive import | `server/googleDriveService.ts`, `server/routers/googleDriveRouter.ts` |
| Knowledge Base and xAI sync | `server/knowledgeBaseDb.ts`, `server/routers/knowledgeBaseRouter.ts`, `server/services/xaiSyncService.ts`, `server/services/xaiCollectionsService.ts` |
| Schema and migrations | `drizzle/schema.ts`, `drizzle/migrations/` |
| CI/security/scheduled workflows | `.github/workflows/` |

This document supersedes older descriptions that refer to retired SendGrid paths, historical database dialects, or static browser access tokens.
