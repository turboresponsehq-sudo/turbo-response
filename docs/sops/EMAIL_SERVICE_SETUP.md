# 📧 Email Service Configuration Guide

## 🎯 Purpose

Enable client portal verification codes and email notifications by configuring Gmail SMTP credentials in Render.

---

## ✅ What Was Fixed

**Added**: `sendEmail()` function to `src/services/emailService.js`

This function is used by:
- Client portal login (verification codes)
- Payment confirmation emails  
- Admin notifications

---

## 🔑 Required Environment Variables

Add these to your Render backend service:

### **1. EMAIL_USER**
- **Value**: Your Gmail address
- **Example**: `turboresponsehq@gmail.com`
- **Purpose**: Sender email address for all notifications

### **2. EMAIL_PASSWORD**
- **Value**: Gmail App Password (NOT your regular Gmail password)
- **Purpose**: Authentication for Gmail SMTP

### **3. ADMIN_EMAIL** (Optional)
- **Value**: Email to receive admin notifications
- **Default**: `collinsdemarcus4@gmail.com` (if not set)
- **Purpose**: Where to send new case and payment notifications

---

## 📝 How to Get Gmail App Password

### **Step 1: Enable 2-Factor Authentication**

1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the prompts to enable it

### **Step 2: Generate App Password**

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **Turbo Response Backend**
5. Click **Generate**
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
7. **Remove spaces** → Final format: `xxxxxxxxxxxxxxxx`

### **Step 3: Add to Render**

1. Go to: https://dashboard.render.com
2. Find your **backend service** (turbo-response-backend or similar)
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   ```
   Key: EMAIL_USER
   Value: turboresponsehq@gmail.com
   ```
6. Click **Add Environment Variable** again
7. Add:
   ```
   Key: EMAIL_PASSWORD
   Value: [paste 16-character app password here]
   ```
8. Click **Save Changes**
9. Render will automatically redeploy

---

## 🧪 Testing

### **Test 1: Client Portal Verification Code**

1. Go to: https://turboresponsehq.ai/client/login
2. Enter:
   - Email: `collinsdemarcus4@gmail.com`
   - Case ID: `TR-15111124-264`
3. Click "Send Verification Code"
4. **Expected**: 
   - ✅ Success message appears
   - ✅ Email arrives within 30 seconds
   - ✅ Email contains 6-digit code

### **Test 2: Check Render Logs**

1. Go to Render dashboard → Backend service → Logs
2. Look for:
   ```
   [EMAIL DEBUG] ✅ Email sent successfully
   ```
3. If you see:
   ```
   [EMAIL DEBUG] ⚠️ Email transporter not available
   ```
   → Environment variables not configured correctly

---

## 🔧 Troubleshooting

### **Issue**: "Failed to send verification code"

**Cause 1**: EMAIL_USER or EMAIL_PASSWORD not set
- **Solution**: Add environment variables in Render (see Step 3 above)

**Cause 2**: Using regular Gmail password instead of App Password
- **Solution**: Generate App Password (see Step 2 above)

**Cause 3**: 2FA not enabled on Gmail account
- **Solution**: Enable 2-Step Verification (see Step 1 above)

**Cause 4**: App Password has spaces
- **Solution**: Remove all spaces from the 16-character password

### **Issue**: Emails going to spam

**Solution**: 
1. Check spam folder
2. Mark as "Not Spam"
3. Add `turboresponsehq@gmail.com` to contacts

### **Issue**: "Invalid credentials" error in logs

**Solution**:
1. Regenerate App Password
2. Update EMAIL_PASSWORD in Render
3. Redeploy

---

## 📊 Email Templates

### **Verification Code Email**

```
Subject: Turbo Response - Verification Code for Case TR-XXXXX-XXX

Your verification code is: 123456

This code expires in 15 minutes.

If you didn't request this code, please ignore this email.
```

### **Payment Confirmation Email** (to admin)

```
Subject: 💰 Payment Confirmation: TR-XXXXX-XXX

Payment confirmation received for:
- Case Number: TR-XXXXX-XXX
- Client: John Doe
- Payment Method: Zelle
- Confirmed At: Nov 21, 2025 10:30 AM

Action Required: Verify payment in your Zelle account
```

---

## 🚀 Deployment Checklist

- [ ] Enable 2FA on Gmail account
- [ ] Generate Gmail App Password
- [ ] Add EMAIL_USER to Render environment
- [ ] Add EMAIL_PASSWORD to Render environment  
- [ ] Save changes (triggers auto-deploy)
- [ ] Wait 3-5 minutes for deployment
- [ ] Test verification code sending
- [ ] Check Render logs for success message
- [ ] Verify email arrives in inbox

---

## 📌 Security Notes

- **Never commit** EMAIL_USER or EMAIL_PASSWORD to Git
- **Use App Passwords** - they're safer than regular passwords
- **Rotate App Passwords** every 6 months
- **Monitor usage** in Gmail account activity

---

**Generated**: November 21, 2025  
**Service**: Gmail SMTP via nodemailer  
**Port**: 465 (SSL) or 587 (TLS)  
**Agent**: Manus AI
