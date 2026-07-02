# Turbo Response

**AI-Powered Consumer Defense & Operational Intelligence Platform**

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white)](https://trpc.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-TiDB-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render&logoColor=white)](https://render.com)

---

## Overview

Turbo Response is a full-stack, production-deployed web application that serves two distinct user populations through a unified platform.

On the **consumer side**, it provides structured AI-assisted intake workflows for individuals navigating difficult situations — IRS notices, debt collection, evictions, wage garnishments, credit disputes, and other enforcement actions. Users are routed through a guided intake process, their submissions are saved to a database, and the owner is notified in real time. Every submission is simultaneously synced to HubSpot CRM for pipeline tracking.

On the **business side**, it offers a Business Intelligence Audit system that scrapes a submitted website using Cheerio, analyzes the content with an LLM, and delivers a structured executive-level report by email — covering operational gaps, automation opportunities, and revenue recommendations.

The platform also includes a conversational AI chatbot for case intake, an admin dashboard for case management, a Brain System for knowledge document uploads, a screenshot capture and OCR pipeline, and a GitHub Actions automation workflow for daily intelligence operations.

---

## Key Features

### Consumer Defense Intake

Two separate intake flows — **Defense** (someone is taking action against you) and **Offense** (you are taking action against someone else) — each with multi-step forms, document upload support, terms acceptance with IP capture, and automatic case number generation (`TR-DEF-XXXXX` / `TR-OFF-XXXXX`). On successful submission, leads are written to the database, synced to HubSpot, and the owner receives a push notification.

| Flow | Route | Server Endpoint |
|---|---|---|
| Defense Intake | `/intake` | `POST /api/intake` |
| Offense Intake | `/intake-offense` | `POST /api/intake-offense` |
| Legacy Offense | `/turbo-intake` | `POST /api/turbo-intake` |

### Business Intelligence Audit

A founder submits their name, email, business name, website URL, industry, and biggest challenge. The server immediately saves the lead, then processes the audit asynchronously in the background. The pipeline scrapes the submitted website with Cheerio, extracts headings, CTAs, meta description, and body text, passes structured context to an LLM, generates a structured `BusinessAuditReport` with executive summary, operational gaps, automation opportunities, revenue opportunities, and recommended next steps, and sends the report by email via Nodemailer.

### Conversational AI Chatbot

A multi-turn chatbot powered by `invokeLLM` handles case intake through natural conversation. The AI performs category detection (debt collection, eviction, credit errors, unemployment, bank issues, wage garnishment, discrimination), generates follow-up questions, produces a case summary, and provides conversational guidance — all with compliance-safe language that avoids legal advice. Conversations, messages, evidence uploads, and leads are persisted to the database.

### Brain System (Knowledge Upload)

An access-token-protected document upload system backed by Supabase. Administrators upload documents to the Brain System via `POST /api/brain/upload`, which stores files in Supabase storage for use as a knowledge base. The system supports up to 50 MB file uploads and includes list and delete endpoints.

### Screenshot Capture and LLM-Powered OCR

Administrators upload screenshots through the `AdminBrainUpload` interface. The server converts the base64 image to a buffer, stores it in S3, and passes it to an LLM vision prompt that extracts all text, dates, names, organizations, emails, phone numbers, and categorizes the content (grant / partnership / lead / alert / event / other). Results are saved to the `screenshots` table.

### Admin Dashboard and Command Center

A role-gated admin interface provides case management across both consumer defense cases and business audit leads. The Command Center (`/command-center`) serves as a navigation hub linking to the admin dashboard, client portal, intake forms, Brain System, Render backend, GitHub repository, and Google Drive. A CEO Home panel within the dashboard supports priority tracking, project management, and task management — all stored in the database.

### HubSpot CRM Integration

Every intake submission (Defense, Offense, and Business Audit) triggers a contact upsert in HubSpot via the Contacts API. The sync searches for an existing contact by email before creating a new one to prevent duplicates. Fields synced include name, email, phone, website, description, lead status, and lifecycle stage. HubSpot sync failures are non-blocking — a CRM outage does not prevent form submissions from succeeding.

### GitHub Actions Automation

A scheduled workflow (`.github/workflows/bi-ops-automation.yml`) runs daily at 6:00 AM ET and weekly on Sundays. Jobs include daily intelligence scan, daily delivery, daily tasks, weekly review, and weekly heartbeat. The workflow can also be triggered manually with a specific job selector.

### Client Portal and Document Signing

Clients access their case status through a dedicated portal (`/client/case/:id`) after authenticating via `/client/login`. The platform includes contract signing (`/sign-contract/:caseId`) and payment processing (`/pay/:caseId`) flows.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI primitives + shadcn/ui |
| **Routing** | Wouter 3 |
| **Data Fetching** | tRPC 11 + TanStack Query 5 |
| **Animations** | Framer Motion 12 |
| **Charts** | Recharts 2 |
| **Backend Framework** | Express 4 |
| **API Layer** | tRPC 11 (type-safe end-to-end) |
| **Database ORM** | Drizzle ORM 0.44 |
| **Database** | MySQL / TiDB (via `mysql2`) |
| **File Storage** | AWS S3 (via `@aws-sdk/client-s3`) |
| **Knowledge Base** | Supabase (Brain System document storage) |
| **AI / LLM** | OpenAI API (via `openai` SDK + internal `invokeLLM` helper) |
| **Web Scraping** | Cheerio |
| **Email Delivery** | Nodemailer |
| **CRM** | HubSpot Contacts API (via `axios`) |
| **Authentication** | Manus OAuth + JWT session cookies |
| **Build Tool** | Vite 7 |
| **Testing** | Vitest 2 |
| **Deployment** | Render (Node.js web service, auto-deploy on `main`) |
| **CI/CD** | GitHub Actions |
| **Serialization** | Superjson |
| **Validation** | Zod 4 |
| **Form Handling** | React Hook Form 7 |

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                        CLIENT (React 19)                         |
|  Wouter routing  |  tRPC hooks  |  Radix UI  |  Tailwind CSS 4  |
|  Pages: Home, Consumer Solutions, Intake Forms, Admin,           |
|         Services, Industries, Turbo Systems, Black Future,       |
|         Client Portal, Command Center, Brain Upload              |
+-----------------------------+------------------------------------+
                              |  HTTPS / tRPC + REST
+-----------------------------v------------------------------------+
|                    SERVER (Express 4 + tRPC 11)                  |
|                                                                  |
|  tRPC Routers:                                                   |
|    auth  |  system  |  admin  |  dashboard  |  chat  |          |
|    screenshots                                                   |
|                                                                  |
|  REST Routes:                                                    |
|    POST /api/intake            (Defense intake)                  |
|    POST /api/intake-offense    (Offense intake)                  |
|    POST /api/turbo-intake      (Legacy offense alias)            |
|    POST /api/business-audit    (BI Audit pipeline)               |
|    POST /api/brain/upload      (Brain System, token-gated)       |
|    GET  /api/brain/list                                          |
|    DELETE /api/brain/delete/:id                                  |
|                                                                  |
|  Services:                                                       |
|    businessAuditService  |  websiteScraper  |  auditEmailService |
|    chatAI  |  hubspotSync  |  storage (S3)                       |
+------+---------------+---------------+---------------+-----------+
       |               |               |               |
  MySQL/TiDB        AWS S3         Supabase        HubSpot
  (Drizzle ORM)   (File storage)  (Brain docs)   (CRM API)
       |
  OpenAI API
  (LLM layer)
```

---

## Database Schema

The application uses a MySQL/TiDB database managed through Drizzle ORM. Migrations are applied with `pnpm db:push`.

| Table | Purpose |
|---|---|
| `users` | OAuth-authenticated users with role (`admin` or `user`) |
| `intake_leads` | All form submissions from Defense, Offense, and Business Audit flows |
| `dashboard_leads` | Lightweight display layer linking to HubSpot records |
| `priorities` | CEO Home daily priority list |
| `projects` | Long-term initiatives with status, progress, and Google Drive links |
| `tasks` | Task tracking entries |
| `screenshots` | Screenshot metadata, S3 URLs, and LLM-extracted OCR content |
| `resource_requests` | Resource request tracking |
| `conversations` | AI chatbot conversation sessions |
| `messages` | Individual messages within chatbot conversations |
| `evidence_uploads` | Files uploaded during chatbot intake sessions |
| `leads` | Leads generated through the chatbot flow |

---

## Request Flow: Consumer Intake Submission

The following describes the complete path of a Defense intake submission from the user's browser to the database and CRM.

```
User fills IntakeForm (/intake)
        |
        v
handleSubmit() fires
  -> Captures client IP via api.ipify.org
  -> Collects uploaded document URLs from S3
  -> POST /api/intake  { full_name, email, phone, category,
                         case_details, deadline, amount, documents,
                         terms_accepted_at, terms_accepted_ip }
        |
        v
Express route handler (server/routes/intake.ts)
  -> Normalizes field names (accepts camelCase and snake_case)
  -> Validates required fields (fullName, email)
  -> saveIntakeLead() -> INSERT into intake_leads table
  -> Returns insertId -> generates case number TR-DEF-XXXXX
        |
        +---> syncContactToHubSpot() [non-blocking]
        |       -> Search HubSpot for existing contact by email
        |       -> Create or update contact with lead metadata
        |
        +---> notifyOwner() [non-blocking]
        |       -> Push notification to platform owner
        |
        v
Response: { success: true, case_number: "TR-DEF-00001", case_id: "1" }
        |
        v
Frontend reads case_number and case_id
  -> Displays success message with case number
  -> Redirects to /consumer/confirmation?caseId=1&category=...
```

---

## Repository Structure

```
turbo-response/
├── client/                     # React 19 frontend
│   ├── src/
│   │   ├── pages/              # 40+ page components
│   │   ├── components/         # Reusable UI (shadcn/ui + custom)
│   │   ├── contexts/           # Auth context, theme context
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/
│   │   │   ├── trpc.ts         # tRPC client binding
│   │   │   └── api.ts          # REST fetch helpers
│   │   ├── App.tsx             # Route definitions (40+ routes)
│   │   └── index.css           # Global Tailwind theme tokens
│   └── index.html
├── server/
│   ├── _core/                  # Framework infrastructure
│   │   ├── index.ts            # Express app setup and route mounting
│   │   ├── brainRouter.ts      # Brain System upload/list/delete
│   │   ├── llm.ts              # invokeLLM() helper (OpenAI)
│   │   ├── notification.ts     # notifyOwner() helper
│   │   ├── oauth.ts            # Manus OAuth callback handler
│   │   └── trpc.ts             # tRPC server setup
│   ├── routers/                # tRPC feature routers
│   │   ├── adminRouter.ts      # Admin case management procedures
│   │   ├── chatRouter.ts       # Conversational AI chatbot procedures
│   │   ├── dashboardRouter.ts  # CEO dashboard (priorities, projects, tasks)
│   │   ├── messagingRouter.ts  # Client-admin messaging (disabled)
│   │   └── screenshots.ts      # Screenshot capture and OCR
│   ├── routes/                 # Express REST routes
│   │   ├── intake.ts           # Defense and Offense intake endpoints
│   │   └── businessAudit.ts    # Business Intelligence Audit pipeline
│   ├── services/               # Business logic services
│   │   ├── businessAuditService.ts   # LLM-powered audit report generation
│   │   ├── websiteScraper.ts         # Cheerio-based website scraping
│   │   ├── auditReportHtml.ts        # HTML report template generation
│   │   └── auditEmailService.ts      # Nodemailer email delivery
│   ├── chatAI.ts               # AI helpers: category detection, summaries
│   ├── chatDb.ts               # Chat database query helpers
│   ├── db.ts                   # Drizzle instance and query helpers
│   ├── hubspotSync.ts          # HubSpot Contacts API sync
│   ├── intakeLeadsDb.ts        # Intake lead database helpers
│   ├── routers.ts              # Root tRPC router
│   └── storage.ts              # S3 storagePut / storageGet helpers
├── drizzle/
│   ├── schema.ts               # All table definitions and types
│   └── migrations/             # Generated migration files
├── shared/                     # Constants shared between client and server
├── .github/
│   └── workflows/
│       └── bi-ops-automation.yml   # Daily/weekly intelligence automation
└── render.yaml                 # Render deployment configuration
```

---

## Deployment

The application is deployed as a single Node.js web service on **Render** (Oregon region). The frontend is built by Vite and served as static assets from the same Express process that handles the API.

| Setting | Value |
|---|---|
| Platform | Render (Node.js web service) |
| Region | Oregon |
| Build command | `pnpm install && pnpm run build` |
| Start command | `node dist/server.js` |
| Auto-deploy | Enabled — triggers on every push to `main` |
| Health check | `GET /__version` |

**Environment variables required for production:**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing key |
| `OPENAI_API_KEY` | LLM and vision API access |
| `HUBSPOT_PRIVATE_APP_TOKEN` | HubSpot CRM sync |
| `SUPABASE_URL` | Brain System document storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Brain System service authentication |
| `ADMIN_EMAIL` | Admin login credential |
| `ADMIN_PASSWORD_HASH` | Bcrypt-hashed admin password |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Nodemailer email delivery |

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/turboresponsehq-sudo/turbo-response.git
cd turbo-response

# Install dependencies
pnpm install

# Copy environment template and fill in values
cp .env.example .env

# Push the database schema
pnpm db:push

# Start the development server (frontend + backend on port 3000)
pnpm dev
```

The development server runs both the Vite frontend and the Express backend on `http://localhost:3000`. tRPC procedures are available at `/api/trpc` and REST routes at `/api/*`.

```bash
# Run tests
pnpm test
```

---

## Future Roadmap

The following improvements are realistic next steps based on the current architecture.

**Messaging system.** The `messagingRouter` and client-admin messaging UI exist in the codebase but are currently disabled because the `caseMessages` table has not been added to the schema. Re-enabling this requires a schema migration and `pnpm db:push`.

**Live HubSpot dashboard pull.** The `dashboardLeads` table is currently a manual display layer. The `dashboardRouter.ts` comments note that the intended upgrade is a live HubSpot API pull to replace the static table.

**PDF document processing.** `pdf-lib`, `pdf-parse`, and `pdfkit` are installed as dependencies. The current codebase does not use them in production routes — a document parsing pipeline for uploaded case files is the natural next step.

**OCR via Tesseract.js.** `tesseract.js` is installed. The current screenshot OCR uses an LLM vision prompt. A local Tesseract fallback for non-image documents would reduce API costs for high-volume processing.

**Expanded AI case analysis.** The chatbot currently performs category detection and generates follow-up questions. A deeper analysis pipeline — pulling relevant regulations, generating response templates, and producing structured case briefs — would extend the consumer defense value significantly.

---

## License

This repository is proprietary. All rights reserved. No part of this codebase may be reproduced, distributed, or used without explicit written permission from the repository owner.
