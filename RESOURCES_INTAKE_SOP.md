# RESOURCES INTAKE SOP
## Standard Operating Procedure for /api/resources/submit Endpoint

**Last Updated:** February 9, 2026  
**Authority:** Chief Strategist  
**Status:** ✅ Fixed and Verified (Commit 2ba990d)

---

## 🎯 ENDPOINT DETAILS

**URL:** `POST https://turboresponsehq.ai/api/resources/submit`  
**Purpose:** Email-only resource request submission (no database storage)  
**Success Response:** `200 OK` with `{"ok":true,"message":"Resource request submitted successfully"}`

---

## 🔧 DEPENDENCIES

### Required Environment Variables
```
SENDGRID_API_KEY          (API key from SendGrid - must be clean, no spaces/newlines)
SENDGRID_FROM_EMAIL       (Sender email address)
ADMIN_EMAIL               (Recipient email address)
```

### SendGrid Configuration
- **Service:** SendGrid Mail API
- **Authentication:** Bearer token in Authorization header
- **Key Format:** Must start with `SG.` and contain no whitespace, newlines, or quotes

---

## ⚠️ KNOWN ISSUES & FIXES

### Issue: "Invalid character in header content [Authorization]"
**Root Cause:** SENDGRID_API_KEY env var contains hidden characters (newline, carriage return, extra spaces, or quotes)

**Permanent Fix (Commit 2ba990d):**
- Code now sanitizes the key with `.trim()` and regex before use
- Removes quotes, "Bearer " prefix, and all whitespace
- Aggressive fallback: removes ALL whitespace if key still has issues

**Safe Debug Logging:**
```
[SENDGRID INIT] Key present: true/false
[SENDGRID INIT] Key length: <number>
[SENDGRID INIT] Key starts with SG.: true/false
[SENDGRID INIT] Has whitespace: true/false
[SENDGRID INIT] Has newline: true/false
```

**Manual Fix (if needed):**
1. Render Dashboard → Backend Service → Environment
2. Delete SENDGRID_API_KEY value completely
3. Go to SendGrid → copy fresh API key (raw, no quotes)
4. Paste into Render (only the key, starting with `SG.`)
5. Manual Deploy → Clear build cache & deploy

---

## 📋 FORM FIELDS

### Required Fields
```
name          (string)     - Submitter name
email         (string)     - Submitter email
phone         (string)     - Submitter phone
location      (string)     - Submitter location
description   (string)     - Situation description
```

### Optional Fields
```
resources[]   (array)      - Resources requested (housing, legal, etc.)
income        (string)     - Income level (under_30k, 30k_50k, etc.)
household     (string)     - Household size
demographics[] (array)     - Demographics (veteran, elderly, etc.)
```

---

## 📧 EMAIL BEHAVIOR

**When form is submitted:**
1. Validates all required fields
2. Formats data into HTML + text email
3. Sends to `ADMIN_EMAIL` from `SENDGRID_FROM_EMAIL`
4. Returns 200 OK to client
5. Logs success: `[RESOURCES API] Email sent successfully to: [email]`

**Email includes:**
- Contact information
- Resources requested
- Household information
- Situation description
- Submission timestamp (EST)
- Next steps for admin

---

## 🧪 VERIFICATION CHECKLIST

Before deploying any changes to this endpoint:

- [ ] Code change made and committed
- [ ] Render deploy triggered with "Clear build cache"
- [ ] Check Render logs for `[SENDGRID INIT]` messages
- [ ] Verify: `Has whitespace: false` and `Has newline: false`
- [ ] Test with curl or form submission
- [ ] Verify: Response is `200 OK` with `{"ok":true,...}`
- [ ] Verify: Email received in admin inbox

---

## 🚨 FAILURE PROTOCOL

**If endpoint returns 500:**

1. **Check Render Logs** for:
   - `[SENDGRID INIT]` messages (key configuration)
   - `[RESOURCES API]` messages (submission processing)
   - Error details

2. **Common causes:**
   - `Has whitespace: true` → Re-paste SendGrid key in Render
   - `Key present: false` → SENDGRID_API_KEY not set in Render
   - `Key starts with SG.: false` → Invalid key format
   - `Invalid character in header` → Key has hidden characters (code sanitizing should fix)

3. **If still failing:**
   - Check SendGrid API key is valid (test in SendGrid dashboard)
   - Check ADMIN_EMAIL and SENDGRID_FROM_EMAIL are set
   - Check Render network connectivity to SendGrid

---

## 📊 SUCCESS CRITERIA

Endpoint is working correctly when:

1. Form submission returns `HTTP 200`
2. Response body contains `"ok":true`
3. Email is received in admin inbox within 30 seconds
4. Render logs show no errors
5. `[SENDGRID INIT]` logs show clean key (no whitespace, no newlines)

---

## 📝 DEPLOYMENT LOG

### Commit 2ba990d (Feb 9, 2026)
- **Change:** Added permanent SendGrid key sanitizing + safe debug logging
- **Status:** ✅ Verified working (200 OK, email sent)
- **Test:** curl POST with test data → 200 OK response
- **Logs:** `[SENDGRID INIT] Key present: true, Has whitespace: false, Has newline: false`

---

**Remember:** This endpoint has no database — it only sends emails. All data is ephemeral. The form is working correctly as of Feb 9, 2026.
