# 

# 

# URBO RESPONSE HQ - CHIEF'S REFERENCE REPORT

**Date:** January 26, 2025**Status:** PRODUCTION READY ✅**Last Updated:** 4:45 PM EST

---

## 🔐 CRITICAL CREDENTIALS

### Admin Dashboard Access

- **URL:** [https://turboresponsehq.ai/admin/login](https://turboresponsehq.ai/admin/login)

- **Email:** [turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com)

- **Password:** Turbo1234!

- **Works on:** Desktop, iPhone, Samsung Android (Samsung Internet browser )

### Database Access (TiDB Cloud)

- **Host:** gateway01.us-west-2.prod.aws.tidbcloud.com

- **Port:** 4000

- **Database:** turbo_response

- **Username:** 3hSvFqsVvbRBqVz.root

- **Password:** [Stored in Render Environment Variables]

- **Connection String:** Available in Render dashboard under DATABASE_URL

### Email Service (Gmail SMTP)

- **Service Email:** [turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com)

- **SMTP User:** [turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com)

- **SMTP Password:** [App Password stored in Render as EMAIL_PASSWORD]

- **Used for:** Admin notifications, client notifications, case confirmations

### GitHub Repository

- **URL:** [https://github.com/turboresponsehq-sudo/turbo-response](https://github.com/turboresponsehq-sudo/turbo-response)

- **Branch:** main

- **Owner:** turboresponsehq-sudo

- **Auto-deploys to:** Render on every push

### Render Deployment

- **Service:** turbo-response-live

- **URL:** [https://turboresponsehq.ai](https://turboresponsehq.ai)

- **Auto-deploy:** Enabled (deploys from GitHub main branch )

- **Deploy time:** 2-3 minutes after push

---

## 📋 SYSTEM ARCHITECTURE

### Technology Stack

- **Frontend:** React 19 (client portal, admin dashboard)

- **Backend:** Node.js + Express 4

- **Database:** TiDB Cloud (MySQL-compatible)

- **File Storage:** AWS S3 (via Render integration)

- **Email:** Nodemailer + Gmail SMTP

- **Hosting:** Render.com

- **Version Control:** GitHub

### Key Components

#### 1. Client Portal (Consumer & Business)

- **Consumer Login:** [https://turboresponsehq.ai/client/login](https://turboresponsehq.ai/client/login)

- **Business Login:** [https://turboresponsehq.ai/business/login](https://turboresponsehq.ai/business/login)

- **Authentication:** Email + Case Number → 6-digit verification code

- **Features:**
  - View case details and status
  - Send/receive messages with admin
  - Upload documents (PDF, JPG, PNG, HEIC )
  - Download uploaded documents
  - Track case progress

#### 2. Admin Dashboard

- **URL:** [https://turboresponsehq.ai/admin/login](https://turboresponsehq.ai/admin/login)

- **Authentication:** Email + Password (bcrypt hashed )

- **Features:**
  - View all cases (consumer + business)
  - Case detail pages with full information
  - Messaging system (send/receive messages with clients)
  - Document gallery with thumbnails
  - Status updates (triggers email notifications)
  - Brain upload system (AI knowledge base)
  - Unread message counters

#### 3. Email Notification System

**Admin Notifications (to you):**

- New case submission

- New document upload

- Payment confirmation

**Client Notifications (to clients):**

- Case submission confirmation

- Admin message reply (NEW - Jan 26)

- Case status update (NEW - Jan 26)

- All emails include portal login links and instructions

#### 4. Database Schema

**Main Tables:**

- `cases` - Consumer cases

- `business_intakes` - Business cases

- `case_messages` - Messaging between admin and clients

- `users` - Admin accounts (email/password auth)

- `verification_codes` - Client login codes

**Document Storage:**

- Documents stored in AWS S3

- Metadata (URL, filename, type) stored in `cases.documents` JSON field

- Thumbnails auto-generated for images

---

## 🚀 HOW EVERYTHING WORKS

### Client Submits a Case

1. Client fills out form at [https://turboresponsehq.ai](https://turboresponsehq.ai)

1. Case saved to database with unique case number (e.g., TR-1234567890 )

1. Admin receives email notification

1. Client receives confirmation email with case number and portal link

### Client Logs Into Portal

1. Client enters email + case number

1. System generates 6-digit verification code

1. Code sent to client's email

1. Client enters code → authenticated for 24 hours

1. Can view case, send messages, upload documents

### Admin Manages Cases

1. Login at /admin/login with email/password

1. View all cases in dashboard

1. Click case to see details

1. Reply to messages → **Client gets email notification**

1. Update status → **Client gets email notification**

1. View/download documents in gallery

### Document Upload Flow

1. Client uploads document via portal

1. File sent to backend API

1. Backend uploads to S3 storage

1. S3 URL saved to database

1. **Admin receives email notification**

1. Document appears in admin gallery with thumbnail

### Email Notification Triggers

**To Admin:**

- New case submitted

- Client uploads document

- Client sends message

**To Client:**

- Case submitted (confirmation)

- Admin replies to message (NEW)

- Admin updates case status (NEW)

---

## 🔧 MAINTENANCE & TROUBLESHOOTING

### Admin Password Reset

The admin password is automatically set/reset on every server restart via the seed script:

**Location:** `/src/services/database/seed.js`

```javascript
const adminEmail = 'turboresponsehq@gmail.com';
const adminPassword = 'Turbo1234!';
```

**To change password:**

1. Edit `seed.js` line 15

1. Commit and push to GitHub

1. Render auto-deploys (2-3 minutes)

1. Server restarts and updates password hash

**Current password:** Turbo1234!

### If Admin Login Fails

1. Check password is exactly: `Turbo1234!` (capital T, exclamation at end)

1. Check email is: `turboresponsehq@gmail.com`

1. Check Render logs for seed script success message

1. If still failing, trigger manual Render redeploy to run seed script

### If Emails Not Sending

1. Check Render environment variables:
  - `EMAIL_USER` = [turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com)
  - `EMAIL_PASSWORD` = [Gmail App Password]
  - `ADMIN_EMAIL` = [collinsdemarcus4@gmail.com](mailto:collinsdemarcus4@gmail.com)

1. Check Gmail App Password is still valid

1. Check Render logs for email errors

1. Test by submitting a new case

### If Client Can't Login

1. Verify case exists in database

1. Check email matches case email exactly

1. Check case number format (TR-XXXXXXXXXX)

1. Check verification code email was sent

1. Code expires after 10 minutes - request new code

### If Documents Not Uploading

1. Check file size (max 10MB)

1. Check file type (PDF, JPG, PNG, HEIC only)

1. Check S3 credentials in Render environment

1. Check backend logs for upload errors

### If Android Issues

- **Verified working on:** Samsung Internet browser

- **Login credentials:** [turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com) / Turbo1234!

- **Debugging:** Console logs and mobile alerts added to AdminDashboard.tsx

---

## 📊 CURRENT STATUS (Jan 26, 2025)

### ✅ WORKING FEATURES

- Client portal login (consumer & business)

- File upload via "Upload Additional Document" button

- File upload via messaging paperclip button

- Business messaging

- Consumer messaging

- Admin dashboard case viewing (desktop, iPhone, Android)

- Document gallery with thumbnails

- Email notifications on document upload

- **Client notifications when admin replies (NEW)**

- **Client notifications when status updates (NEW)**

- Admin login on all devices

### 🚧 KNOWN LIMITATIONS

- No document categories/tags (deferred)

- No bulk case operations

- No advanced case filtering

- No internal admin notes (separate from client messages)

- No case activity timeline/history

### 🎯 RECOMMENDED NEXT FEATURES

1. **Case activity timeline** - Show all status changes, messages, documents with timestamps

1. **Admin internal notes** - Private notes visible only to admin

1. **Bulk status updates** - Update multiple cases at once

1. **Advanced filtering** - Filter by date range, status, category

1. **Client satisfaction survey** - Auto-send after case closed

---

## 🔄 DEPLOYMENT PROCESS

### Automatic Deployment (Recommended)

1. Make code changes locally or via Manus

1. Commit to GitHub: `git push github main`

1. Render detects push and auto-deploys

1. Wait 2-3 minutes for deployment

1. Check Render logs for success

1. Test changes on live site

### Manual Deployment (If Needed)

1. Go to Render dashboard

1. Select "turbo-response-live" service

1. Click "Manual Deploy" → "Deploy latest commit"

1. Wait for deployment to complete

### Rollback (If Something Breaks)

1. Go to Render dashboard

1. Click "Rollback" button

1. Select previous working deployment

1. Confirm rollback

---

## 📞 SUPPORT CONTACTS

### Technical Issues

- **Manus AI Support:** [https://help.manus.im](https://help.manus.im)

- **Render Support:** [https://render.com/docs](https://render.com/docs)

- **TiDB Support:** [https://tidbcloud.com/console](https://tidbcloud.com/console)

### Service Providers

- **Domain:** turboresponsehq.ai (managed via Render )

- **Email:** Gmail SMTP ([turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com))

- **Database:** TiDB Cloud (free tier)

- **Storage:** AWS S3 (via Render)

- **Hosting:** Render.com (free tier)

---

## 🔒 SECURITY NOTES

### Password Storage

- Admin passwords: bcrypt hashed (10 rounds)

- Client auth: 6-digit codes (10-minute expiration)

- JWT tokens: Not used (session-based auth)

### Environment Variables (Render)

**Critical secrets stored in Render:**

- `DATABASE_URL` - TiDB connection string

- `EMAIL_PASSWORD` - Gmail app password

- `ADMIN_EMAIL` - Your notification email

- `ADMIN_PASSWORD` - Admin login password (Turbo1234!)

- `JWT_SECRET` - Session signing key

- `AWS_ACCESS_KEY_ID` - S3 access

- `AWS_SECRET_ACCESS_KEY` - S3 secret

**Never commit these to GitHub!**

### Access Control

- Admin dashboard: Password protected

- Client portal: Email + case number + verification code

- Database: Restricted to Render IP addresses

- S3 storage: Public read, authenticated write

---

## 📝 CODE LOCATIONS

### Key Files

```
/src/controllers/
  - authController.js (admin login)
  - casesController.js (case management, status updates)
  - messagingController.js (client-admin messaging)

/src/services/
  - emailService.js (all email notifications)
  - database/seed.js (admin account creation)

/client/src/pages/
  - AdminDashboard.tsx (case list)
  - AdminConsumerCaseDetail.tsx (case detail page)
  - ConsumerPortal.tsx (client portal)
  - BusinessPortal.tsx (business portal)

/src/routes/
  - cases.js (case API endpoints)
  - messaging.js (messaging API endpoints)
  - auth.js (authentication endpoints)
```

### Important Configuration

- Database schema: `/src/services/database/schema.sql`

- Environment variables: Render dashboard (not in code)

- Email templates: `/src/services/emailService.js`

---

## ✅ VERIFICATION CHECKLIST

Before considering system "working":

**Admin Dashboard:**

- [ ] Can login with [turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com) / Turbo1234!

- [ ] Can see all cases in dashboard

- [ ] Can click case to view details

- [ ] Can send message to client

- [ ] Can update case status

- [ ] Can view/download documents

- [ ] Unread message counter shows correctly

**Client Portal:**

- [ ] Can login with email + case number

- [ ] Receives verification code email

- [ ] Can view case details

- [ ] Can send message to admin

- [ ] Can upload document

- [ ] Can download existing documents

**Email Notifications:**

- [ ] Admin receives email on new case

- [ ] Admin receives email on document upload

- [ ] Client receives email on case submission

- [ ] Client receives email when admin replies (NEW)

- [ ] Client receives email on status update (NEW)

**Mobile Compatibility:**

- [ ] Admin dashboard works on iPhone

- [ ] Admin dashboard works on Android (Samsung Internet)

- [ ] Client portal works on mobile browsers

---

## 🎯 FINAL NOTES

### System Stability

- **Database:** TiDB Cloud free tier (5GB storage, sufficient for MVP)

- **Hosting:** Render free tier (sleeps after 15 min inactivity, wakes on request)

- **Email:** Gmail free tier (500 emails/day limit)

- **Storage:** S3 via Render (generous free tier)

### Performance

- **Cold start:** 30-60 seconds if server sleeping

- **Warm response:** < 1 second

- **File upload:** Depends on file size and connection

- **Email delivery:** 1-5 seconds

### Backup Strategy

- **Code:** GitHub (all commits preserved)

- **Database:** TiDB automatic backups (7 days)

- **Documents:** S3 (permanent storage)

- **Checkpoints:** Manus saves project snapshots

### Next Session Checklist

1. Open [https://turboresponsehq.ai/admin/login](https://turboresponsehq.ai/admin/login)

1. Login with [turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com) / Turbo1234!

1. Verify dashboard loads and shows cases

1. Test one message reply to verify client notification

1. Test one status update to verify client notification

1. Check email inbox for any error notifications

---

## 📌 QUICK REFERENCE

**Admin Login:** [https://turboresponsehq.ai/admin/login](https://turboresponsehq.ai/admin/login)**Email:** [turboresponsehq@gmail.com](mailto:turboresponsehq@gmail.com)**Password:** Turbo1234!

**GitHub:** [https://github.com/turboresponsehq-sudo/turbo-response](https://github.com/turboresponsehq-sudo/turbo-response)**Render:** [https://dashboard.render.com](https://dashboard.render.com)**TiDB:** [https://tidbcloud.com/console](https://tidbcloud.com/console)

**Support:** [https://help.manus.im](https://help.manus.im)

---

**END OF REPORT**

*This document should be kept secure and updated whenever major changes are made to the system.*

