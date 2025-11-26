# Turbo Response - TODO

## 🚨🚨🚨 NEW CRITICAL ISSUES - JAN 26 2025 (USER REPORTED)

### Issue A: Client Portal Login - Verification Code Failure
- [ ] Investigate "Failed to send verification code" error
- [ ] Check EMAIL_USER and EMAIL_PASSWORD env vars on Render
- [ ] Verify sendEmail() function in emailService.js
- [ ] Test email sending with business case (TR-78678309-671)
- [ ] Add better error logging for email failures

### Issue B: Business Case Messaging - Still 500 Errors
- [ ] Verify messagingController.js deployed to production
- [ ] Check if business_intakes table has unread_messages_count column
- [ ] Add database migration if column missing
- [ ] Test messaging with business case ID
- [ ] Add console logging to track which table is being updated

### Issue C: Mobile Admin Dashboard - Could Not Load Cases
- [ ] Check if getAllCases() changes deployed to production
- [ ] Verify UNION query works on production database
- [ ] Test API endpoint /api/cases/admin/all on mobile
- [ ] Check CORS headers in response
- [ ] Add mobile-specific error logging

## 🚨🚨🚨 ROOT CODE ISSUES - HIGHEST PRIORITY

### Issue 1: View Case 404 Error
- [x] URL shows `/admin/case/58` but should be `/admin/cases/58`
- [x] Find ALL places that generate case detail links
- [x] Search for any remaining `/admin/case/` references (without 's') - NONE FOUND
- [x] Verify AdminDashboard.tsx handleCaseClick uses correct route - FIXED
- [x] Check if there are other components linking to case details - ALL CORRECT
- [ ] Test on desktop and mobile after deployment

### Issue 2: Business Cases NOT Appearing in Admin List
- [x] Check `/api/cases/admin/all` endpoint - FIXED
- [x] Verify it queries BOTH tables (cases + business_intakes) - NOW MERGES BOTH
- [x] Check if business_intakes table has data - WILL VERIFY AFTER DEPLOYMENT
- [x] Verify merged response includes business cases - IMPLEMENTED
- [x] Check frontend table rendering logic - ALREADY CORRECT
- [x] Ensure case_type field distinguishes consumer vs business - ADDED

### Issue 3: Case Detail Endpoint Failures
- [x] Check `/api/case/:id` endpoint (getAdminCaseById) - FIXED
- [x] Verify it can find cases from BOTH tables - NOW CHECKS BOTH
- [ ] Test with consumer case ID - AFTER DEPLOYMENT
- [ ] Test with business case ID - AFTER DEPLOYMENT
- [x] Ensure full case object is returned - IMPLEMENTED
- [x] Verify no null/undefined responses - ERROR HANDLING ADDED

### Issue 4: Mobile Admin Errors
- [x] Related to Issue 1 (404 route error) - FIXED
- [x] Will be fixed once route is corrected - DONE
- [ ] Test mobile after deployment
- [x] Verify auth tokens work on mobile - LOGGING ADDED
- [x] Check console logs on mobile browser - ENHANCED ERROR MESSAGES

### End-to-End Testing Required
**Consumer Intake:**
- [ ] Submit form
- [ ] Case appears in admin list
- [ ] Click "View Case" - loads successfully
- [ ] Test on mobile - works

**Business Intake:**
- [ ] Submit form
- [ ] Case appears in admin list
- [ ] Click "View Case" - loads successfully
- [ ] Test on mobile - works


## 🚨 URGENT - PRODUCTION BROKEN (JAN 26 2025 - 2:15 PM)

### Business Messaging 500 Error - FIXED
- [x] Discovered business_intakes table doesn't exist in production PostgreSQL
- [x] Created migration 010_create_business_intakes.mjs
- [x] Migration will create table with all columns including unread_messages_count
- [ ] Deploy to GitHub and wait for Render auto-deploy
- [ ] Verify migration runs successfully in Render logs
- [ ] Test messaging after deployment

### Mobile Admin Login - INVESTIGATING
- [x] Email credentials ARE set (confirmed in screenshot)
- [ ] Need to check actual error in Render logs after deployment
- [ ] May be related to business_intakes table missing
- [ ] Test after migration deployment


## 🚨 EMERGENCY FIX - Business Messaging (JAN 26 2025 - 2:30 PM)

### Issue: Gaudi Designs case doesn't exist in database
- [x] Migration created table but it's empty
- [x] Original case submission was lost (table didn't exist)
- [x] Create seed script to insert Gaudi Designs case manually
- [x] Deploy and run seed script on production (commit 30c78cc)
- [ ] Wait for Render deployment (2-3 minutes)
- [ ] Test messaging after case is seeded


## 🚨 CRITICAL - Foreign Key Constraint Blocking Business Messaging (JAN 26 2025 - 2:45 PM)

### Root Cause: case_messages table has FK constraint to cases table only
- [x] Error: "violates foreign key constraint case_messages_case_id_fkey"
- [x] case_messages.case_id references cases(id) only
- [x] Business cases are in business_intakes table, not cases table
- [x] Create migration 012_remove_case_messages_fk.mjs
- [x] Deploy to GitHub (commit 0ea9280)
- [ ] Wait for Render deployment (2-3 minutes)
- [ ] Test business messaging after deployment
