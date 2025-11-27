# META TRACKING IMPLEMENTATION
**Date:** January 26, 2025  
**Status:** Production Ready ✅  
**Pixel ID:** 1355933342933181

---

## 📊 OVERVIEW

Turbo Response HQ has complete Meta tracking implementation with both browser-side Pixel and server-side Conversions API (CAPI) for maximum conversion attribution and ad optimization.

---

## 🎯 TRACKING METHODS

### 1. Meta Pixel (Browser-Side)
**Location:** `/client/index.html` (lines 17-33)  
**Tracks:** PageView events on all pages  
**Status:** ✅ Active and verified

### 2. Meta Conversions API (Server-Side)
**Location:** `/src/services/metaConversionsAPI.js`  
**Tracks:** Server-side conversion events  
**Status:** ✅ Active and verified (TEST74006)

---

## 📋 EVENT STRUCTURE

### Supported Events

#### 1. **intake_completed**
Fired when user completes case submission form

**Trigger:** `intakeController.js` line 171  
**User Data:**
- Email (SHA256 hashed)
- Phone (SHA256 hashed)
- First name (SHA256 hashed)
- Last name (SHA256 hashed)
- IP address
- User agent

**Custom Data:**
- case_number
- category
- case_id

---

#### 2. **case_created**
Fired after successful database insert

**Trigger:** `intakeController.js` line 191  
**User Data:**
- Email (SHA256 hashed)
- Phone (SHA256 hashed)
- First name (SHA256 hashed)
- Last name (SHA256 hashed)
- IP address
- User agent

**Custom Data:**
- case_number
- category
- case_id

---

#### 3. **business_signup**
Fired when business submits intake form

**Trigger:** `turboIntakeController.js` line 150  
**User Data:**
- Email (SHA256 hashed)
- Phone (SHA256 hashed)
- IP address
- User agent

**Custom Data:**
- business_name
- business_type

---

## 🔐 SECURITY & PRIVACY

### PII Hashing
All personally identifiable information (PII) is hashed using SHA256 before sending to Meta:
- Email addresses
- Phone numbers
- First names
- Last names
- City
- State
- Zip code

**Hashing Function:** `metaConversionsAPI.js` lines 25-30

### Data Normalization
Before hashing, all values are:
1. Converted to lowercase
2. Trimmed of whitespace
3. Phone numbers stripped of non-numeric characters

---

## ⚙️ CONFIGURATION

### Environment Variables (Render)
**Required:**
- `META_CAPI_ACCESS_TOKEN` - Meta Conversions API access token

**Location:** Render dashboard → turboresponsehq-staging → Environment

### Pixel Configuration
**Pixel ID:** 1355933342933181  
**API Version:** v21.0  
**Endpoint:** `https://graph.facebook.com/v21.0/1355933342933181/events`

---

## 🧪 TESTING

### Test Event Code
**Code:** TEST74006  
**Usage:** Add `test_event_code: 'TEST74006'` to payload root level

### Verification Steps
1. Submit test case at https://turboresponsehq.ai
2. Check Meta Events Manager → Test Events
3. Look for events with test code TEST74006
4. Verify event shows "Processed" status
5. Confirm user data matching (hashed email/phone)

### Test Results (Jan 26, 2025)
✅ **intake_completed** - Processed successfully  
✅ **Received From:** Server (CAPI)  
✅ **Setup Method:** Manual Setup  
✅ **Time:** 9:46:58 AM

---

## 📈 EVENT FLOW

### Consumer Case Submission
```
User submits case form
    ↓
intakeController.submit()
    ↓
Insert into database
    ↓
Send email notifications
    ↓
Track intake_completed (CAPI) ← Non-blocking
    ↓
Track case_created (CAPI) ← Non-blocking
    ↓
Return success response
```

### Business Intake Submission
```
Business submits intake form
    ↓
turboIntakeController.submit()
    ↓
Insert into database
    ↓
Send email notifications
    ↓
Track business_signup (CAPI) ← Non-blocking
    ↓
Return success response
```

---

## 🔧 CODE LOCATIONS

### Core Files
```
/client/index.html                        - Meta Pixel code (lines 17-33)
/src/services/metaConversionsAPI.js       - CAPI service (main implementation)
/src/controllers/intakeController.js      - Consumer intake tracking (lines 165-208)
/src/controllers/turboIntakeController.js - Business intake tracking (lines 149-160)
```

### Key Functions
```javascript
// CAPI Service
sendEvent(eventData)                  - Send event to Meta
trackIntakeCompleted(userData, caseData)
trackCaseCreated(userData, caseData)
trackBusinessSignup(businessData)
hashValue(value)                      - SHA256 hashing
```

---

## 📊 META EVENTS MANAGER

### Access
**URL:** https://business.facebook.com/events_manager2  
**Pixel:** Turbo Response Pixel (1355933342933181)

### Tabs
- **Overview:** Real-time event activity
- **Test Events:** Verify test events with test codes
- **Diagnostics:** Event quality and matching
- **History:** Historical event data
- **Settings:** Pixel configuration

---

## ✅ PRODUCTION CHECKLIST

- [x] Meta Pixel installed in HTML head
- [x] Pixel verified loading on all pages
- [x] CAPI service created and tested
- [x] Events integrated into backend endpoints
- [x] Access token stored in Render environment
- [x] PII hashing implemented (SHA256)
- [x] Non-blocking event tracking (catch errors)
- [x] Test events verified in Meta Events Manager
- [x] Production deployment complete
- [x] Documentation complete

---

## 🚀 DEPLOYMENT HISTORY

**Commit 4db098f** - Meta Pixel installation  
**Commit 7a802ec** - Meta Conversions API implementation  
**Deployed to:** turboresponsehq-staging on Render  
**Live URL:** https://turboresponsehq.ai

---

## 📞 SUPPORT

### Meta Resources
- **Events Manager:** https://business.facebook.com/events_manager2
- **CAPI Documentation:** https://developers.facebook.com/docs/marketing-api/conversions-api
- **Pixel Documentation:** https://developers.facebook.com/docs/meta-pixel

### Internal
- **Admin Dashboard:** https://turboresponsehq.ai/admin/login
- **GitHub Repository:** https://github.com/turboresponsehq-sudo/turbo-response
- **Render Dashboard:** https://dashboard.render.com

---

## 🔄 MAINTENANCE

### Updating Access Token
If access token expires:
1. Go to Meta Events Manager → Settings → Conversions API
2. Generate new access token
3. Update `META_CAPI_ACCESS_TOKEN` in Render environment
4. Render will auto-redeploy

### Adding New Events
1. Add tracking function to `metaConversionsAPI.js`
2. Call function in appropriate controller
3. Test with test event code
4. Verify in Meta Events Manager
5. Deploy to production

### Monitoring
- Check Meta Events Manager daily for event activity
- Monitor Render logs for CAPI errors
- Verify event matching quality in Diagnostics tab

---

**END OF DOCUMENTATION**

*Last Updated: January 26, 2025*
