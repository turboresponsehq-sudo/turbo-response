# TURBO RESPONSE - ORIGINAL WORKFLOW RESTORATION

## GOAL
Restore the EXACT workflow that was working last week.
NO new features. NO experiments. RESTORATION ONLY.

## ORIGINAL WORKFLOW (TO RESTORE)

1. ✅ User submits Intake Form → Saves to database
2. ⬜ Admin Dashboard shows NEW cases
3. ⬜ Admin opens case → Full details + uploaded documents
4. ⬜ Admin clicks "Run AI Case Analysis" button
5. ⬜ AI reads intake + documents → Generates:
   - Case summary
   - Recommended price
   - Probability of winning
   - Violations detected
   - Legal strategy
   - Step-by-step blueprint
6. ⬜ AI output displays in Admin area
7. ⬜ Admin reviews and approves pricing
8. ⬜ Admin marks case as READY FOR PAYMENT
9. ⬜ Client sees payment page
10. ⬜ Client pays → Case proceeds

## RESTORATION TASKS

### Phase 1: Find Original Code
- [ ] Check git history for working admin dashboard
- [ ] Find commit with AI analysis engine
- [ ] Find commit with blueprint generation
- [ ] Find commit with payment workflow

### Phase 2: Admin Dashboard
- [ ] Restore admin route (/admin)
- [ ] Restore case list view
- [ ] Restore case status badges (NEW, AI NOT RUN, READY FOR PAYMENT, PAID)
- [ ] Restore case details page

### Phase 3: AI Analysis Engine
- [ ] Restore "Run AI Case Analysis" button
- [ ] Restore AI prompt that reads intake + documents
- [ ] Restore recommended pricing logic
- [ ] Restore probability score calculation
- [ ] Restore violations detection
- [ ] Restore legal strategy generation
- [ ] Restore blueprint generation

### Phase 4: AI Output Display
- [ ] Restore AI results display in admin
- [ ] Show case summary
- [ ] Show recommended price
- [ ] Show probability score
- [ ] Show violations
- [ ] Show legal strategy
- [ ] Show step-by-step blueprint

### Phase 5: Payment Workflow
- [ ] Restore admin approval flow
- [ ] Restore "Mark Ready for Payment" button
- [ ] Restore payment page (client-facing)
- [ ] Remove incorrect auto-redirect flow
- [ ] Payment only after admin approval

### Phase 6: Testing
- [ ] Test full workflow end-to-end
- [ ] Verify intake → admin → AI → payment flow
- [ ] Confirm all features work as before

## NOTES
- Everything was working last week
- This is RESTORATION, not new development
- Use Render backend (stable + persistent disk)
- Do NOT change platforms
- Do NOT add new features
- Just restore what worked
