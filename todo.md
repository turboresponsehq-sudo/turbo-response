# Turbo Response - Phased Development Plan

## 🚀 PHASE 1: FINALIZE CORE MVP (IN PROGRESS)

### 1. Mobile Responsiveness
- [x] Fix admin dashboard mobile layout (table, buttons, navigation)
- [x] Fix admin case detail mobile layout (cards, forms, status dropdown)
- [ ] Test on iPhone/Safari viewport sizes (375px, 414px, 768px)
- [ ] Test on Android/Chrome viewport sizes

### 2. Safari/iPhone Authentication
- [x] Fix cookie/token storage issues on Safari/iPhone (using localStorage, no cookies)
- [ ] Test admin login flow on iOS Safari
- [ ] Verify token persistence across page refreshes
- [x] Add SameSite cookie attributes if needed (N/A - using localStorage not cookies)

### 3. Backend/Frontend Integration
- [x] Verify GET /api/cases/admin/all returns correct data
- [x] Verify GET /api/case/:id returns complete case object
- [x] Verify PATCH /api/case/:id status update works
- [ ] Test on desktop Chrome, Firefox, Safari
- [ ] Test on mobile Chrome, Safari

### 4. Document List UI
- [x] Add document list section to AdminCaseDetail.tsx
- [x] Display document filename, size, upload date
- [x] Add download link for each document
- [x] Handle empty documents array gracefully
- [x] Style document list to match existing cards

### 5. Status Change Mobile Testing
- [ ] Test status dropdown on mobile (touch-friendly)
- [ ] Test "Update Status" button on mobile
- [ ] Verify success/error messages display correctly
- [ ] Test status transition validation on mobile

### 6. Caching & Build Pipeline
- [x] Clear Render build cache (emptyOutDir: true in vite.config.ts)
- [x] Verify Vite build command in Render settings
- [x] Add cache-busting for static assets (content hash in filenames)
- [ ] Test deployment process end-to-end
- [x] Document build/deploy steps

### 7. Intake → Database → Admin Workflow
- [x] Test consumer intake form submission (verified code integration)
- [x] Verify case appears in database (POST /api/intake creates record)
- [x] Verify case appears in admin dashboard (GET /api/cases/admin/all)
- [x] Verify case detail page loads correctly (GET /api/case/:id)
- [x] Test with multiple categories (consumer, debt, eviction, IRS) (all 8 categories supported)
- [x] Test with file attachments (file upload integration verified)

### 8. Phase 1 Verification & Report
- [ ] Screenshot: Admin dashboard (desktop)
- [ ] Screenshot: Admin dashboard (mobile)
- [ ] Screenshot: Admin case detail (desktop)
- [ ] Screenshot: Admin case detail (mobile)
- [ ] Screenshot: Status update success
- [ ] Screenshot: Document list UI
- [ ] Deployment logs verification
- [ ] Performance check (page load times)
- [ ] Create comprehensive Phase 1 report
- [ ] Wait for approval before Phase 2

---

## 📊 PHASE 2: BUSINESS INTELLIGENCE & ANALYTICS (PENDING APPROVAL)

### Analytics Dashboard
- [ ] Add total cases count
- [ ] Add weekly/monthly case counts
- [ ] Add category breakdown (consumer, debt, eviction, IRS)
- [ ] Add status breakdown (Pending Review, In Review, Awaiting Client, Completed, Rejected)
- [ ] Add case timeline log for each case
- [ ] Add monthly trend chart

---

## 📧 PHASE 3: CONVERSION AUTOMATIONS (PENDING APPROVAL)

### Email Notifications
- [ ] New case notification to admin
- [ ] Case confirmation email to client
- [ ] Status change email to client
- [ ] Optional SMS (requires approval)
- [ ] Light document template autofill

---

## 🤖 PHASE 4: ACTION PLAN ENGINE (PENDING APPROVAL)

### AI-Assisted Action Plans
- [ ] Build action plan generator for each category
- [ ] Create PDF export
- [ ] Add admin preview + edit mode
- [ ] Setup logic mapping from intake → plan

---

## 💳 PHASE 5: PAYMENT & MEMBERSHIP SYSTEM (PENDING APPROVAL)

### Payment Integration
- [ ] Secure payment page
- [ ] Membership plan settings
- [ ] Token/usage limits
- [ ] Billing admin panel
- [ ] Deployment security checks

---

## 📝 NOTES

**Current Focus:** Phase 1 - Core MVP Finalization
**Status:** In Progress
**Next Milestone:** Phase 1 completion report and approval
**Deployment:** All changes pushed to GitHub, auto-deploy to Render


---

## 🎨 COLOR SCHEME UPDATE (NEW REQUEST)

### Design System Update
- [x] Extract exact color values from reference images
- [x] Create color system documentation
- [x] Update global CSS variables in index.css
- [x] Test color contrast for accessibility (documented in COLOR_SYSTEM.md)

### Page Updates (Dark Navy Blue Theme)
- [x] Update Home page (/) colors (global theme applied)
- [x] Update Intake form (/intake) colors (global theme applied)
- [x] Update Confirmation page (/consumer/confirmation) colors (global theme applied)
- [x] Update Admin Login (/admin/login) colors (global theme applied)
- [x] Update Admin Dashboard (/admin) colors (global theme applied)
- [x] Update Admin Case Detail (/admin/case/:id) colors (global theme applied)

### Testing
- [ ] Test on desktop Chrome, Firefox, Safari
- [ ] Test on mobile Chrome, Safari
- [ ] Verify color consistency across all pages
- [ ] Check readability (text contrast ratios)

---

## 🤖 AI ARCHITECTURE v1.0 INTEGRATION (NEW REQUEST)

### Documentation
- [x] Copy AI Architecture v1.0 PDF to project
- [x] Create AI_ARCHITECTURE_REFERENCE.md
- [ ] Update Master Architecture to reference AI modules
- [ ] Document all AI endpoints

### AI Features (Backend exists, frontend missing)
- [ ] Add "Run AI Analysis" button to Admin Case Detail
- [ ] Display AI analysis results (violations, laws, recommendations)
- [ ] Display success probability score
- [ ] Display smart pricing suggestion
- [ ] Add "Generate Letter" button
- [ ] Display draft letters
- [ ] Add AI usage/cost tracker to Admin Settings



---

## 🚨 CRITICAL: PRICING ENGINE UPDATE (IMMEDIATE)

- [ ] Update AI pricing ranges from $99-$499 to $149-$3,000+
- [ ] Add sophistication-based pricing logic
- [ ] Add violations count multiplier
- [ ] Add document volume factor
- [ ] Add strategy level factor
- [ ] Add urgency multiplier
- [ ] Add time investment calculation
- [ ] Add escalation pathway factor
- [ ] Enforce $149 minimum price floor
- [ ] Test with simple debt case scenario
- [ ] Test with complex eviction case scenario
- [ ] Test with urgent repossession case scenario
- [ ] Test with multi-agency compliance case scenario
- [ ] Update all documentation with new pricing ranges


---

## 🚨 URGENT: DETERMINISTIC PRICING ENGINE v1.0 IMPLEMENTATION

### Backend Implementation
- [ ] Create /backend/src/services/pricingEngine.js with exact formula
- [ ] Integrate pricingEngine into aiAnalysis.js
- [ ] Replace AI-generated pricing with deterministic calculation
- [ ] Add pricing_suggestion and pricing_tier to case_analyses table
- [ ] Create database migration if needed

### API Endpoints
- [ ] Create POST /api/admin/case/:id/analyze endpoint
- [ ] Create GET /api/admin/case/:id/analysis endpoint
- [ ] Ensure auth middleware applied to all endpoints
- [ ] Test endpoints with curl/Postman

### Frontend Integration
- [ ] Add "Run AI Analysis" button to AdminCaseDetail.tsx
- [ ] Display pricing suggestion with tier badge
- [ ] Show pricing breakdown (base, complexity, strategy, docs, urgency)
- [ ] Display violations and laws cited
- [ ] Add "Generate Letter" button
- [ ] Make mobile responsive

### Testing
- [ ] Create /backend/tests/pricingEngine.test.js
- [ ] Test floor at $149 minimum
- [ ] Test eviction high complexity yields high tier
- [ ] Test immediate urgency multiplier
- [ ] Manual test: Simple debt case
- [ ] Manual test: Complex eviction case
- [ ] Manual test: Urgent repossession case

### Deployment
- [ ] Commit changes to GitHub
- [ ] Deploy to Render (clear build cache)
- [ ] Verify on production
- [ ] Test on iPhone Safari (incognito)
- [ ] Generate status report with screenshots


---

## 🚨 CRITICAL: ADMIN WORKFLOW FIXES (BEFORE DEPLOYMENT)

- [x] Fix backend getCaseById to return all fields (case_number, category, created_at, full_name, address, description)
- [x] Verify AdminCaseDetail.tsx has AI Analysis panel
- [x] Fix mobile case row clicks in AdminDashboard (add onClick handlers)
- [x] Add Delete Case button to AdminCaseDetail.tsx
- [x] Create DELETE /api/case/:id endpoint
- [ ] Test case detail page loads with all data
- [ ] Test AI Analysis button works
- [ ] Test Delete Case button works
- [ ] Test mobile case row clicks on iPhone
- [ ] Redeploy frontend + backend together
- [ ] Verify production shows complete case details
