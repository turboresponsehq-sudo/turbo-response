# People Matching System - Documentation

**Status:** CONTROLLED FEATURE TEST (Sandbox Phase)  
**Mode:** Founder approval required before any user communication  
**Purpose:** Test AI matching accuracy before scaling

---

## Overview

The People Matching System connects individuals who submit Defense Intake forms to government benefits, grants, and assistance programs they may be eligible for. This is a **controlled test feature** - all matches are reviewed and approved by the founder before being sent to users.

---

## System Architecture

### 1. Data Collection (Phase A - COMPLETE)

**Defense Intake Form** (`/intake`)
- Added optional "Benefits Eligibility Profile" section with 7 fields:
  1. ZIP Code (geographic matching)
  2. Household Size (income threshold calculations)
  3. Monthly Income Range (eligibility screening)
  4. Housing Status (program targeting)
  5. Employment Status (categorical matching)
  6. Special Circumstances (priority groups: veteran, disability, student, senior, single parent, pregnant)
  7. Benefits Consent Checkbox (required for matching)

**Database Storage**
- Table: `eligibility_profiles`
- Columns:
  - Profile data: zipCode, householdSize, monthlyIncomeRange, housingStatus, employmentStatus, specialCircumstances
  - Consent: benefitsConsent (boolean)
  - Matching workflow: matchingStatus, matchingScore, matchedPrograms (JSON), reportGeneratedAt
  - Approval workflow: approvedBy, approvedAt
  - Metadata: caseId (FK), userEmail, createdAt, updatedAt

**Matching Status Flow:**
```
pending → draft → approved/rejected
```

---

### 2. Matching Engine (Phase B - COMPLETE)

**Location:** `server/matching/eligibility-matcher.js`

**Scoring Algorithm:**
- Income matching (40 points): Compare user income to program limits
- Geographic matching (20 points): Federal/state/local program availability
- Household size matching (10 points): Family size requirements
- Housing status matching (10 points): Rent/own/homeless targeting
- Employment status matching (10 points): Employed/unemployed/disabled/retired
- Special circumstances bonus (10 points): Priority groups (veteran, disability, etc.)

**Total Score:** 0-100 (only programs with 50+ score are included)

**Program Database (Current):**
- SNAP (Food Stamps)
- LIHEAP (Utility Assistance)
- Section 8 Housing Voucher
- Medicaid
- TANF (Cash Assistance)

**Future Expansion:**
- Benefits.gov API integration
- State/local program databases
- Grants.gov federal grants
- Workforce development programs

---

### 3. Report Generation (Phase B - COMPLETE)

**Location:** `server/matching/report-generator.js`

**Individual Reports:**
- Saved to: `/docs/people-benefits-reports/profile-{id}-{date}.md`
- Contents:
  - User eligibility profile summary
  - Matched programs (ranked by score)
  - Eligibility assessment for each program
  - Documents needed
  - Application deadlines
  - Next steps with URLs

**Daily Summary Reports:**
- Saved to: `/docs/people-benefits-reports/daily-summary-{date}.md`
- Contents:
  - Total profiles processed
  - Successful matches (pending review)
  - Errors encountered
  - Quick stats for founder review

---

### 4. Admin Control Panel (Phase B - COMPLETE)

**Manual Trigger Endpoint:**
```
POST /api/admin/run-matching
```
- Processes all profiles with `benefitsConsent = true` and `matchingStatus = 'pending'`
- Generates draft reports (does NOT send to users)
- Returns summary of results

**Status Dashboard:**
```
GET /api/admin/matching-status
```
- Shows breakdown by matchingStatus (pending/draft/approved/rejected)
- Lists recent 50 profiles with scores

**Approval Workflow:**
```
POST /api/admin/approve-match/:profileId
Body: { "approverName": "Zakhy" }
```
- Marks profile as approved
- Ready for manual email sending

**Rejection Workflow:**
```
POST /api/admin/reject-match/:profileId
Body: { "reason": "Low quality matches" }
```
- Resets profile to rejected status
- Clears matches and score

---

## Usage Workflow (Controlled Mode)

### Step 1: User Submits Intake
1. User visits `turboresponsehq.ai/intake`
2. Fills out Defense Intake form
3. Optionally fills out Benefits Eligibility Profile
4. Checks consent checkbox
5. Submits form

### Step 2: Founder Triggers Matching
1. Founder calls `POST /api/admin/run-matching` (manually or via scheduled job)
2. System processes all pending profiles
3. Generates draft reports in `/docs/people-benefits-reports/`
4. Founder receives daily summary

### Step 3: Founder Reviews Reports
1. Founder reads individual reports
2. Checks match quality and accuracy
3. Verifies program eligibility logic

### Step 4: Founder Approves/Rejects
1. For good matches: `POST /api/admin/approve-match/:profileId`
2. For poor matches: `POST /api/admin/reject-match/:profileId`

### Step 5: Manual Email Sending (Future Phase C)
1. Founder manually emails approved reports to users
2. Tracks user feedback and accuracy
3. Refines matching algorithm based on results

---

## Security & Privacy

**Data Minimization:**
- Only collect data needed for eligibility matching
- No SSN, bank accounts, or sensitive personal info

**Explicit Consent:**
- Consent checkbox required for matching
- Opt-out link in every email (future)

**Secure Storage:**
- Encrypted database
- No external sharing without consent

**Official Channels Only:**
- Use official application portals
- No scraping personal information
- No direct contact with agencies on user's behalf

---

## Testing & Validation

**Sandbox Phase Goals:**
1. Test matching accuracy (target: 80%+ correct matches)
2. Validate eligibility scoring algorithm
3. Identify missing programs or data sources
4. Refine report quality and clarity
5. Measure user response rates

**Success Metrics:**
- Match accuracy: % of approved matches that user successfully applies for
- Program coverage: % of eligible programs found
- User satisfaction: Feedback from users who receive reports
- Time to approval: Days from intake to approved report

**Timeline:**
- Sandbox phase: 7-14 days
- After validation: Consider automation for high-confidence matches (score > 90)

---

## Future Enhancements (Phase 2.1)

**Automation (After Validation):**
- Auto-approve high-confidence matches (score > 90)
- Scheduled daily matching runs
- Automatic email delivery for approved reports

**Reminders & Tracking:**
- Deadline reminder emails (7 days, 3 days, 1 day before)
- Document checklist tracker
- Application status tracking
- Follow-up surveys

**Portfolio Integration:**
- Track total benefit value secured per user
- Success rate dashboard
- ROI calculations for Turbo Response services

**Expanded Program Database:**
- Benefits.gov API integration
- State-specific programs (all 50 states)
- Local county/city programs
- Federal grants (Grants.gov)
- Workforce development (WIOA, job training)
- Veterans benefits (VA programs)
- Disability benefits (SSI/SSDI)

---

## Technical Notes

**Database Schema:**
```sql
ALTER TABLE eligibility_profiles 
ADD COLUMN matchingStatus VARCHAR(20) DEFAULT 'pending',
ADD COLUMN matchingScore INT,
ADD COLUMN matchedPrograms JSON,
ADD COLUMN reportGeneratedAt TIMESTAMP NULL,
ADD COLUMN approvedBy VARCHAR(255),
ADD COLUMN approvedAt TIMESTAMP NULL;
```

**Dependencies:**
- Express.js (routing)
- Drizzle ORM (database)
- Node.js fs module (file generation)

**File Structure:**
```
server/
  matching/
    eligibility-matcher.js   # Core matching engine
    report-generator.js      # Report generation
  routes/
    admin-matching.js        # Admin control endpoints
docs/
  people-benefits-reports/   # Generated reports
```

---

## Support & Maintenance

**Founder Contact:**
- Name: Demarcus Collins (Zakhy)
- Role: CEO & Founder, Turbo Response
- Email: turboresponsehq@gmail.com

**System Status:**
- Current Phase: Controlled Feature Test (Sandbox)
- Deployment Status: Local development (not in production yet)
- Next Milestone: Deploy to production and test with real cases

---

**Last Updated:** February 7, 2026  
**Version:** 1.0 (Phase A + B Complete)
