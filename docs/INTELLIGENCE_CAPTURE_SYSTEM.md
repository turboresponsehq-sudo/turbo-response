# Intelligence Capture System - Knowledge Base

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Status:** Production - Live  
**Author:** Manus AI

---

## Executive Summary

The Intelligence Capture System is a comprehensive data collection and learning infrastructure deployed on Turbo Response HQ (turboresponsehq.ai). The system captures every user interaction, tracks conversion sources, and stores outcomes to enable continuous platform improvement. This document serves as the definitive reference for understanding, maintaining, and extending the intelligence infrastructure.

**Core Principle:** One Brain, One Database, One Learning Loop.

---

## System Architecture

### Database: Single Source of Truth

All intelligence data is stored in the **Render PostgreSQL database** (production). This database serves as the unified brain for:

- Live website (turboresponsehq.ai)
- Admin tools and dashboards
- AI agents and automation systems
- Analytics and reporting

**Critical Rule:** Never duplicate intelligence tables across multiple databases. All systems must read from and write to the same PostgreSQL instance to maintain data integrity and enable cross-system learning.

---

## The 5 Intelligence Tables

### 1. chat_sessions

**Purpose:** Tracks every chat conversation initiated on the website.

**Schema:**
```sql
CREATE TABLE chat_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  visitor_id VARCHAR(255),
  page_url TEXT,
  referrer_url TEXT,
  device_type VARCHAR(50),
  user_agent TEXT,
  ip_address VARCHAR(45),
  status VARCHAR(50) DEFAULT 'active',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Fields:**
- `session_id`: Server-generated unique identifier (format: `sess_<timestamp>_<random>`)
- `visitor_id`: Persistent visitor tracking across sessions
- `referrer_url`: Where the visitor came from (organic, paid, direct)
- `device_type`: mobile | desktop | tablet
- `message_count`: Number of messages in this conversation

**Usage:**
- Created when user opens chat widget for the first time
- Updated with message count as conversation progresses
- Used for conversation analytics and user journey mapping

---

### 2. chat_messages

**Purpose:** Stores every message exchanged between users and the AI assistant.

**Schema:**
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES chat_sessions(session_id),
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Fields:**
- `session_id`: Links message to conversation (foreign key)
- `role`: user | assistant | system
- `content`: Full message text
- `tokens_used`: OpenAI API token consumption (for cost tracking)
- `model`: AI model used (e.g., gpt-4, gpt-3.5-turbo)

**Usage:**
- User messages saved immediately when sent
- AI responses saved after generation
- Enables conversation history, AI training, and quality analysis

---

### 3. intelligence_outcomes

**Purpose:** Records the final outcome of each case or interaction for learning and improvement.

**Schema:**
```sql
CREATE TABLE intelligence_outcomes (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id),
  outcome_type VARCHAR(100),
  outcome_status VARCHAR(50),
  outcome_details TEXT,
  revenue_generated DECIMAL(10, 2),
  client_satisfaction INTEGER,
  resolution_time_days INTEGER,
  lessons_learned TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Fields:**
- `case_id`: Links outcome to specific case
- `outcome_type`: won | lost | settled | referred | abandoned
- `revenue_generated`: Actual revenue from this case
- `client_satisfaction`: 1-5 rating
- `lessons_learned`: Freeform notes on what worked/didn't work

**Usage:**
- Manually recorded by admin after case resolution
- Used for ROI analysis and pattern recognition
- Feeds into AI training for better case assessment

**How to Record Outcomes:**
1. Navigate to Admin Dashboard → Cases
2. Select completed case
3. Click "Record Outcome" button
4. Fill in outcome details and save

---

### 4. login_audit

**Purpose:** Tracks all authentication events for security and user behavior analysis.

**Schema:**
```sql
CREATE TABLE login_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email VARCHAR(320),
  login_method VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50),
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Fields:**
- `user_id`: Authenticated user (null if login failed)
- `login_method`: password | oauth | magic_link
- `status`: success | failed | blocked
- `failure_reason`: Invalid password, account locked, etc.

**Usage:**
- Automatic capture on every login attempt
- Security monitoring and fraud detection
- User behavior analytics

---

### 5. file_uploads

**Purpose:** Tracks all files uploaded by users (evidence, documents, screenshots).

**Schema:**
```sql
CREATE TABLE file_uploads (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id),
  user_id INTEGER REFERENCES users(id),
  filename VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER,
  storage_url TEXT,
  upload_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Fields:**
- `case_id`: Associated case
- `storage_url`: S3 URL for file retrieval
- `file_size`: Bytes (for storage monitoring)
- `file_type`: MIME type (image/jpeg, application/pdf, etc.)

**Usage:**
- Automatic capture when user uploads files
- Storage cost tracking
- Evidence management for cases

---

## Source Tracking Fields

The following tables have been enhanced with source tracking fields to enable conversion attribution:

### cases table (enhanced)
```sql
ALTER TABLE cases ADD COLUMN referrer_url TEXT;
ALTER TABLE cases ADD COLUMN utm_source VARCHAR(100);
ALTER TABLE cases ADD COLUMN utm_medium VARCHAR(100);
ALTER TABLE cases ADD COLUMN utm_campaign VARCHAR(100);
ALTER TABLE cases ADD COLUMN landing_page TEXT;
ALTER TABLE cases ADD COLUMN device_type VARCHAR(50);
ALTER TABLE cases ADD COLUMN session_id VARCHAR(255);
ALTER TABLE cases ADD COLUMN visitor_id VARCHAR(255);
```

### resource_requests table (enhanced)
```sql
ALTER TABLE resource_requests ADD COLUMN referrer_url TEXT;
ALTER TABLE resource_requests ADD COLUMN utm_source VARCHAR(100);
ALTER TABLE resource_requests ADD COLUMN utm_medium VARCHAR(100);
ALTER TABLE resource_requests ADD COLUMN utm_campaign VARCHAR(100);
ALTER TABLE resource_requests ADD COLUMN landing_page TEXT;
ALTER TABLE resource_requests ADD COLUMN device_type VARCHAR(50);
ALTER TABLE resource_requests ADD COLUMN session_id VARCHAR(255);
ALTER TABLE resource_requests ADD COLUMN visitor_id VARCHAR(255);
```

**Purpose:** Track where conversions (case submissions, resource requests) originated from to measure marketing ROI.

---

## Chat Flow Architecture

### End-to-End Flow

```
1. User opens chat widget
   ↓
2. Frontend calls POST /api/chat/sessions
   ↓
3. Backend generates session_id (sess_<timestamp>_<random>)
   ↓
4. Session saved to chat_sessions table
   ↓
5. session_id returned to frontend and stored in localStorage
   ↓
6. User sends message
   ↓
7. Frontend calls POST /api/chat/messages (role: user)
   ↓
8. User message saved to chat_messages table
   ↓
9. Frontend calls POST /api/chat/ai-response
   ↓
10. Backend calls OpenAI GPT-4 API
   ↓
11. AI response generated
   ↓
12. Frontend calls POST /api/chat/messages (role: assistant)
   ↓
13. AI message saved to chat_messages table
   ↓
14. message_count incremented in chat_sessions
```

### API Endpoints

**POST /api/chat/sessions**
- Creates new chat session
- Returns server-generated session_id
- Captures visitor tracking data

**POST /api/chat/messages**
- Saves user or AI messages
- Validates session_id exists
- Updates message count

**POST /api/chat/ai-response**
- Generates AI response using OpenAI
- Returns response text and token usage
- Does NOT save to database (frontend handles that)

### Session Management

**Session ID Format:** `sess_<timestamp>_<random>`
- Example: `sess_1770757449827_c49kwc1p5`
- Generated server-side (never client-side)
- Stored in browser localStorage as `turbo_session_id`

**Session Lifecycle:**
1. Created on first chat message
2. Reused for subsequent messages in same browser session
3. Persists across page refreshes (localStorage)
4. Cleared when user clears browser data

**Critical Rule:** Frontend must NEVER generate `local_*` session IDs. All session IDs must be server-issued.

---

## Viewing Intelligence Data

### Option 1: Admin Dashboard (Recommended)

Navigate to:
- **Admin Dashboard → Chat Sessions** - View all conversations
- **Admin Dashboard → Cases** - View case outcomes
- **Admin Dashboard → Analytics** - View aggregated intelligence

### Option 2: Direct Database Queries

**View recent chat sessions:**
```sql
SELECT 
  session_id, 
  visitor_id, 
  message_count, 
  created_at, 
  referrer_url
FROM chat_sessions 
ORDER BY created_at DESC 
LIMIT 20;
```

**View messages in a session:**
```sql
SELECT 
  role, 
  content, 
  tokens_used, 
  created_at
FROM chat_messages 
WHERE session_id = 'sess_1770757449827_c49kwc1p5'
ORDER BY created_at ASC;
```

**View case outcomes:**
```sql
SELECT 
  outcome_type, 
  outcome_status, 
  revenue_generated, 
  client_satisfaction, 
  resolution_time_days
FROM intelligence_outcomes 
WHERE created_at > NOW() - INTERVAL '30 days';
```

**Count total intelligence captured:**
```sql
SELECT 
  (SELECT COUNT(*) FROM chat_sessions) as total_sessions,
  (SELECT COUNT(*) FROM chat_messages) as total_messages,
  (SELECT COUNT(*) FROM intelligence_outcomes) as total_outcomes,
  (SELECT COUNT(*) FROM login_audit) as total_logins,
  (SELECT COUNT(*) FROM file_uploads) as total_uploads;
```

### Option 3: Render Database Dashboard

1. Go to Render Dashboard → turbo-reponse-db
2. Click "Connect" → "External Connection"
3. Use provided credentials with any PostgreSQL client (e.g., TablePlus, DBeaver)

---

## One Brain Rule

**Definition:** All intelligence data must flow into a single, unified database to enable cross-system learning and prevent data fragmentation.

**Why This Matters:**
- **Unified Learning:** AI agents learn from all interactions, not just their own
- **Cross-System Insights:** Chat data informs case outcomes, case outcomes inform chat responses
- **No Data Loss:** Every interaction is captured once and available everywhere
- **Simplified Maintenance:** One schema, one backup, one source of truth

**What This Means in Practice:**
- Manus tools (internal admin) read from Render PostgreSQL
- Live website (turboresponsehq.ai) writes to Render PostgreSQL
- AI agents query Render PostgreSQL
- Analytics dashboards pull from Render PostgreSQL

**What NOT to Do:**
- ❌ Create duplicate intelligence tables in Manus database
- ❌ Store chat data in local files or separate systems
- ❌ Build parallel intelligence systems that don't share data

---

## Recording Outcomes

### Why Outcomes Matter

Outcomes are the feedback loop that makes the system "get smarter." Without outcome data, the system cannot learn which strategies work and which don't.

### When to Record Outcomes

Record an outcome when:
- Case is resolved (won, lost, settled)
- Client provides satisfaction feedback
- Revenue is finalized
- Case is abandoned or referred

### How to Record Outcomes

**Method 1: Admin Dashboard (Recommended)**
1. Navigate to Admin Dashboard → Cases
2. Find the completed case
3. Click "Record Outcome" button
4. Fill in:
   - Outcome type (won/lost/settled/referred/abandoned)
   - Outcome status (success/failure/partial)
   - Revenue generated (if applicable)
   - Client satisfaction (1-5 rating)
   - Resolution time (days from submission to resolution)
   - Lessons learned (freeform notes)
5. Click "Save Outcome"

**Method 2: Direct Database Insert**
```sql
INSERT INTO intelligence_outcomes (
  case_id, 
  outcome_type, 
  outcome_status, 
  revenue_generated, 
  client_satisfaction, 
  resolution_time_days, 
  lessons_learned
) VALUES (
  123, 
  'won', 
  'success', 
  299.00, 
  5, 
  14, 
  'Client had strong evidence. IRS accepted appeal within 2 weeks.'
);
```

### Outcome Analysis

**View success rate by case type:**
```sql
SELECT 
  c.case_type,
  COUNT(*) as total_cases,
  SUM(CASE WHEN io.outcome_type = 'won' THEN 1 ELSE 0 END) as won_cases,
  ROUND(100.0 * SUM(CASE WHEN io.outcome_type = 'won' THEN 1 ELSE 0 END) / COUNT(*), 2) as win_rate
FROM intelligence_outcomes io
JOIN cases c ON io.case_id = c.id
GROUP BY c.case_type
ORDER BY win_rate DESC;
```

---

## System Verification

### Health Check Commands

**Check table existence:**
```bash
# In Render Shell
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'chat_%' OR tablename IN ('intelligence_outcomes', 'login_audit', 'file_uploads') ORDER BY tablename;"
```

**Check data capture:**
```bash
# In Render Shell
echo "const{Pool}=require('pg');new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}).query('SELECT COUNT(*) FROM chat_sessions').then(r=>{console.log('Chat sessions:',r.rows[0].count);return new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}).query('SELECT COUNT(*) FROM chat_messages')}).then(r=>{console.log('Chat messages:',r.rows[0].count);process.exit()}).catch(e=>{console.error(e);process.exit(1)})" > check_counts.js && node check_counts.js
```

**Expected Output:**
```
Chat sessions: 1 (or higher)
Chat messages: 2 (or higher)
```

### Monitoring Logs

**Session creation:**
```
[CHAT] Session created: sess_1770757449827_c49kwc1p5
```

**Message saving:**
```
[CHAT] Message saved: 11 session= sess_1770757449827_c49kwc1p5 role= user
[CHAT] Message saved: 12 session= sess_1770757449827_c49kwc1p5 role= assistant
```

**AI response generation:**
```
POST /api/chat/ai-response responseTimeMS=1511
```

---

## Troubleshooting

### Issue: Chat sessions showing 0 count

**Diagnosis:**
1. Check Render logs for `[CHAT] Session created:` messages
2. If missing, frontend is not calling `/api/chat/sessions`
3. If present but DB shows 0, database connection issue

**Fix:**
- Clear browser localStorage (`turbo_session_id`)
- Test in Incognito mode
- Check Render logs for SQL errors

### Issue: Foreign key violations

**Error Message:**
```
Key (session_id)=(local_1770756004784_2xiwoqoy7) is not present in table "chat_sessions"
```

**Cause:** Frontend is using client-generated `local_*` session IDs instead of server-issued IDs.

**Fix:**
- Ensure frontend calls `POST /api/chat/sessions` before sending messages
- Clear localStorage to remove cached `local_*` IDs
- Verify session creation endpoint is working (check logs)

### Issue: OpenAI API failures

**Symptoms:**
- Chat widget shows "I'm having trouble responding right now"
- Logs show OpenAI API errors

**Diagnosis:**
1. Check `OPENAI_API_KEY` is set in Render environment variables
2. Check OpenAI API status (status.openai.com)
3. Check rate limits and quota

**Fix:**
- Verify API key is valid
- Add fallback responses for API failures
- Implement retry logic with exponential backoff

---

## Future Enhancements

### Phase 3: Intelligence Analysis Dashboard
- Automated pattern recognition
- Conversion funnel visualization
- A/B test result tracking
- Predictive case outcome modeling

### Phase 4: AI Training Pipeline
- Export chat conversations for fine-tuning
- Outcome-based reinforcement learning
- Automated response quality scoring
- Continuous model improvement

### Phase 5: Advanced Attribution
- Multi-touch attribution modeling
- Customer lifetime value prediction
- Channel ROI optimization
- Cohort analysis

---

## Security Considerations

### Data Privacy
- All PII (personally identifiable information) is stored securely in PostgreSQL
- Database access restricted to authorized personnel only
- SSL/TLS encryption for all database connections

### Access Control
- Admin dashboard requires authentication
- Database credentials stored in Render environment variables (never in code)
- API endpoints validate session existence before saving data

### Audit Trail
- All login attempts logged in `login_audit` table
- File uploads tracked with IP address and timestamp
- Database queries logged by Render

---

## Maintenance

### Daily Tasks
- Monitor chat session counts
- Check for API errors in logs
- Review recent outcomes

### Weekly Tasks
- Analyze conversion patterns
- Update outcome records for resolved cases
- Review AI response quality

### Monthly Tasks
- Database backup verification
- Performance optimization
- Schema updates (if needed)

---

## Support and Contact

**For technical issues:**
- Check Render logs first
- Review this documentation
- Contact platform administrator

**For data analysis requests:**
- Use provided SQL queries
- Access admin dashboard analytics
- Request custom reports from administrator

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-10 | Initial documentation | Manus AI |

---

**End of Document**
