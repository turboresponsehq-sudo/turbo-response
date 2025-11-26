# Turbo Response - TODO

## ✅ WORKING FEATURES (Confirmed JAN 26 2025)
- [x] Client portal login (both consumer & business)
- [x] File upload via "Upload Additional Document" button
- [x] File upload via messaging paperclip button
- [x] Business messaging
- [x] Consumer messaging
- [x] Admin dashboard case viewing (desktop & iPhone)
- [x] Document upload endpoint fixed (commit f2a79c4)

## 🚀 NEW FEATURES TO BUILD (JAN 26 2025 - 3:45 PM)

### 1️⃣ EMAIL NOTIFICATION ON DOCUMENT UPLOAD (HIGH PRIORITY)
- [x] Add email notification to admin when client uploads document
- [x] Include case number, client name, document name in email
- [x] Add link to admin dashboard case detail page
- [ ] Test notification triggers correctly after deployment

### 2️⃣ DOCUMENT GALLERY VIEW (HIGH PRIORITY)
- [x] Build thumbnail grid view for documents in admin dashboard
- [x] Show PDF icon for PDF files
- [x] Show image thumbnails for JPG/PNG/HEIC files
- [x] Add click to open larger view (lightbox)
- [x] Add download button for each document
- [x] Integrated into AdminConsumerCaseDetail page
- [ ] Test on production after deployment

### 3️⃣ DOCUMENT CATEGORIES/TAGS
- [ ] DEFERRED - Not needed for MVP
- [ ] Can be added later when case volume increases

### 4️⃣ FIX ANDROID ADMIN DASHBOARD
- [ ] Fix "Could not load cases" error on Samsung Android
- [ ] Add better error logging to AdminDashboard.tsx
- [ ] Check if API response format is correct
- [ ] Test on Android after fix

## 📝 TECHNICAL NOTES

### Database Schema Changes Needed
- [ ] Add `category` field to document storage
- [ ] Consider creating `case_documents` table instead of JSON array
- [ ] Add `uploaded_by` field (client vs admin)
- [ ] Add `uploaded_at` timestamp

### Email Service
- [ ] Use existing emailService.sendEmail()
- [ ] Create document upload email template
- [ ] Include case details and document info

### Frontend Components
- [ ] Create DocumentGallery component
- [ ] Create DocumentUploadWithCategory component
- [ ] Update AdminCaseDetail to show gallery instead of list
