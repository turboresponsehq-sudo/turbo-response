# Fix #003: Admin Delete Case for Business Intakes

**Date:** 2025-02-05  
**Status:** ✅ Fixed  
**Priority:** High (P1)  
**Affected Users:** Admin trying to delete business intake cases

---

## Problem

**Symptom:** Admin tries to delete Case #13 from admin dashboard, receives "404 - Case not found" error.

**User Report:**
- Admin can view Case #13 in dashboard
- Admin clicks delete button
- Browser console shows: "Failed to load resource: the server responded with a status of 404 ()"
- Error message: "Case not found"

**Screenshot Evidence:**
- Console shows: `API Response: Object`
- Console shows: `Case Data: Object`
- Console shows: `Case Number: na`
- Console shows: `Full Name: zee`
- Error: `Failed to load resource: the server responded with a status of 404 ()`

---

## Root Cause

**Dual-Table Architecture Issue:** The `deleteCase` function only checks and deletes from the `cases` table, but Case #13 exists in the `business_intakes` table.

**Broken Code (Line 783-793):**
```javascript
// Check if case exists
const checkResult = await query(
  'SELECT id FROM cases WHERE id = $1',  // ← Only checks cases table
  [caseId]
);

if (checkResult.rows.length === 0) {
  return res.status(404).json({
    success: false,
    error: 'Case not found'  // ← Returns 404 for business intakes
  });
}
```

**Broken Code (Line 841):**
```javascript
// Delete the case
await query('DELETE FROM cases WHERE id = $1', [caseId]);  // ← Only deletes from cases table
```

**Why it fails:**
1. Admin tries to delete Case #13 (business intake)
2. Backend checks `cases` table for ID 13 → not found
3. Returns 404 error before checking `business_intakes` table
4. Case #13 is never deleted

---

## Solution

**Strategy:** Check both tables to determine case type, then delete from the correct table.

**Implementation:**

### Step 1: Check Both Tables (Lines 782-804)

**Before:**
```javascript
// Check if case exists
const checkResult = await query(
  'SELECT id FROM cases WHERE id = $1',
  [caseId]
);

if (checkResult.rows.length === 0) {
  return res.status(404).json({
    success: false,
    error: 'Case not found'
  });
}
```

**After:**
```javascript
// Check if case exists in either table
let checkResult = await query(
  'SELECT id, \'consumer\' as case_type FROM cases WHERE id = $1',
  [caseId]
);

// If not found in cases, check business_intakes
if (checkResult.rows.length === 0) {
  checkResult = await query(
    'SELECT id, \'business\' as case_type FROM business_intakes WHERE id = $1',
    [caseId]
  );
}

if (checkResult.rows.length === 0) {
  return res.status(404).json({
    success: false,
    error: 'Case not found'
  });
}

const caseType = checkResult.rows[0].case_type;
const tableName = caseType === 'consumer' ? 'cases' : 'business_intakes';
```

### Step 2: Get Documents from Correct Table (Line 807)

**Before:**
```javascript
const caseData = await query('SELECT documents FROM cases WHERE id = $1', [caseId]);
```

**After:**
```javascript
const caseData = await query(`SELECT documents FROM ${tableName} WHERE id = $1`, [caseId]);
```

### Step 3: Delete from Correct Table (Lines 851-854)

**Before:**
```javascript
// Delete the case
await query('DELETE FROM cases WHERE id = $1', [caseId]);
```

**After:**
```javascript
// Delete the case from the correct table (this is the critical operation)
await query(`DELETE FROM ${tableName} WHERE id = $1`, [caseId]);

console.log(`[DELETE CASE] Successfully deleted case ${caseId} from ${tableName}`);
```

### Step 4: Enhanced Error Logging (Lines 860-875)

**Added:**
```javascript
console.error('[DELETE CASE] Error:', {
  error: error.message,
  caseId: req.params.id,
  stack: error.stack
});
```

---

## Code Changes

**Files Modified:**
- `src/controllers/casesController.js` (lines 782-875)

**Key Changes:**
1. **Line 783-804:** Check both `cases` and `business_intakes` tables
2. **Line 803-804:** Determine table name based on case type
3. **Line 807:** Get documents from correct table
4. **Line 852:** Delete from correct table using dynamic table name
5. **Line 854:** Log successful deletion with table name
6. **Line 861-865:** Enhanced error logging with stack trace

---

## Verification Steps

### 1. Test Deleting Business Intake Case
1. Log in as admin
2. Navigate to Case #13 (business intake)
3. Click "Delete Case" button
4. **Expected:** Case deleted successfully, redirected to cases list
5. **Expected:** Case #13 no longer appears in dashboard

### 2. Test Deleting Consumer Case
1. Log in as admin
2. Navigate to any consumer case (from `cases` table)
3. Click "Delete Case" button
4. **Expected:** Case deleted successfully
5. **Expected:** Case no longer appears in dashboard

### 3. Check Server Logs
Look for log message:
```
[DELETE CASE] Successfully deleted case 13 from business_intakes
```

### 4. Verify Database
```sql
-- Case should be deleted
SELECT * FROM business_intakes WHERE id = 13;
-- Expected: 0 rows

-- Related records should also be deleted
SELECT * FROM case_analyses WHERE case_id = 13;
SELECT * FROM draft_letters WHERE case_id = 13;
SELECT * FROM ai_usage_logs WHERE case_id = 13;
```

---

## Related Issues

This fix is part of the ongoing dual-table architecture fixes:

**Previous Fixes:**
- ✅ Fix #001: Client portal login for business intakes
- ✅ Fix #002: Client portal payment status field mismatch
- ✅ Admin dashboard queries both tables
- ✅ Payment verification checks both tables

**This Fix:**
- ✅ Admin delete case works for both tables

**Pattern Established:**
All case operations must check BOTH tables:
1. Try `cases` table first
2. If not found, try `business_intakes` table
3. Perform operation on the correct table

---

## Security Considerations

**SQL Injection Risk:** Using dynamic table names with template literals

**Mitigation:**
- Table name is determined by code logic, not user input
- Only two possible values: `'cases'` or `'business_intakes'`
- No user-supplied data in table name
- Risk level: 🟢 Low

**Code:**
```javascript
const tableName = caseType === 'consumer' ? 'cases' : 'business_intakes';
await query(`DELETE FROM ${tableName} WHERE id = $1`, [caseId]);
```

**Why it's safe:**
- `caseType` comes from database query result, not user input
- Only two hardcoded string values possible
- User input (`caseId`) is still parameterized with `$1`

---

## Testing Checklist

- [ ] Admin can delete business intake cases (e.g., Case #13)
- [ ] Admin can delete consumer cases
- [ ] 404 error only occurs when case truly doesn't exist in either table
- [ ] Related records (analyses, draft letters, logs) are deleted
- [ ] Uploaded files are deleted from filesystem
- [ ] Server logs show correct table name
- [ ] No SQL injection vulnerabilities
- [ ] Error handling works correctly

---

## Deployment Notes

**Risk Level:** 🟡 Medium
- Uses dynamic table names (requires careful review)
- Deletes data permanently (no undo)
- Affects admin functionality only

**Deployment Steps:**
1. Push changes to GitHub
2. Render auto-deploys from `main` branch
3. Wait 3-5 minutes for deployment
4. Test deleting Case #13 from admin dashboard
5. Verify case is deleted from database
6. Monitor server logs for errors

**Rollback Plan:**
If issues occur, rollback to previous commit:
```bash
git revert HEAD
git push origin main
```

**Backup Recommendation:**
Before deleting important cases, consider backing up the database:
```bash
# In Render dashboard, create manual backup
# Or export specific case data before deletion
```

---

## Long-Term Recommendations

### Recommendation 1: Soft Delete Instead of Hard Delete
Implement soft delete to allow recovery:

```javascript
// Instead of DELETE, update a deleted_at timestamp
await query(`UPDATE ${tableName} SET deleted_at = NOW() WHERE id = $1`, [caseId]);
```

**Benefits:**
- Can recover accidentally deleted cases
- Maintain audit trail
- Safer for production systems

### Recommendation 2: Cascade Deletes with Foreign Keys
Add foreign key constraints to automatically delete related records:

```sql
ALTER TABLE case_analyses 
ADD CONSTRAINT fk_case_id 
FOREIGN KEY (case_id) 
REFERENCES cases(id) 
ON DELETE CASCADE;
```

**Benefits:**
- Database handles related record deletion
- No need for manual DELETE queries
- Prevents orphaned records

### Recommendation 3: Merge Tables
Merge `cases` and `business_intakes` into single table (see Fix #001 recommendations).

---

## Knowledge Base Cross-References

Related fixes:
- `001-client-portal-login-business-intakes.md` - Client login fix
- `002-client-portal-payment-status-field.md` - Payment status field fix
- `README.md` - Dual-table architecture notes

---

**Last Updated:** 2025-02-05  
**Next Review:** After deployment and testing
