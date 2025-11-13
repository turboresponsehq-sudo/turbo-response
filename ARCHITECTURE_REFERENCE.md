# 📐 TURBO RESPONSE WEB ARCHITECTURE
## Master Reference Document - Single Source of Truth

**Status:** OFFICIAL - ALL DEVELOPMENT MUST ALIGN WITH THIS DOCUMENT  
**Last Updated:** January 13, 2025  
**Authority:** Demarcus, Chief Strategist, Turbo Response HQ  
**PDF Source:** MASTER_WEB_ARCHITECTURE.pdf

---

## 🔒 ENGINEERING DIRECTIVE

**Build ONLY what is listed. No assumptions. No extras.**

This document replaces all unclear past references and defines every page, workflow, and functional boundary for the Turbo Response system.

**Before ANY code change, deployment, or new phase:**
1. Reference this document
2. Cross-check alignment with defined workflows
3. Note new ideas separately and wait for approval
4. Report back with: Screenshots, Logs, Verification notes
5. Do NOT proceed to next section until approval

---

## 🌐 PUBLIC WEBSITE (CLIENT-FACING)

### 1. Home Page (/)
**Route:** `/`  
**Purpose:** Marketing landing page  
**Components:**
- Hero section with features, services, benefits, CTA
- "Chat with Turbo AI" button
- Clean, modern layout

**Status:** ✅ Implemented

---

### 2. Intake Page (/intake)
**Route:** `/intake`  
**Purpose:** Consumer case submission form  
**Fields:**
- `full_name` (required)
- `email` (required)
- `phone` (required)
- `address` (required)
- `category` (required) - Options: consumer, debt, eviction, IRS, wage, medical, benefits, auto
- `case_details` (required)
- `amount` (optional)
- `deadline` (optional)
- `file uploads` (optional)

**Workflow:**
1. User fills form
2. Files uploaded to backend
3. Form submitted to POST /api/intake
4. Case saved to database
5. Redirect to confirmation page

**Status:** ✅ Implemented

---

### 3. Confirmation Page (/consumer/confirmation)
**Route:** `/consumer/confirmation`  
**Purpose:** Thank you page after intake submission  
**Components:**
- Shows case ID
- Clean thank you message
- **NO PRICING**

**Status:** ✅ Implemented

---

### 4. Contact Page (/contact) [OPTIONAL]
**Route:** `/contact`  
**Purpose:** Simple contact form (if needed)  
**Status:** ⏳ Not yet implemented

---

## 🔐 ADMIN SYSTEM (STAFF ONLY)

### 5. Admin Login (/admin/login)
**Route:** `/admin/login`  
**Purpose:** Admin authentication  
**Fields:**
- Email
- Password

**Workflow:**
1. Admin enters credentials
2. POST /api/auth/login
3. Receive JWT token
4. Store in localStorage as `admin_session`
5. Redirect to /admin

**Status:** ✅ Implemented

---

### 6. Admin Dashboard (/admin)
**Route:** `/admin`  
**Purpose:** List all submitted cases  
**Display Fields:**
- `case_number`
- `full_name`
- `email`
- `category`
- `status`
- `created_at`
- "View Case" buttons

**Requirements:**
- ✅ Fully mobile responsive
- ✅ Desktop: Table layout
- ✅ Mobile: Card layout
- ✅ Touch-friendly buttons (min 48px height)

**API:** GET /api/cases/admin/all

**Status:** ✅ Implemented (Phase 1 Complete)

---

### 7. Admin Case Detail Page (/admin/case/:id)
**Route:** `/admin/case/:id`  
**Purpose:** View and manage individual case  
**Sections:**
1. **Case Information**
   - Case number
   - Category
   - Created date
   - Last updated date

2. **Client Information**
   - Full name
   - Email (clickable)
   - Phone (clickable)
   - Address

3. **Issue Details**
   - Case description
   - Amount (if provided)
   - Deadline (if provided)

4. **Uploaded Documents**
   - Document list with download links
   - Filename display
   - "View" button (opens in new tab)

5. **Status Management**
   - Status dropdown (5 options):
     1. Pending Review
     2. In Review
     3. Awaiting Client
     4. Completed
     5. Rejected
   - Update button
   - Success/error messages

**Requirements:**
- ✅ MUST load correctly on iPhone
- ✅ Fully mobile responsive
- ✅ Desktop: 2-column grid
- ✅ Mobile: 1-column stack
- ✅ Touch-friendly controls

**API:**
- GET /api/case/:id
- PATCH /api/case/:id

**Status:** ✅ Implemented (Phase 1 Complete)

---

### 8. Analytics Dashboard (/admin/analytics)
**Route:** `/admin/analytics`  
**Purpose:** Business intelligence and case statistics  
**Charts:**
- Total cases
- Cases by category
- Cases by status
- Monthly trends
- Activity timeline

**Status:** ⏳ Pending (Phase 2)

---

## 🤖 AUTOMATION LAYERS

### 9. New Case Admin Email Alert
**Trigger:** New case submitted via /intake  
**Action:** Send email notification to admin  
**Status:** ⏳ Pending (Phase 3)

---

### 10. Client Confirmation Email
**Trigger:** Case successfully submitted  
**Action:** Send confirmation email to client with case number  
**Status:** ⏳ Pending (Phase 3)

---

### 11. Status Change Email
**Trigger:** Admin updates case status  
**Action:** Send email notification to client  
**Status:** ⏳ Pending (Phase 3)

---

### 12. Document/Letter Autofill Engine (Future)
**Purpose:** AI-powered document generation  
**Status:** ⏳ Future feature

---

### 13. PDF Export (Future)
**Purpose:** Export case details to PDF  
**Status:** ⏳ Future feature

---

## 💳 PAYMENT SYSTEM (PHASE 5)

### 14. Payments/Memberships Page (/pricing or /membership)
**Route:** `/pricing` or `/membership`  
**Purpose:** Payment and subscription management  
**Status:** ⏳ Pending (Phase 5)

---

## 📋 IMPLEMENTATION CHECKLIST

### ✅ COMPLETED (Phase 1):
- [x] Home Page (/)
- [x] Intake Page (/intake)
- [x] Confirmation Page (/consumer/confirmation)
- [x] Admin Login (/admin/login)
- [x] Admin Dashboard (/admin) - Mobile responsive
- [x] Admin Case Detail (/admin/case/:id) - Mobile responsive
- [x] Document list UI
- [x] Status management system
- [x] Backend API integration
- [x] Build pipeline optimization

### ⏳ PENDING (Phase 2):
- [ ] Analytics Dashboard (/admin/analytics)
- [ ] Total cases chart
- [ ] Cases by category chart
- [ ] Cases by status chart
- [ ] Monthly trends chart
- [ ] Activity timeline

### ⏳ PENDING (Phase 3):
- [ ] New case admin email alert
- [ ] Client confirmation email
- [ ] Status change email notification

### ⏳ PENDING (Phase 4):
- [ ] Document/letter autofill engine
- [ ] PDF export functionality

### ⏳ PENDING (Phase 5):
- [ ] Payments/Memberships page
- [ ] Stripe integration
- [ ] Subscription management

### ⏳ OPTIONAL:
- [ ] Contact Page (/contact)

---

## 🔧 TECHNICAL REQUIREMENTS

### Mobile Responsiveness:
- ✅ All admin pages MUST be mobile responsive
- ✅ Admin case detail MUST load correctly on iPhone
- ✅ Touch-friendly buttons (min 48px height)
- ✅ Breakpoint: 768px (desktop/mobile)

### API Endpoints:
- ✅ POST /api/intake - Submit new case
- ✅ POST /api/auth/login - Admin login
- ✅ GET /api/cases/admin/all - Get all cases (admin)
- ✅ GET /api/case/:id - Get case details (admin)
- ✅ PATCH /api/case/:id - Update case status (admin)

### Authentication:
- ✅ JWT tokens stored in localStorage
- ✅ Key: `admin_session`
- ✅ Bearer token in Authorization header
- ✅ Middleware: authenticateToken + requireAdmin

### Build System:
- ✅ Vite build with cache-busting
- ✅ Content hash in filenames
- ✅ emptyOutDir: true
- ✅ esbuild minification

---

## 📊 PHASE BREAKDOWN

### Phase 1: Core MVP ✅ COMPLETE
- Mobile responsiveness
- Admin workflow stability
- Document list UI
- Build optimization

### Phase 2: Business Intelligence ⏳ NEXT
- Analytics dashboard
- Case statistics
- Trend charts

### Phase 3: Conversion Automations ⏳ PENDING
- Email notifications
- Status change alerts
- Client communications

### Phase 4: Action Plan Engine ⏳ PENDING
- AI-powered document generation
- PDF export
- Template autofill

### Phase 5: Payment System ⏳ PENDING
- Stripe integration
- Membership management
- Billing admin panel

---

## 🚨 CRITICAL RULES

1. **Build ONLY what is listed** - No assumptions, no extras
2. **Reference this document** before ANY code change
3. **Cross-check alignment** with defined workflows
4. **Report back after EACH section** with:
   - Screenshots
   - Logs
   - Verification notes
5. **Do NOT proceed** to next section until approval
6. **Note new ideas separately** and wait for approval
7. **Maintain mobile responsiveness** for all admin pages
8. **Ensure iPhone compatibility** for admin case detail page

---

## 📝 REFERENCE FORMAT

When referring to system functions, use:

**"Refer to Master Web Architecture (Section X)"**

Examples:
- "Refer to Master Web Architecture (Section 7: Admin Case Detail Page)"
- "Refer to Master Web Architecture (Section 2: Intake Page)"
- "Refer to Master Web Architecture (Section 8: Analytics Dashboard)"

This ensures consistency across all departments:
- Business Intelligence
- Conversions
- Automation
- Engineering

---

**Document Authority:** Demarcus, Chief Strategist, Turbo Response HQ  
**Engineering Database:** Stored as "Turbo Response Web Architecture – Master Reference"  
**Status:** OFFICIAL - SINGLE SOURCE OF TRUTH
