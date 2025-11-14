# Turbo Response - HARDENING PHASE

## 🚨 HARDENING PHASE STEP 1: CASE DETAIL PAGE FIXES (IN PROGRESS)

### STEP 1: Fix API Response (GET /api/case/:id)
- [x] Investigate current database schema and field names
- [x] Verify what fields are returned by getAdminCaseById()
- [x] Normalize field names in API response (already correct)
- [x] Return: case_id, category, created_at, case_status, full_name, email, phone, address, case_details, attachments[]
- [x] Handle first_name + last_name → full_name conversion (not needed - database has full_name)
- [ ] Test API response with curl/browser

### STEP 2: Fix Frontend Mappings (AdminCaseDetail.tsx)
- [x] Update all field mappings to match normalized API response
- [x] Add null checks for all fields (prevent React error #31)
- [x] Add fallback values for missing data
- [x] Fix Case ID display
- [x] Fix Category display
- [x] Fix Created Date display
- [x] Fix Status display (already working)
- [x] Fix Full Name display
- [x] Fix Address display
- [x] Fix Description display
- [x] Fix Attachments list display (already working)

### STEP 3: Fix Attachment View
- [x] Verify document URLs match upload directory (code is correct)
- [x] Update frontend link path if needed (not needed)
- [x] Update backend static file path if needed (not needed)
- [ ] Test document download

### STEP 4: Validate with New Test Case
- [ ] Deploy all fixes to production
- [ ] Submit brand new case via /intake form
- [ ] Open case in admin detail page
- [ ] Verify ALL fields display correctly
- [ ] Verify zero console errors
- [ ] Take screenshots of working page
- [ ] Generate completion report

---

## 🎯 NEW FEATURE: AI Analysis Violations Display

- [x] Add potential_violations field to AI analysis JSON schema
- [x] Update AdminCaseDetail.tsx to render violations list with fallback message
- [x] Update backend AI analysis to generate potential_violations data

---

## 🚫 BLOCKED UNTIL STEP 1 COMPLETE

- [ ] AI Analysis debugging
- [ ] Pricing engine verification
- [ ] Delete Case testing
- [ ] Analytics dashboard

---

## 🎯 GOLDEN PATH TO HARDEN

```
/intake → DB → /admin list → /admin/case/:id → status update → AI analysis → delete case
```

**Current Focus:** Step 1 - Case Detail Page backend-to-frontend alignment + AI Analysis Violations

