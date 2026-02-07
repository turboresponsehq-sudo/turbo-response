# Fix #001: Client Portal Login for Business Intakes

**Date:** 2025-02-05  
**Status:** ✅ Fixed  
**Priority:** Critical (P0)  
**Affected Users:** All business intake clients trying to access portal

---

## Problem

**Symptom:** Client portal login fails with error: "No case found with that email and case ID"

**Test Case:**
- Case ID: 13
- Client: zee (collinsdemarcus4@gmail.com)
- Category: Business Audit
- Status: Payment verified successfully
- Email sent: Portal activation email received
- **Problem:** Client cannot log in to view their case

---

## Root Cause

The client portal authentication endpoint (`src/controllers/clientAuthController.js`) was checking the `business_intakes` table, BUT it was comparing the user-entered Case ID against the `business_name` column instead of the `id` column.

**The broken query (line 49-54):**
```javascript
// This searches business_name column for "13"
SELECT id, business_name as case_number, email, portal_enabled, 'business' as case_type 
FROM business_intakes 
WHERE LOWER(TRIM(business_name)) = LOWER($1)  // ← Comparing business_name to "13"
AND LOWER(TRIM(email)) = LOWER($2)
```

**Why this failed:**
- User enters Case ID: `13` (the database ID)
- Code searches for `business_name = '13'`
- Actual business_name value: `'na'`
- Result: No match found

**Database Architecture Context:**
The system has TWO separate tables for cases:
1. `cases` table - for regular consumer cases (uses `case_number` field)
2. `business_intakes` table - for business audit submissions (uses `id` field)

---

## Solution

**Strategy:** Detect if the Case ID is numeric, then search by `id` field instead of `business_name`.

**Implementation:** Modified two functions in `src/controllers/clientAuthController.js`:

### 1. Fixed `requestLogin()` function (lines 46-72)

**Before:**
```javascript
// Only searched by business_name
if (result.rows.length === 0) {
  result = await db.query(
    `SELECT id, business_name as case_number, email, portal_enabled, 'business' as case_type 
     FROM business_intakes 
     WHERE LOWER(TRIM(business_name)) = LOWER($1) 
     AND LOWER(TRIM(email)) = LOWER($2)`,
    [caseIdNormalized, emailLower]
  );
}
```

**After:**
```javascript
// Check if numeric, then search by ID or business_name
if (result.rows.length === 0) {
  const isNumeric = /^\d+$/.test(caseIdNormalized);
  
  if (isNumeric) {
    // Search by ID for business intakes
    result = await db.query(
      `SELECT id, COALESCE(business_name, 'Case #' || id) as case_number, email, portal_enabled, 'business' as case_type 
       FROM business_intakes 
       WHERE id = $1 
       AND LOWER(TRIM(email)) = LOWER($2)`,
      [parseInt(caseIdNormalized), emailLower]
    );
  } else {
    // Search by business_name for business intakes
    result = await db.query(
      `SELECT id, business_name as case_number, email, portal_enabled, 'business' as case_type 
       FROM business_intakes 
       WHERE LOWER(TRIM(business_name)) = LOWER($1) 
       AND LOWER(TRIM(email)) = LOWER($2)`,
      [caseIdNormalized, emailLower]
    );
  }
}
```

### 2. Fixed `verifyCode()` function (lines 221-238)

**Before:**
```javascript
// Only searched by business_name
if (result.rows.length === 0) {
  result = await db.query(
    'SELECT id, business_name as case_number, email, full_name, \'business\' as case_type FROM business_intakes WHERE business_name = $1',
    [caseId]
  );
}
```

**After:**
```javascript
// Check if numeric, then search by ID or business_name
if (result.rows.length === 0) {
  const isNumeric = /^\d+$/.test(caseId.trim());
  
  if (isNumeric) {
    // Search by ID for business intakes
    result = await db.query(
      'SELECT id, COALESCE(business_name, \'Case #\' || id) as case_number, email, full_name, \'business\' as case_type FROM business_intakes WHERE id = $1',
      [parseInt(caseId)]
    );
  } else {
    // Search by business_name for business intakes
    result = await db.query(
      'SELECT id, business_name as case_number, email, full_name, \'business\' as case_type FROM business_intakes WHERE business_name = $1',
      [caseId]
    );
  }
}
```

---

## Code Changes

**Files Modified:**
- `src/controllers/clientAuthController.js`
  - Lines 46-72: Fixed `requestLogin()` to check by ID when numeric
  - Lines 221-238: Fixed `verifyCode()` to check by ID when numeric

**Key Logic:**
```javascript
const isNumeric = /^\d+$/.test(caseIdNormalized);
```
This regex checks if the Case ID contains only digits (0-9).

**Database Query Pattern:**
```sql
-- For numeric Case IDs (e.g., "13")
SELECT id, COALESCE(business_name, 'Case #' || id) as case_number, ...
FROM business_intakes 
WHERE id = $1 AND LOWER(TRIM(email)) = LOWER($2)

-- For text Case IDs (e.g., "ABC Corp")
SELECT id, business_name as case_number, ...
FROM business_intakes 
WHERE LOWER(TRIM(business_name)) = LOWER($1) AND LOWER(TRIM(email)) = LOWER($2)
```

---

## Verification Steps

### 1. Test Business Intake Login (Numeric ID)
```bash
# Request verification code
curl -X POST https://turboresponsehq.ai/api/client/request-login \
  -H "Content-Type: application/json" \
  -d '{"email": "collinsdemarcus4@gmail.com", "caseId": "13"}'

# Expected: 200 OK, verification code sent to email
```

### 2. Test Consumer Case Login (Text Case Number)
```bash
# Request verification code
curl -X POST https://turboresponsehq.ai/api/client/request-login \
  -H "Content-Type: application/json" \
  -d '{"email": "consumer@example.com", "caseId": "CASE-12345"}'

# Expected: 200 OK, verification code sent to email
```

### 3. Test Business Intake Login (Business Name)
```bash
# Request verification code
curl -X POST https://turboresponsehq.ai/api/client/request-login \
  -H "Content-Type: application/json" \
  -d '{"email": "business@example.com", "caseId": "Acme Corp"}'

# Expected: 200 OK, verification code sent to email
```

### 4. Check Server Logs
Look for these log messages:
```
[CLIENT AUTH] Business intakes by ID query result: { rowCount: 1 }
```

---

## Related Issues

This fix is part of a larger dual-table architecture issue:

**Previous Fixes:**
- ✅ Admin dashboard queries both tables to display all cases
- ✅ Payment verification endpoint checks both tables
- ✅ "Mark as Paid" button visibility fixed
- ✅ Database field mismatch fixed (`payment_verified` → `payment_status`)

**This Fix:**
- ✅ Client portal authentication now checks both tables correctly

**Remaining Issues:**
- None currently known

---

## Long-Term Recommendations

### Option 1: Merge Tables (Recommended)
Merge `cases` and `business_intakes` into a single `cases` table with a `case_type` field:
```sql
ALTER TABLE cases ADD COLUMN case_type VARCHAR(20) DEFAULT 'consumer';
INSERT INTO cases (case_type, ...) SELECT 'business', ... FROM business_intakes;
DROP TABLE business_intakes;
```

**Benefits:**
- Eliminates dual-table complexity
- Simpler queries (no need to check two tables)
- Easier to maintain and debug

### Option 2: Create Unified View
Create a database view that unions both tables:
```sql
CREATE VIEW all_cases AS
SELECT id, case_number, email, 'consumer' as case_type FROM cases
UNION ALL
SELECT id, business_name as case_number, email, 'business' as case_type FROM business_intakes;
```

**Benefits:**
- No data migration required
- Backward compatible with existing code
- Can be implemented incrementally

### Option 3: Abstraction Layer (Current Approach)
Continue using separate tables but create a unified query function:
```javascript
async function findCaseByIdAndEmail(caseId, email) {
  // Try consumer cases first
  let result = await db.query('SELECT ... FROM cases WHERE ...');
  
  // Try business intakes if not found
  if (result.rows.length === 0) {
    result = await db.query('SELECT ... FROM business_intakes WHERE ...');
  }
  
  return result.rows[0];
}
```

**Benefits:**
- No database changes required
- Can be implemented immediately
- Centralized logic (easier to maintain)

---

## Testing Checklist

- [ ] Business intake clients can log in with numeric Case ID
- [ ] Consumer case clients can log in with alphanumeric Case Number
- [ ] Business intake clients can log in with business name (if applicable)
- [ ] Invalid Case ID + email combinations return proper error
- [ ] Portal access disabled cases return proper error
- [ ] Verification code email is sent successfully
- [ ] JWT token is issued after code verification
- [ ] Client can access their case details after login

---

## Deployment Notes

**Risk Level:** 🟢 Low
- Backward compatible (doesn't break existing functionality)
- Only adds new query logic (doesn't remove old logic)
- No database schema changes required

**Deployment Steps:**
1. Push changes to GitHub
2. Render auto-deploys from `main` branch
3. Wait 3-5 minutes for deployment
4. Test client portal login with Case ID 13
5. Monitor server logs for errors

**Rollback Plan:**
If issues occur, rollback to previous commit:
```bash
git revert HEAD
git push origin main
```

---

## Knowledge Base Index

This document is part of the Turbo Response HQ knowledge base. Related documents:

- `002-payment-verification-dual-table.md` - Payment verification fix
- `003-mark-as-paid-button-visibility.md` - Mark as Paid button fix
- `004-database-field-mismatch.md` - payment_verified → payment_status migration

---

**Last Updated:** 2025-02-05  
**Next Review:** After deployment and user testing
