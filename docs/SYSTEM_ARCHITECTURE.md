# System Architecture Overview

**Last Updated:** February 10, 2026  
**Status:** Production  
**Version:** 1.0

---

## Executive Summary

Turbo Response is a consumer defense intelligence platform with three core systems:

1. **Chat Widget** - Real-time AI-powered consumer assistance
2. **Daily Intel Scanner** - Automated regulatory monitoring
3. **Intelligence Database** - Unified data capture and analysis

**Key Principle:** One Brain Rule - All data flows to a single PostgreSQL database (Render). No data fragmentation. No duplicate schemas.

---

## Infrastructure Overview

### Production Environment

**Hosting:** Render (render.com)  
**Region:** US (default)  
**Database:** PostgreSQL (Render managed)  
**Uptime SLA:** 99.9%

### Services

| Service | Type | Location | Purpose |
|---------|------|----------|---------|
| Backend API | Node.js/Express | Render | Chat API, intel scanner, webhooks |
| Frontend | React 19 | Render static | Web UI, chat widget |
| Database | PostgreSQL | Render managed | Single source of truth |
| Email | SendGrid API | Cloud | Daily intel delivery |
| GitHub Actions | Scheduler | GitHub | Daily scanner trigger |
| OpenAI | LLM API | Cloud | Chat response generation |

### One Brain Rule

**Definition:** All intelligence data lives in ONE database (Render PostgreSQL). No exceptions.

**Why:**
- Single source of truth
- No data sync problems
- No duplicate schemas
- Easy to query and analyze
- Clear ownership and access

**What this means:**
- ✅ Chat messages → Render DB
- ✅ Intelligence outcomes → Render DB
- ✅ Login audit → Render DB
- ✅ File uploads metadata → Render DB
- ❌ NO local files (except temp)
- ❌ NO separate analytics DB
- ❌ NO spreadsheets with data
- ❌ NO duplicate tables in other systems

---

## Data Flow Maps

### Flow 1: Chat Widget → Database

```
User opens chat widget
        ↓
[Frontend] POST /api/chat/sessions
        ↓
[Backend] Check/create session
        ↓
[Database] INSERT chat_sessions (uuid, visitor_id, created_at)
        ↓
Return session_id to frontend
        ↓
User types message
        ↓
[Frontend] POST /api/chat/messages {session_id, content}
        ↓
[Backend] INSERT chat_messages (session_id, role, content, created_at)
        ↓
[OpenAI] Generate response (GPT-4)
        ↓
[Backend] INSERT chat_messages (session_id, role: "assistant", content)
        ↓
[Frontend] Display response to user
        ↓
[Database] chat_sessions.message_count += 1
```

**Key Points:**
- Session created on first visit (UUID generated)
- Each message saved BEFORE calling OpenAI
- OpenAI response also saved to DB
- Message count updated automatically
- All data in Render PostgreSQL

### Flow 2: Form Submission → Database → Email

```
User submits form (case details)
        ↓
[Frontend] POST /api/forms/submit {data}
        ↓
[Backend] Validate input
        ↓
[Database] INSERT resource_requests (visitor_id, form_data, created_at)
        ↓
[Backend] Generate email notification
        ↓
[SendGrid] Send email to owner
        ↓
[Database] INSERT email_log (form_id, recipient, status)
        ↓
Return success to frontend
```

**Key Points:**
- Form data saved to DB first
- Email is secondary (async)
- Email failure doesn't block form save
- All records tracked in email_log

### Flow 3: Daily Intel → GitHub Actions → Email

```
6:00 AM ET - GitHub Actions triggered
        ↓
[GitHub Actions] Run daily-intel-scanner.js
        ↓
[Scanner] Fetch from 10+ sources (FTC, CFPB, DHS, courts, etc.)
        ↓
[Scanner] Parse HTML/RSS for actionable items
        ↓
[Scanner] Generate markdown report
        ↓
[GitHub] Commit report to /docs/intel-reports/intel-YYYY-MM-DD.md
        ↓
6:30 AM ET - Check Stop Rule
        ↓
IF "No actionable updates today"
  → Skip email (Stop Rule)
  → Exit successfully
ELSE
  → [SendGrid] Send email to owner
  → [GitHub] Create issue for each P0 item
        ↓
7:00 AM ET - Task creation complete
```

**Key Points:**
- Runs on GitHub Actions (not Render)
- Needs SENDGRID_API_KEY in GitHub secrets
- Stop Rule prevents spam emails
- Reports stored in GitHub (backed up daily)
- No database writes (read-only operation)

---

## Database Schema

### Table: chat_sessions

**Purpose:** Track individual chat conversations

```sql
CREATE TABLE chat_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(64) UNIQUE NOT NULL,
  visitor_id VARCHAR(64) NOT NULL,
  message_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES login_audit(visitor_id)
);
```

**Fields:**
- `id`: Auto-increment primary key
- `uuid`: Session identifier (sent to frontend)
- `visitor_id`: Links to login_audit table
- `message_count`: Total messages in session
- `created_at`: Session start time
- `updated_at`: Last activity time

**Usage:**
- Create on first chat visit
- Update message_count after each message
- Query for session history

### Table: chat_messages

**Purpose:** Store all chat messages (user + AI)

```sql
CREATE TABLE chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content LONGTEXT NOT NULL,
  tokens_used INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);
```

**Fields:**
- `id`: Auto-increment primary key
- `session_id`: Links to chat_sessions
- `role`: 'user' or 'assistant'
- `content`: Message text (user question or AI response)
- `tokens_used`: OpenAI token count (for cost tracking)
- `created_at`: Message timestamp

**Usage:**
- Insert user message
- Call OpenAI
- Insert AI response
- Query for conversation history

### Table: intelligence_outcomes

**Purpose:** Record outcomes from intelligence (case wins, referrals, etc.)

```sql
CREATE TABLE intelligence_outcomes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  source VARCHAR(255) NOT NULL,
  source_id VARCHAR(255),
  outcome_type ENUM('case_win', 'referral', 'client_help', 'policy_change', 'other'),
  description TEXT NOT NULL,
  client_id VARCHAR(64),
  case_id VARCHAR(64),
  value_usd DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Auto-increment primary key
- `source`: Where intelligence came from (e.g., "FTC Enforcement", "DeKalb County")
- `source_id`: Reference to original source item
- `outcome_type`: Type of outcome
- `description`: What happened
- `client_id`: Optional link to client
- `case_id`: Optional link to case
- `value_usd`: Monetary value if applicable
- `created_at`: When outcome was recorded

**Usage:**
- Record when daily intel leads to client win
- Track ROI of monitoring system
- Analyze which sources are most valuable

### Table: login_audit

**Purpose:** Track visitor sessions and authentication

```sql
CREATE TABLE login_audit (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visitor_id VARCHAR(64) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  visit_count INT DEFAULT 1
);
```

**Fields:**
- `id`: Auto-increment primary key
- `visitor_id`: Unique visitor identifier
- `ip_address`: Visitor's IP (for analytics)
- `user_agent`: Browser info
- `first_visit`: First visit timestamp
- `last_visit`: Most recent visit
- `visit_count`: Total visits

**Usage:**
- Track unique visitors
- Link to chat sessions
- Analytics and attribution

### Table: file_uploads

**Purpose:** Track uploaded files and metadata

```sql
CREATE TABLE file_uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visitor_id VARCHAR(64) NOT NULL,
  file_key VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(100),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES login_audit(visitor_id)
);
```

**Fields:**
- `id`: Auto-increment primary key
- `visitor_id`: Who uploaded it
- `file_key`: S3 storage key
- `file_url`: Public CDN URL
- `file_name`: Original filename
- `mime_type`: File type (image/pdf/etc)
- `file_size`: Bytes
- `created_at`: Upload timestamp

**Usage:**
- Track file uploads
- Store S3 references (not file bytes)
- Link files to visitors

---

## API Endpoints

### Chat Endpoints

#### POST /api/chat/sessions

**Purpose:** Create or retrieve chat session

**Request:**
```json
{
  "visitor_id": "visitor_abc123"
}
```

**Response (Success 200):**
```json
{
  "session_id": "sess_xyz789",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-02-10T14:30:00Z",
  "message_count": 0
}
```

**Response (Error 400):**
```json
{
  "error": "visitor_id required",
  "code": "INVALID_INPUT"
}
```

**Response (Error 500):**
```json
{
  "error": "Database connection failed",
  "code": "DB_ERROR",
  "retry": true
}
```

#### POST /api/chat/messages

**Purpose:** Send message and get AI response

**Request:**
```json
{
  "session_id": "sess_xyz789",
  "content": "I'm being sued by a debt collector, what are my rights?"
}
```

**Response (Success 200):**
```json
{
  "message_id": 42,
  "session_id": "sess_xyz789",
  "user_message": "I'm being sued by a debt collector, what are my rights?",
  "assistant_response": "Under the Fair Debt Collection Practices Act (FDCPA)...",
  "tokens_used": 150,
  "created_at": "2026-02-10T14:31:00Z"
}
```

**Response (Error 400):**
```json
{
  "error": "content required",
  "code": "INVALID_INPUT"
}
```

**Response (Error 500 - OpenAI Failure):**
```json
{
  "error": "OpenAI service unavailable",
  "code": "LLM_ERROR",
  "fallback": "I'm temporarily unable to process your request. Please try again in a moment.",
  "retry": true
}
```

**Response (Error 500 - Database Failure):**
```json
{
  "error": "Failed to save message",
  "code": "DB_ERROR",
  "retry": true
}
```

#### GET /api/chat/sessions/:session_id

**Purpose:** Retrieve conversation history

**Response (Success 200):**
```json
{
  "session_id": "sess_xyz789",
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "I'm being sued...",
      "created_at": "2026-02-10T14:31:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Under the FDCPA...",
      "created_at": "2026-02-10T14:31:05Z"
    }
  ],
  "message_count": 2
}
```

### Form Endpoints

#### POST /api/forms/submit

**Purpose:** Submit case/resource request form

**Request:**
```json
{
  "visitor_id": "visitor_abc123",
  "form_type": "case_intake",
  "data": {
    "case_type": "eviction",
    "county": "DeKalb",
    "status": "pending",
    "details": "Landlord filed eviction..."
  }
}
```

**Response (Success 200):**
```json
{
  "form_id": 123,
  "status": "received",
  "email_sent": true,
  "created_at": "2026-02-10T14:32:00Z"
}
```

**Response (Error 400):**
```json
{
  "error": "Invalid form_type",
  "code": "INVALID_INPUT",
  "valid_types": ["case_intake", "resource_request", "feedback"]
}
```

---

## Failure Behavior

### OpenAI Failure

**Scenario:** OpenAI API returns error or timeout

**Behavior:**
1. Log error with timestamp
2. Return fallback message to user: "I'm temporarily unable to process your request. Please try again in a moment."
3. Save user message to DB (success)
4. Do NOT save AI response (it's a fallback)
5. Return HTTP 500 with `"retry": true`

**User sees:** Error message, can retry

**Database state:** User message saved, no AI response

**Logs:** Error logged in Render logs with OpenAI error details

### Database Failure

**Scenario:** PostgreSQL connection fails

**Behavior:**
1. Log error with timestamp
2. Return HTTP 500 with `"code": "DB_ERROR"`
3. Return `"retry": true` to indicate temporary failure
4. Do NOT attempt to save to cache (no local storage)
5. User message is lost (temporary)

**User sees:** Error message, can retry

**Database state:** No changes (connection failed)

**Logs:** Error logged in Render logs with connection details

### SendGrid Failure

**Scenario:** Email delivery fails

**Behavior:**
1. Daily scanner runs successfully
2. Report generated and committed to GitHub
3. SendGrid API call fails
4. Log error: "Email delivery failed - SENDGRID_ERROR"
5. Email stored in `email_log` table with status: "failed"
6. GitHub issue still created (if P0 item)

**User sees:** Nothing (email failure is silent)

**Database state:** email_log record created with failure status

**Logs:** Error logged in GitHub Actions logs

**Recovery:** Manual email can be sent from admin panel

---

## Operations & SOP

### "Prove It's Working" Checklist

#### Daily (Every Morning at 6:35 AM ET)

**1. Check Email Arrived**
```
[ ] Open turboresponsehq@gmail.com
[ ] Check Inbox for "Daily Intel Report" email
[ ] If not in Inbox, check Spam folder
[ ] If email arrived, note timestamp
```

**2. Check GitHub Actions**
```
[ ] Go to: https://github.com/turboresponsehq-sudo/turbo-response/actions
[ ] Look for "Business Intelligence + Operations System" workflow
[ ] Check latest run status (should be green checkmark)
[ ] Click run to see logs
[ ] Verify: "Daily Intel Scan" completed successfully
[ ] Verify: "Daily Intel Delivery" completed (or skipped if no items)
```

**3. Check Database Rows**
```bash
# SSH into Render or use DB client
SELECT COUNT(*) FROM chat_sessions WHERE DATE(created_at) = CURDATE();
SELECT COUNT(*) FROM chat_messages WHERE DATE(created_at) = CURDATE();
SELECT COUNT(*) FROM login_audit WHERE DATE(last_visit) = CURDATE();
```

**Expected:**
- chat_sessions: 1+ (if users visited)
- chat_messages: 2+ (if users chatted)
- login_audit: 1+ (if users visited)

#### Weekly (Every Monday)

**1. Check Render Logs**
```
[ ] Go to Render Dashboard: https://dashboard.render.com
[ ] Select "turbo-response-backend" service
[ ] Click "Logs" tab
[ ] Look for errors in past 7 days
[ ] Note any patterns (OpenAI errors, DB timeouts, etc.)
```

**2. Check GitHub Actions History**
```
[ ] Go to: https://github.com/turboresponsehq-sudo/turbo-response/actions
[ ] Review past 7 days of workflow runs
[ ] Count: How many successful? How many failed?
[ ] Expected: 7 successful (one per day)
```

**3. Check Email Delivery**
```
[ ] Go to SendGrid Dashboard: https://app.sendgrid.com
[ ] Check "Delivery" tab
[ ] Look for bounces or suppression issues
[ ] Expected: All emails delivered or in Spam
```

#### Monthly (First Day of Month)

**1. Database Backup Verification**
```
[ ] Confirm Render has automated backups enabled
[ ] Go to Render Dashboard → Database → Backups
[ ] Verify: Daily backups exist for past 30 days
```

**2. Cost Review**
```
[ ] Render: Check monthly bill
[ ] OpenAI: Check API usage and costs
[ ] SendGrid: Check email volume
[ ] Expected: Render ~$7/month, OpenAI ~$30-100/month, SendGrid $0
```

**3. Performance Review**
```
[ ] Check average response time for /api/chat/messages
[ ] Expected: <2 seconds (including OpenAI call)
[ ] Check error rate
[ ] Expected: <1% errors
```

### Troubleshooting Guide

#### Problem: Email not arriving

**Check 1: GitHub Actions ran**
```
Go to: https://github.com/turboresponsehq-sudo/turbo-response/actions
Look for green checkmark on latest run
If red X: Check logs for error
```

**Check 2: Stop Rule triggered**
```
Go to: /docs/intel-reports/intel-YYYY-MM-DD.md
Look for: "Status: No actionable updates today"
If found: This is normal, no email sent
```

**Check 3: SendGrid API key configured**
```
Go to: https://github.com/turboresponsehq-sudo/turbo-response/settings/secrets/actions
Look for: SENDGRID_API_KEY secret
If missing: Add it
```

**Check 4: Email in Spam**
```
Open: turboresponsehq@gmail.com
Check Spam folder
If found: Mark as "Not Spam"
```

#### Problem: Chat not working

**Check 1: Render backend running**
```
Go to: https://dashboard.render.com
Select: turbo-response-backend
Check: Status should be "Live"
If not: Click "Restart" button
```

**Check 2: Database connection**
```
SSH into Render shell
Run: psql $DATABASE_URL -c "SELECT 1"
Expected: Should return "1"
If error: Database is down, contact Render support
```

**Check 3: OpenAI API key**
```
Check: Render environment variables
Look for: OPENAI_API_KEY
If missing: Add it
If present: Test with: curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

**Check 4: Frontend loading**
```
Open: https://turboresponsehq.ai
Check browser console (F12)
Look for errors
If 404: Frontend not deployed
If CORS error: Backend not allowing requests
```

#### Problem: Database growing too large

**Check 1: Chat messages size**
```sql
SELECT 
  COUNT(*) as message_count,
  SUM(LENGTH(content)) as total_bytes
FROM chat_messages;
```

**Check 2: Identify large messages**
```sql
SELECT 
  session_id,
  LENGTH(content) as bytes,
  created_at
FROM chat_messages
ORDER BY LENGTH(content) DESC
LIMIT 10;
```

**Check 3: Archive old data**
```sql
-- Archive messages older than 90 days
INSERT INTO chat_messages_archive
SELECT * FROM chat_messages
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

DELETE FROM chat_messages
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Where to Look When Things Break

| Problem | Where to Look | What to Check |
|---------|---------------|---------------|
| Chat not responding | Render logs | Backend errors, OpenAI failures |
| Email not arriving | GitHub Actions logs | SendGrid API errors, Stop Rule |
| Database slow | Render dashboard | CPU/memory usage, query logs |
| Frontend 404 | Render deployment | Static files deployed correctly |
| Session lost | chat_sessions table | UUID generation, cookie settings |
| Messages not saved | chat_messages table | Foreign key constraints |
| OpenAI errors | Render logs + OpenAI dashboard | Rate limits, API key, model availability |
| SendGrid errors | SendGrid dashboard + GitHub logs | Sender verification, suppression list |

### Test Commands

**Test chat endpoint:**
```bash
curl -X POST https://turboresponsehq.ai/api/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{"visitor_id":"test_123"}'
```

**Test database connection:**
```bash
# From Render shell
psql $DATABASE_URL -c "SELECT COUNT(*) FROM chat_sessions;"
```

**Test OpenAI:**
```bash
# From Render shell
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

**Test SendGrid:**
```bash
# From Render shell
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@turboresponsehq.ai"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
```

---

## Deployment Checklist

**Before pushing to production:**

- [ ] All environment variables set in Render
- [ ] Database migrations run (`pnpm db:push`)
- [ ] GitHub secrets configured (SENDGRID_API_KEY)
- [ ] Render backup enabled
- [ ] SSL certificate valid
- [ ] CORS settings correct
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Monitoring alerts set up

---

## Documentation References

**Related docs:**
- `INTELLIGENCE_CAPTURE_SYSTEM.md` - Intelligence tables and capture flow
- `OPENAI_SOP_TRIGGER_RULES.md` - When/how to use OpenAI
- `TIER1_MONITORING_IMPLEMENTATION.md` - Daily intel sources
- `CORE_MONITORING_MAP.md` - Monitoring source details

---

## Key Principles

1. **One Brain Rule:** All data in Render PostgreSQL. No exceptions.
2. **Fail-Safe Design:** Failures are logged, not silent.
3. **Async Operations:** Email/notifications don't block main operations.
4. **Audit Trail:** All actions logged (login_audit, email_log, etc.)
5. **No Local Storage:** All data in database or S3, never local files.
6. **Immutable Records:** Data never deleted, only archived.

---

**This is the source of truth for system architecture. Update this document whenever architecture changes.**
