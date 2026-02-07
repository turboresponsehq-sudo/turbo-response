# Fix #005: PDF Upload Fails - "Unexpected file field in upload"

**Date:** February 7, 2025  
**Status:** ✅ Fixed  
**Priority:** Critical (P0)  
**Affected Users:** All users trying to upload more than 5 files at once

---

## Problem

**Symptom:** User tries to upload multiple PDF documents to a case, all uploads fail with error "Unexpected file field in upload"

**User Report:**
- User submits case to Turbo Response
- User attempts to upload 6 PDF files:
  1. Annual Credit Report - Experian.PDF (0.55 MB)
  2. View Your Report _ TransUnion Credit Report.PDF (0.37 MB)
  3. Equifax Dispute Letter.pdf (0.06 MB)
  4. Expierian Dispute Letter.pdf (0.06 MB)
  5. Transunion Dispute Letter.pdf (0.05 MB)
  6. Credit Dispute update report .pdf (0.10 MB)
- All 6 files show red X with error: "Unexpected file field in upload"
- No files are uploaded successfully

**Screenshot Evidence:**
- All files show error state
- Error message: "Unexpected file field in upload"
- Total files: 6 PDFs

---

## Root Cause

**Backend file limit too low:** The upload endpoint was configured to accept a maximum of **5 files** per upload request.

**Code Location:** `src/routes/upload.js` line 69

**Before:**
```javascript
// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', upload.array('files', 5), handleMulterError, uploadMultipleFiles);
                                              ↑
                                        Max 5 files
```

**What happens:**
1. Frontend sends 6 files with field name `'files'`
2. Multer processes first 5 files successfully
3. Multer encounters 6th file
4. Multer throws `LIMIT_UNEXPECTED_FILE` error
5. Error handler returns: "Unexpected file field in upload"
6. All uploads fail (transaction-like behavior)

**Why this error message:**
Multer's `LIMIT_UNEXPECTED_FILE` error occurs when:
- More files than expected are sent
- File field name doesn't match expected name
- In this case: 6 files sent, but only 5 allowed

---

## Solution

**Increase file upload limit from 5 to 20 files.**

**Before (Line 69):**
```javascript
router.post('/multiple', upload.array('files', 5), handleMulterError, uploadMultipleFiles);
```

**After (Line 69):**
```javascript
router.post('/multiple', upload.array('files', 20), handleMulterError, uploadMultipleFiles);
```

**Why 20?**
- Most users upload 3-10 documents per case
- 20 provides comfortable headroom
- Still reasonable for server memory (10MB × 20 = 200MB max)
- Prevents hitting limit during normal usage

---

## Code Changes

**Files Modified:**
- `src/routes/upload.js` (line 69)

**Change Summary:**
1. Changed `upload.array('files', 5)` to `upload.array('files', 20)`
2. Added comment noting increased limit
3. No other changes needed (file size limit still 10MB per file)

---

## Verification Steps

### 1. Test Uploading 6 Files (Previous Failure Case)
1. Navigate to case submission form
2. Select 6 PDF files
3. Click upload
4. **Expected:** All 6 files upload successfully
5. **Verify:** Green checkmarks on all files

### 2. Test Uploading 10 Files
1. Select 10 PDF files
2. Click upload
3. **Expected:** All 10 files upload successfully
4. **Verify:** No "Unexpected file field" errors

### 3. Test Uploading 20 Files (New Limit)
1. Select 20 PDF files
2. Click upload
3. **Expected:** All 20 files upload successfully
4. **Verify:** System handles max load

### 4. Test Uploading 21 Files (Over Limit)
1. Select 21 PDF files
2. Click upload
3. **Expected:** Error message: "Unexpected file field in upload"
4. **Verify:** Limit is enforced at 20

### 5. Check Server Logs
Look for successful uploads:
```
[UPLOAD] Successfully uploaded 6 files for case X
```

---

## Related Issues

This fix addresses file upload limits:

**Previous Fixes:**
- ✅ Fix #001: Client portal login for business intakes
- ✅ Fix #002: Client portal payment status field mismatch
- ✅ Fix #003: Admin delete case for business intakes
- ✅ Fix #004: Admin save portal settings button not responding

**This Fix:**
- ✅ File upload limit increased from 5 to 20

**Pattern Established:**
- Default limits should accommodate typical usage patterns
- Provide headroom for edge cases
- Document limits clearly for future reference

---

## Testing Checklist

- [ ] Upload 6 files (original failure case) - should succeed
- [ ] Upload 10 files - should succeed
- [ ] Upload 15 files - should succeed
- [ ] Upload 20 files (max) - should succeed
- [ ] Upload 21 files - should fail with clear error
- [ ] All file types (PDF, JPG, PNG, DOC) work
- [ ] File size limit (10MB per file) still enforced
- [ ] Progress tracking works for multiple files
- [ ] Success/error states display correctly
- [ ] Works on mobile and desktop

---

## Deployment Notes

**Risk Level:** 🟢 Low
- Simple configuration change
- Increases limit (less restrictive)
- No breaking changes
- Backward compatible

**Deployment Steps:**
1. Push changes to GitHub
2. Render auto-deploys from `main` branch
3. Wait 3-5 minutes for deployment
4. Test uploading 6+ files
5. Verify all files upload successfully

**Rollback Plan:**
If issues occur, rollback to previous commit:
```bash
git revert HEAD
git push origin main
```

---

## Long-Term Recommendations

### Recommendation 1: Dynamic Limit Based on Plan
Different limits for different user tiers:
- Free: 5 files max
- Basic: 10 files max
- Pro: 20 files max
- Enterprise: 50 files max

**Benefits:**
- Encourages upgrades
- Prevents abuse
- Scales with user needs

### Recommendation 2: Frontend Validation
Add client-side check before upload:

```javascript
if (files.length > 20) {
  alert('Maximum 20 files allowed. Please upload in batches.');
  return;
}
```

**Benefits:**
- Faster feedback
- Saves bandwidth
- Better UX

### Recommendation 3: Batch Upload UI
For users with many files:

```javascript
// Split into batches of 20
const batches = chunk(files, 20);
for (const batch of batches) {
  await uploadBatch(batch);
}
```

**Benefits:**
- No hard limit
- Progress tracking per batch
- Better reliability

### Recommendation 4: File Size Monitoring
Track total upload size per case:

```javascript
const totalSize = files.reduce((sum, f) => sum + f.size, 0);
if (totalSize > 100 * 1024 * 1024) { // 100MB total
  alert('Total file size exceeds 100MB limit');
  return;
}
```

**Benefits:**
- Prevents server overload
- Protects storage costs
- Better resource management

---

## System Limits Reference

**Current Limits:**
- **Max files per upload:** 20 files
- **Max file size:** 10MB per file
- **Max total size:** 200MB per upload (20 × 10MB)
- **Allowed types:** PDF, JPG, PNG, GIF, DOC, DOCX

**Multer Configuration:**
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    // ...
  }
});
```

---

## Knowledge Base Cross-References

Related documentation:
- `ARCHITECTURE_REFERENCE.md` - System architecture
- `API_STRATEGY_MASTER.md` - API design patterns
- `README.md` - Project overview

Related fixes:
- `001-client-portal-login-business-intakes.md` - Client login fix
- `002-client-portal-payment-status-field.md` - Payment status fix
- `003-admin-delete-case-dual-table.md` - Admin delete fix
- `004-admin-save-portal-settings-button.md` - Portal settings fix

---

**Last Updated:** February 7, 2025  
**Next Review:** After deployment and testing
