# Turbo Response HQ - Project TODO

## Conversational AI Chatbot Implementation

### Phase 1: Database Schema
- [x] Create conversations table (id, userId, status, category, createdAt, updatedAt)
- [x] Create messages table (id, conversationId, role, content, timestamp)
- [x] Create evidence_uploads table (id, conversationId, fileUrl, fileKey, mimeType, uploadedAt)
- [x] Create leads table (id, conversationId, name, email, phone, bestTimeToCall, status, createdAt)
- [x] Add category enum (debt_collection, eviction, credit_errors, unemployment, bank_issues, etc.)
- [x] Run database migration with pnpm db:push

### Phase 2: Backend API (tRPC Procedures)
- [x] Create chat.startConversation procedure (returns conversationId)
- [x] Create chat.sendMessage procedure (user message → AI response with follow-up questions)
- [x] Create chat.uploadEvidence procedure (handles file uploads to S3)
- [x] Create chat.getConversation procedure (retrieves full conversation history)
- [x] Create chat.submitLead procedure (captures contact info and notifies owner)
- [x] Create admin.getLeads procedure (for viewing submitted leads)
- [x] Create admin.getConversations procedure (for viewing all conversations)

### Phase 3: AI Analysis Logic
- [x] Create LLM helper for initial story analysis (categorize case type)
- [x] Create LLM helper for generating follow-up questions (5-7 targeted questions)
- [x] Create LLM helper for analyzing uploaded evidence (extract key details)
- [x] Create LLM helper for generating compelling case summary)
- [x] Create LLM helper for identifying potential issues and inconsistencies
- [x] Add category-specific question templates (debt, eviction, credit, unemployment, etc.)
- [x] Implement compliance-safe language (no legal advice, use "may", "potential", etc.)

### Phase 4: Frontend Chat Interface
- [x] Create ChatInterface component (conversational UI that feels like texting)
- [x] Create MessageBubble component (user vs AI message styling)
- [x] Create TypingIndicator component (shows AI is "thinking")
- [x] Create FileUpload component (drag & drop for evidence, max 5 files)
- [x] Create ContactForm component (name, email, phone, best time to call)
- [x] Create ProgressTracker component (shows conversation stage)
- [x] Add route in App.tsx for /chat page)
- [x] Implement auto-scroll to latest message
- [x] Add message timestamps

### Phase 5: Conversation Flow Logic
- [x] Step 1: User tells initial story (free-form text input)
- [x] Step 2: AI analyzes story and asks 5-7 follow-up questions
- [x] Step 3: User answers questions (one at a time or all at once)
- [x] Step 4: AI requests evidence upload (up to 5 documents)
- [x] Step 5: AI analyzes everything and shows compelling summary
- [x] Step 6: AI presents "hook" with potential issues and options
- [x] Step 7: User clicks "Yes, I Want Help" → contact form appears
- [x] Step 8: User submits contact info → confirmation message + owner notification

### Phase 6: File Upload & Storage
- [x] Implement S3 upload for evidence files (images, PDFs, screenshots)
- [x] Add file size validation (max 16MB per file)
- [x] Add file type validation (images, PDFs, documents)
- [x] Store file metadata in evidence_uploads table
- [x] Generate secure file keys with random suffixes
- [x] Return public URLs for uploaded files

### Phase 7: Owner Notifications
- [x] Send email notification when lead submits contact info
- [x] Include conversation summary in notification
- [x] Include uploaded evidence links in notification
- [x] Include lead contact details (name, email, phone, best time)
- [x] Use existing notifyOwner helper for in-app notifications

### Phase 8: Admin Dashboard
- [x] Create admin page to view all leads
- [x] Create admin page to view conversation details
- [x] Add filters (by category, status, date)
- [x] Add search functionality
- [x] Display evidence files in admin view
- [x] Add status update functionality (new, contacted, converted, closed)

### Phase 9: Testing & Polish
- [ ] Test complete conversation flow (story → questions → upload → summary → contact)
- [ ] Test file upload with various file types
- [ ] Test AI responses for all case categories
- [ ] Verify compliance-safe language (no legal advice)
- [ ] Test email notifications
- [ ] Test mobile responsiveness
- [ ] Add loading states and error handling
- [ ] Add empty states for admin dashboard

### Phase 10: Deployment
- [ ] Update userGuide.md with conversational AI feature
- [ ] Save checkpoint with description
- [ ] Test on production URL
- [ ] Verify all environment variables are set



### Phase 10: UX Improvements
- [x] Add visible "AI is thinking..." message with animated dots while waiting for response
- [x] Show loading spinner immediately when user clicks Send button
- [x] Disable input and buttons during AI processing to prevent double-submission




---

## Phase 3: Intelligence Upgrade - Case Management Enhancement

### Backend (tRPC Procedures)
- [x] Add updateCase procedure to admin router
- [x] Add addCaseNote procedure to admin router  
- [x] Add getCaseNotes procedure to admin router
- [x] Add getAnalytics procedure to admin router
- [ ] Modify analyzeCase to include notes and update history
- [x] Update database schema for notes and update_history fields

### Frontend (React Components)
- [x] Build EditCaseModal component
- [x] Build NotesModal component
- [x] Add search/filter bar to AdminWorkflow page
- [x] Enhance case cards with note count badges and last modified date
- [x] Build Analytics dashboard page (/analytics route)
- [x] Add analytics navigation link to AdminDashboard

### Testing & Deployment
- [x] Test edit case functionality
- [x] Test notes system
- [x] Test search and filter
- [x] Test analytics dashboard
- [x] Deploy to production
- [x] Save checkpointeployment checkpoint
- [ ] Verify on turboresponsehq.ai




---

## 2-Layer Audit System (Business Client Department)

### Layer 1: Manus Audit (COMPLETED ✅)
- [x] Turbo Intake form submission capability
- [x] Email notifications to admin
- [x] Manus generates raw audit analysis
- [x] Website analysis
- [x] Social media analysis
- [x] Report generation

### Layer 2: OpenAI Strategic Blueprint (NEW FEATURE)
- [ ] Request OPENAI_API_KEY secret from user
- [ ] Add OpenAI SDK to project dependencies
- [x] Create database schema for turbo_intake_submissions table
- [x] Create database schema for turbo_intake_reports table (Layer 1 + Layer 2)
- [x] Create tRPC router: turboIntake
- [x] Create tRPC endpoint: turboIntake.submitIntake (save client submission)
- [x] Create tRPC endpoint: turboIntake.generateAudit (Layer 1 - Manus analysis)
- [x] Create tRPC endpoint: turboIntake.generateBlueprint (Layer 2 - OpenAI strategic plan)
- [x] Create tRPC endpoint: turboIntake.getSubmissions (admin list view)
- [x] Create tRPC endpoint: turboIntake.getSubmissionDetails (view audit + blueprint)
- [ ] Create client-facing page: /turbo-intake (intake form)
- [x] Create admin page: /admin/turbo-intake (dashboard)
- [x] Add "Generate Audit" button (Layer 1)
- [x] Add "Generate Blueprint" button (Layer 2)
- [x] Display Layer 1 audit report in admin
- [x] Display Layer 2 strategic blueprint in admin
- [ ] Test complete 2-layer workflow end-to-end

### OpenAI Blueprint Requirements
The Layer 2 strategic blueprint must include:
- [ ] Funnel architecture design
- [ ] Website flow optimization plan
- [ ] Content and messaging map
- [ ] Automation blueprint
- [ ] Data-capture strategy
- [ ] AI agent recommendations
- [ ] Step-by-step execution plan (30/60/90 days)

