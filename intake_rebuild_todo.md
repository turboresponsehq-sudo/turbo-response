# Document-First Intake Rebuild

## Phase 1: Planning
- [x] Define document-first flow
- [x] Confirm upload limits (1 initial, up to 4 more during chat)
- [x] Confirm messaging ("Free Case Assessment")
- [x] Confirm service positioning (action plans, not documents)

## Phase 2: Document Analysis
- [ ] Add OpenAI vision API integration for document reading
- [ ] Create document analysis function (identify type, extract key info, assess urgency)
- [ ] Add document upload endpoint with vision processing
- [ ] Handle multiple file formats (PDF, images, etc.)

## Phase 3: Rebuild Intake Page
- [ ] Keep existing basic info form (name, email, phone, address, category)
- [ ] Add document upload section after basic info
- [ ] Add chat interface that appears after document analysis
- [ ] Add "Free Case Assessment" branding
- [ ] Add disclaimers and pricing display
- [ ] Make it mobile responsive

## Phase 4: Backend Integration
- [ ] Update chat routes to handle document-first flow
- [ ] Store uploaded documents with case
- [ ] Generate smart questions based on document analysis
- [ ] Create action plan with service pricing (not document pricing)
- [ ] Save everything to database for admin review

## Phase 5: Testing & Deployment
- [ ] Test full flow locally
- [ ] Test document upload and analysis
- [ ] Test chat conversation
- [ ] Push to GitHub
- [ ] Verify deployment on Render
- [ ] Test on live site

