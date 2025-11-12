# BACKEND DEVELOPMENT TODO

## PHASE 1: Core Backend Setup
- [x] Create /backend folder structure
- [x] Initialize package.json with dependencies
- [x] Create Express server (server.js)
- [x] Add CORS middleware
- [x] Add body parser middleware
- [x] Add error handling middleware
- [ ] Create .env.example file
- [x] Set up logging system

## PHASE 2: Authentication System
- [x] Design database schema (users, submissions, cases)
- [x] Create database connection module
- [x] Implement JWT token generation
- [x] Build POST /api/auth/register endpoint
- [x] Build POST /api/auth/login endpoint
- [x] Build GET /api/auth/me endpoint
- [x] Add authentication middleware
- [x] Add password hashing (bcrypt)

## PHASE 3: AI Features
- [x] Set up OpenAI API client
- [x] Build POST /api/blueprint/generate endpoint
- [x] Implement AI prompt engineering for blueprints
- [x] Build POST /api/chat endpoint
- [x] Add conversation history tracking
- [x] Build document generation logic (integrated in blueprint)
- [ ] Add PDF export functionality (deferred to Phase 6)

## PHASE 4: Payment Processing
- [x] Set up Stripe API client
- [x] Build POST /api/payment/create-checkout endpoint
- [x] Build POST /api/payment/webhook endpoint
- [x] Add payment verification logic
- [x] Link payments to case submissions
- [x] Add receipt generation (via Stripe)

## PHASE 5: Admin Dashboard API
- [x] Build GET /api/admin/submissions endpoint
- [x] Build GET /api/admin/submissions/:id endpoint
- [x] Build PATCH /api/admin/submissions/:id endpoint
- [x] Build DELETE /api/admin/submissions/:id endpoint
- [x] Add admin role verification middleware
- [x] Build GET /api/admin/stats endpoint

## PHASE 6: Intake & Case Management
- [x] Build POST /api/intake/submit endpoint
- [x] Add case data validation
- [x] Store intake submissions in database
- [x] Build GET /api/cases endpoint (user's cases)
- [x] Build GET /api/cases/:id endpoint
- [x] Add case status tracking

## PHASE 7: Testing
- [ ] Test authentication endpoints
- [ ] Test AI blueprint generation
- [ ] Test payment flow
- [ ] Test admin endpoints
- [ ] Test intake submission
- [ ] Test error handling
- [ ] Test security middleware

## PHASE 8: Deployment
- [ ] Create Render web service
- [ ] Configure environment variables on Render
- [ ] Set up database on Render (PostgreSQL)
- [ ] Deploy backend to Render
- [ ] Verify all endpoints work in production
- [ ] Test CORS with frontend domain

## PHASE 9: Frontend Integration
- [ ] Update frontend API base URL
- [ ] Replace old server calls with REST API calls
- [ ] Test login flow
- [ ] Test intake submission flow
- [ ] Test payment flow
- [ ] Test admin dashboard
- [ ] Deploy updated frontend


---

# DATABASE FIX (Nov 11, 2025)
- [x] Fix duplicate trigger creation error
- [x] Make all schema statements idempotent (CREATE IF NOT EXISTS)
- [x] Update schema.sql with safe trigger creation
- [ ] Verify backend starts successfully on Render
- [ ] Test health endpoint
