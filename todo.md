# Turbo Response HQ - EXACT RESTORATION (4 Days Ago)

## Phase 1: Convert HTML to React (Preserve Exact Styling)
- [x] intake_ai.html → IntakeForm.tsx + IntakeForm.css
- [x] turbo_intake.html → TurboIntake.tsx + TurboIntake.css
- [x] admin_ai.html → AdminDashboard.tsx (enhanced with exact original styling)
- [x] admin_login.html → AdminLogin.tsx + AdminLogin.css
- [x] payment.html → Payment.tsx + Payment.css
- [x] admin_settings.html → AdminSettings.tsx + AdminSettings.css

## Phase 2: Restore All Routes
- [ ] / (homepage) - DONE
- [x] /intake (Consumer Defense form)
- [x] /turbo-intake (Business audit form)
- [x] /admin (Admin dashboard)
- [x] /admin/login (Admin login)
- [x] /payment (Payment page)
- [x] /admin/settings (Admin settings)

## Phase 3: Verify Backend & Database
- [ ] Check all tRPC procedures exist
- [ ] Verify database tables (leads, conversations, messages, submissions, business_audits, admin_users, payments)
- [ ] Ensure S3 upload endpoints work
- [ ] Test document upload functionality

## Phase 4: Test Complete Flow
- [ ] Homepage → Intake form → Payment
- [ ] Homepage → Turbo Intake → Payment
- [ ] Admin login → Dashboard → View cases
- [ ] Floating chat widget on all pages

## Phase 5: Deploy
- [ ] Save checkpoint
- [ ] Push to GitHub
- [ ] Verify on turboresponsehq.ai

## Bug Fixes
- [ ] Fix 404 errors on deployed site - all routes except homepage returning 404
- [ ] Add SPA routing configuration for Render deployment
- [x] Fix 404 errors on deployed site - all routes except homepage returning 404
- [x] Add SPA routing configuration for Render deployment
- [x] Fix admin login redirecting to Manus OAuth - use simple localStorage auth

## Missing Legal Pages (NEW)
- [x] client_contract.html → ClientContract.tsx + CSS
- [x] service_agreement.html → ServiceAgreement.tsx + CSS
- [x] disclaimer.html → Disclaimer.tsx + CSS
- [x] terms_of_service.html → TermsOfService.tsx + CSS

## Current Issues
- [ ] Admin login page (/admin/login) showing dashboard instead of login form on live site
- [ ] Need to verify Render is deploying the correct AdminLogin.tsx file
