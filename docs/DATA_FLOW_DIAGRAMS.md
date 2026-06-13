# Data Flow Diagrams

**Purpose:** Visual reference for how data moves through the system

**Last Updated:** February 10, 2026

---

## Flow 1: Chat Widget → Database → OpenAI → Database

### Sequence Diagram

```
User                Frontend              Backend              Database            OpenAI
 |                    |                      |                    |                  |
 |--Open Chat-------->|                      |                    |                  |
 |                    |--POST /sessions----->|                    |                  |
 |                    |                      |--INSERT session--->|                  |
 |                    |                      |<--session_id-------|                  |
 |                    |<--session_id---------|                    |                  |
 |                    |                      |                    |                  |
 |--Type Message----->|                      |                    |                  |
 |                    |--POST /messages----->|                    |                  |
 |                    |  {session_id, text}  |--INSERT message--->|                  |
 |                    |                      |<--message_id-------|                  |
 |                    |                      |                    |                  |
 |                    |                      |--POST /chat------->|                  |
 |                    |                      |  {messages}        |                  |
 |                    |                      |                    |<--response-------|
 |                    |                      |--INSERT response-->|                  |
 |                    |                      |<--message_id-------|                  |
 |                    |<--response-----------|                    |                  |
 |<--Display---------|                      |                    |                  |
 |                    |                      |--UPDATE count----->|                  |
 |                    |                      |<--OK----------------|                  |
```

### Data Structure Flow

```
chat_sessions table
├── id: 1
├── uuid: "550e8400-e29b-41d4-a716-446655440000"
├── visitor_id: "visitor_abc123"
├── message_count: 2
└── created_at: 2026-02-10 14:30:00

chat_messages table
├── id: 1
├── session_id: 1 (FK → chat_sessions.id)
├── role: "user"
├── content: "I'm being sued by a debt collector"
└── created_at: 2026-02-10 14:31:00

chat_messages table
├── id: 2
├── session_id: 1 (FK → chat_sessions.id)
├── role: "assistant"
├── content: "Under the FDCPA, you have rights including..."
└── created_at: 2026-02-10 14:31:05
```

### Error Handling Flow

```
POST /api/chat/messages
        ↓
Validate input
        ├─→ Invalid? Return 400
        └─→ Valid? Continue
        ↓
Save user message to DB
        ├─→ DB error? Return 500, log error
        └─→ Success? Continue
        ↓
Call OpenAI API
        ├─→ OpenAI error? 
        │   ├─→ Log error
        │   ├─→ Return fallback message
        │   ├─→ Return 500 with retry=true
        │   └─→ Do NOT save AI response
        └─→ Success? Continue
        ↓
Save AI response to DB
        ├─→ DB error? 
        │   ├─→ Log error
        │   ├─→ Return 500 with retry=true
        │   └─→ Response lost (temporary)
        └─→ Success? Continue
        ↓
Update message_count
        ↓
Return response to frontend
```

---

## Flow 2: Form Submission → Database → Email Notification

### Sequence Diagram

```
User                Frontend              Backend              Database           SendGrid
 |                    |                      |                    |                  |
 |--Submit Form------>|                      |                    |                  |
 |                    |--POST /forms/submit-->|                    |                  |
 |                    |  {form_data}         |--INSERT form------>|                  |
 |                    |                      |<--form_id-----------|                  |
 |                    |                      |                    |                  |
 |                    |                      |--Prepare email---->|                  |
 |                    |                      |                    |                  |
 |                    |                      |--POST /send------->|                  |
 |                    |                      |  {email}           |                  |
 |                    |                      |                    |<--Accepted-------|
 |                    |                      |--INSERT log------->|                  |
 |                    |                      |<--log_id-----------|                  |
 |                    |<--success------------|                    |                  |
 |<--Confirmation----|                      |                    |                  |
 |                    |                      |                    |                  |
 |                    |                      |                    |                  |
 |                    |                      |                    |    [Email sent]   |
```

### Data Structure Flow

```
resource_requests table
├── id: 42
├── visitor_id: "visitor_abc123"
├── form_type: "case_intake"
├── data: {
│   "case_type": "eviction",
│   "county": "DeKalb",
│   "status": "pending",
│   "details": "Landlord filed eviction..."
│ }
└── created_at: 2026-02-10 14:32:00

email_log table
├── id: 99
├── form_id: 42 (FK → resource_requests.id)
├── recipient: "owner@turboresponsehq.ai"
├── subject: "New Case Intake - Eviction (DeKalb)"
├── status: "sent"
└── created_at: 2026-02-10 14:32:05
```

### Failure Handling Flow

```
POST /api/forms/submit
        ↓
Validate input
        ├─→ Invalid? Return 400
        └─→ Valid? Continue
        ↓
Save form to DB
        ├─→ DB error? 
        │   ├─→ Log error
        │   ├─→ Return 500
        │   └─→ Form lost
        └─→ Success? Continue
        ↓
Prepare email (async)
        ↓
Send email via SendGrid
        ├─→ SendGrid error?
        │   ├─→ Log error
        │   ├─→ Mark email_log as "failed"
        │   └─→ Do NOT block form save
        └─→ Success? Continue
        ↓
Return success to user
        (Form saved even if email fails)
```

---

## Flow 3: Daily Intel Scanner → Report → Email

### Sequence Diagram

```
GitHub Actions       Scanner              GitHub              SendGrid
 |                    |                      |                  |
 |--6:00 AM Trigger-->|                      |                  |
 |                    |--Fetch FTC---------->|                  |
 |                    |<--RSS items----------|                  |
 |                    |                      |                  |
 |                    |--Fetch CFPB-------->|                  |
 |                    |<--RSS items----------|                  |
 |                    |                      |                  |
 |                    |--Fetch DHS-------->|                  |
 |                    |<--HTML data----------|                  |
 |                    |                      |                  |
 |                    |--Fetch Courts------>|                  |
 |                    |<--HTML data----------|                  |
 |                    |                      |                  |
 |                    |--Parse & Filter     |                  |
 |                    |--Generate Report    |                  |
 |                    |--Commit Report----->|                  |
 |                    |<--Commit SHA--------|                  |
 |                    |                      |                  |
 |                    |--Check Stop Rule    |                  |
 |                    |                      |                  |
 |                    |--IF items found---->|                  |
 |                    |--POST /send-------->|                  |
 |                    |  {email}            |                  |
 |                    |                     |<--Accepted-------|
 |                    |                      |                  |
 |                    |--Create Issues----->|                  |
 |                    |<--Issue URLs--------|                  |
 |                    |                      |                  |
 |<--Complete---------|                      |                  |
```

### Data Structure Flow

```
Sources Scanned (10+)
├── FTC Enforcement Actions (RSS)
├── FTC Consumer Alerts (RSS)
├── CFPB Enforcement (RSS)
├── Federal Register (API)
├── Georgia DHS (HTML)
├── Georgia DCA (HTML)
├── DeKalb County (HTML)
├── Fulton County (HTML)
├── Clayton County (HTML)
├── City of Atlanta (HTML)
└── Georgia Courts (HTML)

↓ Parse & Filter ↓

Actionable Items (P0/P1/P2)
├── Title
├── Source
├── Priority
├── Link
├── Why it matters
└── Action required

↓ Generate Report ↓

Markdown Report
├── Title: "Daily Intel Report - 2026-02-10"
├── Executive Summary
├── P0 Items (Critical)
├── P1 Items (High Priority)
├── P2 Items (Monitoring)
└── Quick Links

↓ Commit to GitHub ↓

File: /docs/intel-reports/intel-2026-02-10.md
Commit SHA: abc123def456

↓ Check Stop Rule ↓

IF no items found
  → Skip email
  → Report shows "No actionable updates today"
ELSE
  → Send email via SendGrid
  → Create GitHub issues for P0 items
```

### Stop Rule Flow

```
Generate Report
        ↓
Count actionable items
        ├─→ 0 items?
        │   ├─→ Add to report: "Status: No actionable updates today"
        │   ├─→ Commit report
        │   ├─→ Skip SendGrid
        │   └─→ Exit successfully
        └─→ 1+ items?
            ├─→ Add to report: "Status: [X] actionable items"
            ├─→ Commit report
            ├─→ Send email via SendGrid
            ├─→ Create GitHub issues
            └─→ Exit successfully
```

---

## Flow 4: Intelligence Outcomes Recording

### Sequence Diagram

```
User (Admin)         Frontend              Backend              Database
 |                    |                      |                    |
 |--Review Intel----->|                      |                    |
 |                    |                      |                    |
 |--Record Outcome--->|                      |                    |
 |  {source, type,    |--POST /outcomes----->|                    |
 |   description,     |  {outcome_data}      |--INSERT outcome--->|
 |   value}           |                      |<--outcome_id-------|
 |                    |<--success------------|                    |
 |<--Confirmed--------|                      |                    |
```

### Data Structure Flow

```
Daily Intel Email
├── Source: "FTC Enforcement"
├── Title: "FTC settles with debt collector for FDCPA violations"
└── Link: https://www.ftc.gov/news-events/news/press-releases/...

↓ Admin reviews ↓

Admin records outcome:
├── source: "FTC Enforcement"
├── source_id: "ftc_enforcement_2026_02_10_001"
├── outcome_type: "policy_change"
├── description: "FTC settlement establishes precedent for FDCPA violations"
├── case_id: null (informational only)
└── value_usd: null

↓ Saved to DB ↓

intelligence_outcomes table
├── id: 1
├── source: "FTC Enforcement"
├── source_id: "ftc_enforcement_2026_02_10_001"
├── outcome_type: "policy_change"
├── description: "FTC settlement establishes precedent..."
├── client_id: null
├── case_id: null
├── value_usd: null
└── created_at: 2026-02-10 15:00:00
```

---

## Flow 5: Visitor Journey Tracking

### Sequence Diagram

```
Visitor              Frontend              Backend              Database
 |                    |                      |                    |
 |--Visit Site------->|                      |                    |
 |                    |--Check visitor_id   |                    |
 |                    |  (from cookie)       |                    |
 |                    |                      |                    |
 |                    |--POST /login------->|                    |
 |                    |  {visitor_id}        |--INSERT/UPDATE--->|
 |                    |                      |  login_audit      |
 |                    |                      |<--visitor_id-------|
 |                    |<--visitor_id---------|                    |
 |                    |                      |                    |
 |--Open Chat------->|                      |                    |
 |                    |--POST /sessions----->|                    |
 |                    |  {visitor_id}        |--INSERT session--->|
 |                    |                      |<--session_id-------|
 |                    |<--session_id---------|                    |
 |                    |                      |                    |
 |--Chat & Browse--->|                      |                    |
 |                    |--POST /messages----->|                    |
 |                    |  {session_id, msg}   |--INSERT message--->|
 |                    |                      |<--OK----------------|
 |                    |                      |                    |
 |--Submit Form------>|                      |                    |
 |                    |--POST /forms-------->|                    |
 |                    |  {visitor_id, data}  |--INSERT form------>|
 |                    |                      |<--form_id-----------|
 |                    |<--success------------|                    |
 |                    |                      |                    |
 |--Leave Site------->|                      |                    |
 |                    |--UPDATE last_visit-->|                    |
 |                    |                      |--UPDATE audit----->|
 |                    |                      |<--OK----------------|
```

### Data Structure Flow

```
login_audit table (Visitor tracking)
├── id: 1
├── visitor_id: "visitor_abc123"
├── ip_address: "192.168.1.100"
├── user_agent: "Mozilla/5.0..."
├── first_visit: 2026-02-10 14:00:00
├── last_visit: 2026-02-10 14:45:00
└── visit_count: 5

chat_sessions table (Linked to visitor)
├── id: 1
├── uuid: "550e8400-e29b-41d4-a716-446655440000"
├── visitor_id: "visitor_abc123" (FK → login_audit.visitor_id)
├── message_count: 2
└── created_at: 2026-02-10 14:30:00

resource_requests table (Linked to visitor)
├── id: 42
├── visitor_id: "visitor_abc123" (FK → login_audit.visitor_id)
├── form_type: "case_intake"
├── data: {...}
└── created_at: 2026-02-10 14:32:00

Attribution: visitor_abc123 → 1 session → 2 messages + 1 form submission
```

---

## Key Data Relationships

### Entity Relationship Diagram (Text)

```
login_audit
├── id (PK)
├── visitor_id (UNIQUE)
├── ip_address
├── user_agent
├── first_visit
├── last_visit
└── visit_count
    ↓ (1:N relationship)
    ├── chat_sessions.visitor_id
    ├── resource_requests.visitor_id
    └── file_uploads.visitor_id

chat_sessions
├── id (PK)
├── uuid (UNIQUE)
├── visitor_id (FK → login_audit.visitor_id)
├── message_count
├── created_at
└── updated_at
    ↓ (1:N relationship)
    └── chat_messages.session_id

chat_messages
├── id (PK)
├── session_id (FK → chat_sessions.id)
├── role (user|assistant)
├── content
├── tokens_used
└── created_at

resource_requests
├── id (PK)
├── visitor_id (FK → login_audit.visitor_id)
├── form_type
├── data (JSON)
└── created_at
    ↓ (1:N relationship)
    └── email_log.form_id

email_log
├── id (PK)
├── form_id (FK → resource_requests.id)
├── recipient
├── subject
├── status (sent|failed)
└── created_at

file_uploads
├── id (PK)
├── visitor_id (FK → login_audit.visitor_id)
├── file_key (S3)
├── file_url (CDN)
├── file_name
├── mime_type
├── file_size
└── created_at

intelligence_outcomes
├── id (PK)
├── source
├── source_id
├── outcome_type
├── description
├── client_id (optional)
├── case_id (optional)
├── value_usd
└── created_at
```

---

## Data Retention Policy

### Short-term (Temporary)

| Data | Retention | Location |
|------|-----------|----------|
| OpenAI responses | Cached 5 min | Memory |
| Form validation errors | Session only | Memory |
| API rate limit counters | 1 hour | Memory |

### Medium-term (Operational)

| Data | Retention | Location |
|------|-----------|----------|
| Chat messages | 90 days | PostgreSQL |
| Email logs | 30 days | PostgreSQL |
| Login audit | 30 days | PostgreSQL |
| File uploads | Until deleted | S3 + PostgreSQL metadata |

### Long-term (Archive)

| Data | Retention | Location |
|------|-----------|----------|
| Intelligence outcomes | Indefinite | PostgreSQL |
| Daily intel reports | Indefinite | GitHub |
| Intelligence capture | Indefinite | PostgreSQL |

---

## Backup & Recovery

### Automated Backups

```
Render PostgreSQL
├── Daily automated backup
├── 30-day retention
├── Point-in-time recovery available
└── Backup location: Render managed

GitHub Repositories
├── Daily commits (intel reports)
├── Indefinite retention
├── Version history available
└── Backup location: GitHub + local clones
```

### Recovery Procedures

**If database lost:**
1. Restore from latest Render backup
2. Verify data integrity
3. Check email logs for missed notifications
4. Resend any missed alerts

**If GitHub lost:**
1. Clone from local backups
2. Push to new GitHub repository
3. Update deployment configuration
4. Verify all reports recovered

---

**This document is the visual reference for all data flows. Update whenever data flow changes.**
