# Turbo Response - TODO

## 🚨 CRITICAL ISSUES - USER REPORTED (JAN 26 2025 - 3:00 PM)

### 1️⃣ CLIENT PORTAL - Verification Code Email Failing (CRITICAL)
- [x] Check /api/client/send-code endpoint implementation
- [x] Verify emailService is using EMAIL_USER/EMAIL_PASSWORD from env
- [x] Check if email transporter is initialized correctly
- [x] Add detailed error logging for email failures
- [x] Fixed: Now checks if emailService.sendEmail() returns false
- [x] Added console logging to track email send status
- [ ] Deploy and test on production

### 2️⃣ CLIENT PORTAL - "No case found with that email and case ID"
- [x] Review clientAuth.js case lookup logic
- [x] Verify query checks both cases AND business_intakes tables
- [x] Fixed: Added LOWER(TRIM()) to handle case sensitivity and whitespace
- [x] Added detailed logging to show which table is being queried
- [x] Now normalizes both email and case ID before comparison
- [ ] Deploy and test with actual consumer case data

### 3️⃣ CONSUMER CLIENT PORTAL - File Upload Feature
- [x] File upload button EXISTS (📎 paperclip button)
- [x] Upload endpoint EXISTS (/api/upload/single)
- [x] File display in messages EXISTS
- [x] File type validation EXISTS (.pdf, .jpg, .png, .heic, .webp, .tiff, .bmp)
- [ ] NEED TO TEST: Verify file upload works on production
- [ ] NEED TO TEST: Check if uploaded files appear in admin dashboard
- [ ] If broken: Check /api/upload/single endpoint and S3 configuration

### 4️⃣ MOBILE ADMIN PORTAL - Android Login Failure
- [ ] Check CORS configuration for mobile browsers
- [ ] Verify cookie handling on Android browsers
- [ ] Check domain redirect logic (turboresponsehq.ai vs www.)
- [ ] Test admin token persistence on Android
- [ ] Add mobile-specific error logging

### 5️⃣ BUSINESS PORTAL - Working ✅
- [x] Business messaging fixed
- [x] Gaudi Designs case created
- [x] FK constraint removed
- No AI audit tools needed (manual audits only)

## COMPLETED FIXES (PREVIOUS SESSION)
- [x] Created business_intakes table (migration 010)
- [x] Seeded Gaudi Designs case (migration 011)
- [x] Removed FK constraint from case_messages (migration 012)
- [x] Business messaging now works
