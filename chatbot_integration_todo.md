# Conversational AI Chatbot Integration - TODO

## Phase 1: Analyze Existing Structure
- [x] Clone GitHub repository
- [x] Review Flask app structure
- [x] Identify existing routes and static files
- [x] Review existing intake form categories
- [x] Confirm all 8 service categories

## Phase 2: Database Models
- [x] Create conversations table (SQLite)
- [x] Create messages table
- [x] Create evidence_uploads table
- [x] Create chat_leads table
- [x] Add database initialization code

## Phase 3: AI Backend
- [x] Create OpenAI integration module
- [x] Build category detection logic (8 categories)
- [x] Create question generation for each category
- [x] Build case analysis logic
- [x] Implement professional + intelligent tone
- [x] Add compliance-safe language
- [x] Create file upload handler (local storage)

## Phase 4: Frontend Chat Interface
- [x] Create chat.html page
- [x] Build conversational UI (message bubbles)
- [x] Add loading indicators
- [x] Implement file upload interface
- [x] Create case summary display
- [x] Add contact form
- [x] Style to match existing website design

## Phase 5: Backend API Routes
- [x] POST /api/chat/start - start new conversation
- [x] POST /api/chat/message - send message and get AI response
- [x] POST /api/chat/upload - upload evidence files
- [x] POST /api/chat/analyze - generate case analysis
- [x] POST /api/chat/submit - submit lead with contact info
- [x] GET /api/chat/conversation/:id - retrieve conversation

## Phase 6: Admin Dashboard Integration
- [ ] Add chat leads to existing admin dashboard
- [ ] Display full conversation history
- [ ] Show uploaded evidence files
- [ ] Add status tracking for chat leads

## Phase 7: Testing & Deployment
- [ ] Test full conversation flow
- [ ] Test all 8 case categories
- [ ] Test file uploads
- [ ] Test admin dashboard integration
- [ ] Push to GitHub
- [ ] Verify Render auto-deployment




## Phase 7: Fix Deployment Errors
- [x] Fix SQLAlchemy metadata reserved name error in Message model
- [x] Remove metadata field or rename it
- [x] Push fix to GitHub
- [ ] Verify deployment succeeds

