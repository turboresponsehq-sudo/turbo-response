# Turbo Response HQ - User Guide

**Website:** Your deployment URL will appear here after publishing  
**Purpose:** AI-powered consumer advocacy platform that helps people fight debt collectors, evictions, credit errors, and other consumer rights issues by providing professional response documents.  
**Access:** Public access for chat interface, login required for admin dashboard

---

## Powered by Manus

**Technology Stack:**
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui components
- **Backend:** Node.js + Express + tRPC 11 for type-safe API calls
- **Database:** MySQL/TiDB with Drizzle ORM for data persistence
- **AI:** OpenAI GPT-4o for conversational analysis and case categorization
- **Storage:** AWS S3 for evidence file storage with CDN delivery
- **Authentication:** Manus OAuth for secure admin access
- **Deployment:** Auto-scaling infrastructure with global CDN and 99.9% uptime

This platform represents cutting-edge AI-powered legal technology, combining natural language processing with consumer advocacy expertise to deliver personalized document preparation at scale.

---

## Using Your Website

### For Clients (Public Access)

Your website provides a conversational AI experience that feels like texting with a knowledgeable advocate. Clients visit your homepage and click "Start Your Free Case Analysis" to begin.

**Step 1: Tell Your Story**  
The AI greets them warmly and asks them to describe their situation in their own words. They can type naturally, just like sending a text message. The AI analyzes their story and automatically categorizes it (debt collection, eviction, credit errors, unemployment, etc.).

**Step 2: Answer Questions**  
Based on their category, the AI asks 5-7 targeted follow-up questions to understand key details. Questions appear one at a time. They answer each question by typing in the text box and clicking "Submit Answer" or pressing Enter.

**Step 3: Upload Evidence**  
After answering questions, they're prompted to upload up to 5 files (photos, PDFs, screenshots) as evidence. They can drag and drop files or click "Choose Files" to browse. Each uploaded file shows a green checkmark. When ready, they click "Continue" to proceed.

**Step 4: Review Analysis**  
The AI analyzes everything and presents a compelling summary showing their situation, potential issues detected, any inconsistencies, and what they can do next. This creates the "aha moment" where they understand their options.

**Step 5: Request Help**  
A contact form appears asking for their name, email, phone, and best time to call. When they submit, they see a confirmation message that you'll contact them within 24 hours with pricing and next steps.

### For You (Admin Dashboard)

Sign in and visit "/admin" to access your lead management dashboard.

**View All Leads**  
The dashboard shows a table with all submitted leads including name, email, phone, case category, status, and creation date. Click the eye icon on any lead to view full conversation history and uploaded evidence files.

**Manage Lead Status**  
Use the dropdown in the "Status" column to update each lead's progress: "New" → "Contacted" → "Qualified" → "Converted" → "Closed". Status changes save automatically.

**Review Evidence**  
In the lead details dialog, scroll to "Evidence Files" and click "View" to open uploaded documents in a new tab. All files are stored securely in S3 with permanent URLs.

**Track Metrics**  
The top of the dashboard shows quick stats: total leads, new leads, contacted leads, and converted leads. Use these to monitor your conversion funnel.

---

## Managing Your Website

### Settings Panel

Access the Management UI (right panel or header icon) to configure your website.

**General Settings**  
Update your website name and logo by editing "VITE_APP_TITLE" and "VITE_APP_LOGO" environment variables. Changes apply immediately after server restart.

**Database Panel**  
View and edit your leads, conversations, messages, and evidence uploads directly. Use the CRUD interface to update records or export data. Database connection details are in the bottom-left settings menu.

**Domains Panel**  
Modify your auto-generated domain prefix (xxx.manus.space) or bind a custom domain for professional branding.

**Notifications Panel**  
Configure notification settings for the built-in notification API. You'll receive in-app notifications when new leads submit their information.

**Secrets Panel**  
View and edit existing environment variables safely. Never expose API keys or credentials in your code.

---

## Next Steps

**Talk to Manus AI anytime to request changes or add features.** You can customize the AI's questions, add new case categories, adjust the analysis logic, or modify the contact form fields.

**Start Marketing Your Platform**  
Share your chat URL (/chat) on social media, Nextdoor, community forums, or anywhere your target audience gathers. The conversational interface converts visitors into high-intent leads automatically.

**Test the Full Flow**  
Before going live, walk through the entire conversation yourself. Submit a test case, upload sample evidence, and verify you receive the notification with all details. This ensures everything works smoothly for real clients.

