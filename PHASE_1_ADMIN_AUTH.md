# PHASE 1: Admin Authentication (No OAuth)

**Branch:** feat/admin-auth  
**Status:** In Progress  
**Deploy Target:** Render staging (turboresponsehq-staging)

## Task Checklist

### Infrastructure
- [ ] Create feature branch feat/admin-auth
- [ ] Push branch to GitHub
- [ ] Create Render staging service (turboresponsehq-staging)
- [ ] Verify staging deploys from feat/admin-auth branch

### Database
- [ ] Add admin_sessions table to drizzle/schema.ts
- [ ] Run database migration

### Backend
- [ ] Create server/routers/adminAuthRouter.ts with procedures:
  - [ ] login(username, password) → returns session token
  - [ ] validateSession(token) → validates session
  - [ ] logout(token) → clears session
- [ ] Create adminProcedure middleware (replaces protectedProcedure)
- [ ] Update server/routers/adminRouter.ts to use adminProcedure
- [ ] Add session cookie handling

### Frontend
- [ ] Update AdminLogin.tsx to call trpc.adminAuth.login.useMutation()
- [ ] Update AdminDashboard.tsx to work without Manus OAuth
- [ ] Remove all Manus OAuth dependencies from admin pages

### Testing
- [ ] Test login with admin / admin123
- [ ] Test session persists on refresh
- [ ] Test logout clears session
- [ ] Test /admin loads without OAuth redirect
- [ ] Capture 3 screenshots:
  1. Login page
  2. Dashboard after login
  3. Browser DevTools (Network/Cookies showing session)

### Delivery
- [ ] Open PR to main
- [ ] Write PR description (2-5 sentences)
- [ ] Attach screenshots
- [ ] Document any env vars/migrations added
- [ ] STOP and wait for review

## Acceptance Criteria

✅ Can login with admin / admin123  
✅ Session persists on refresh  
✅ Logout clears session  
✅ /admin loads without OAuth redirect  
✅ Works on staging  
✅ PR includes code diff + 3 screenshots
