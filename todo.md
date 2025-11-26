# Turbo Response - TODO

## 🚨🚨🚨 URGENT FIXES - Mobile Admin + Routing (HIGHEST PRIORITY)

### Mobile Admin Dashboard Issue
- [ ] Fix "Could not load the case" error on mobile
- [ ] Check mobile API requests to /api/admin/cases/:id
- [ ] Verify auth/session tokens work on mobile
- [ ] Check CORS headers for mobile browsers
- [ ] Test cookie handling on mobile Safari/Chrome
- [ ] Verify admin middleware doesn't block mobile requests
- [ ] Add mobile-specific logging to diagnose issue

### Routing Fix - /admin/case/:id → /admin/cases/:id
- [ ] Update App.tsx route definition
- [ ] Update AdminDashboard.tsx "View Case" navigation
- [ ] Update AdminCaseDetail.tsx breadcrumbs/links
- [ ] Search codebase for ALL /admin/case/ references
- [ ] Test case detail page loads for consumer cases
- [ ] Test case detail page loads for business cases

### Business Intake Pipeline Alignment
- [ ] Verify business intake creates portal user (DONE - just deployed)
- [ ] Verify business cases appear in unified admin list
- [ ] Verify business cases use same case detail page
- [ ] Verify business cases follow payment flow
- [ ] Verify business cases redirect to portal after payment
- [ ] Verify business case uploads work
- [ ] Verify case_type field is set correctly

### Complete Testing Checklist
**Desktop - Consumer Flow:**
- [ ] Submit intake form
- [ ] Verify case appears in admin dashboard
- [ ] Click "View Case" - detail page loads
- [ ] Verify all fields display
- [ ] Test payment flow
- [ ] Test portal access
- [ ] Test file uploads

**Desktop - Business Flow:**
- [ ] Submit business intake form
- [ ] Verify case appears in admin dashboard
- [ ] Click "View Case" - detail page loads
- [ ] Verify all fields display
- [ ] Test payment flow
- [ ] Test portal access
- [ ] Test file uploads

**Mobile - Admin:**
- [ ] Login to admin dashboard
- [ ] Dashboard loads correctly
- [ ] Click consumer case - detail loads
- [ ] Click business case - detail loads
- [ ] All actions work (status update, messaging, etc.)

---

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
