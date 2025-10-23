# Deploy Turbo Response to PythonAnywhere - Simple Guide

## What is PythonAnywhere?

PythonAnywhere is a hosting service designed for Python applications. It's perfect for non-developers because:
- ✅ No coding required
- ✅ Simple web interface
- ✅ Upload files through your browser
- ✅ Free tier available to test
- ✅ $5/month for production

---

## Step-by-Step Deployment (15 minutes)

### Step 1: Create PythonAnywhere Account (2 minutes)

1. Go to https://www.pythonanywhere.com
2. Click "Pricing & signup"
3. Choose "Create a Beginner account" (FREE to start)
4. Fill in:
   - Username: Choose something like `turboresponse` or your name
   - Email: Your email address
   - Password: Create a strong password
5. Click "Register"
6. Check your email and verify your account

### Step 2: Upload Your Files (5 minutes)

1. **Login to PythonAnywhere**
   - Go to https://www.pythonanywhere.com
   - Click "Log in" and enter your credentials

2. **Go to Files Section**
   - Click "Files" in the top menu
   - You'll see a file browser

3. **Upload the Zip File**
   - Click "Upload a file" button
   - Select `turbo-response-pythonanywhere.zip` (I've prepared this for you)
   - Wait for upload to complete

4. **Extract the Zip File**
   - In the file browser, you'll see `turbo-response-pythonanywhere.zip`
   - Open a Bash console (click "Consoles" → "Bash")
   - Type this command:
     ```bash
     unzip turbo-response-pythonanywhere.zip
     cd turbo-response-backend
     ```

### Step 3: Install Dependencies (3 minutes)

In the same Bash console, type:

```bash
pip3 install --user -r requirements.txt
```

Wait for it to finish (you'll see "Successfully installed..." messages).

### Step 4: Create Web App (5 minutes)

1. **Go to Web Tab**
   - Click "Web" in the top menu
   - Click "Add a new web app"

2. **Configure Web App**
   - Click "Next" (accept the domain name like `yourusername.pythonanywhere.com`)
   - Select "Manual configuration"
   - Choose "Python 3.10" (or latest available)
   - Click "Next"

3. **Set Up WSGI File**
   - Scroll down to "Code" section
   - Click on the WSGI configuration file link (it will be something like `/var/www/yourusername_pythonanywhere_com_wsgi.py`)
   - **Delete everything** in that file
   - **Copy and paste this** (I've prepared it for you):

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/yourusername/turbo-response-backend'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

# Set environment variables
os.environ['FLASK_ENV'] = 'production'
os.environ['SECRET_KEY'] = 'change-this-to-random-string-later'
os.environ['DEBUG'] = 'False'

# Import Flask app
from src.main import app as application
```

   - **IMPORTANT:** Replace `yourusername` with your actual PythonAnywhere username
   - Click "Save"

4. **Set Working Directory**
   - Scroll up to "Code" section
   - Find "Working directory"
   - Enter: `/home/yourusername/turbo-response-backend`
   - Replace `yourusername` with your actual username

5. **Reload Web App**
   - Scroll to the top
   - Click the big green "Reload" button

### Step 5: Visit Your Live Site! 🎉

Your site is now live at:
**https://yourusername.pythonanywhere.com**

Replace `yourusername` with your actual PythonAnywhere username.

**Admin page:**
**https://yourusername.pythonanywhere.com/admin_ai.html**

**Admin login:**
- Username: `demarcus`
- Password: `crr2025admin`

---

## Upgrading to Paid Plan ($5/month)

The free tier is great for testing, but has limitations:
- Your app sleeps after inactivity
- Limited to one web app
- No custom domain

**To upgrade:**
1. Click "Account" in top menu
2. Click "Upgrade to paid account"
3. Choose "Hacker plan" ($5/month)
4. Benefits:
   - Always-on (no sleeping)
   - Custom domain support
   - More CPU time
   - Better support

---

## Adding a Custom Domain (After Upgrading)

1. **In PythonAnywhere:**
   - Go to "Web" tab
   - Scroll to "Setup a new domain"
   - Enter your domain: `turboresponse.com`
   - Click "Add"

2. **In Your Domain Registrar** (Namecheap, Google Domains, etc.):
   - Add a CNAME record:
     - **Name:** `www`
     - **Value:** `yourusername.pythonanywhere.com`
   - Add an A record:
     - **Name:** `@`
     - **Value:** (PythonAnywhere will show you the IP address)

3. **Wait for DNS** (can take up to 48 hours, usually 1-2 hours)

4. **Enable HTTPS:**
   - In PythonAnywhere Web tab
   - Click "Force HTTPS" toggle
   - Your site will be secure with SSL

---

## Troubleshooting

### Site shows "Something went wrong"
1. Go to "Web" tab
2. Click "Error log" link
3. Check what the error says
4. Common fix: Make sure you replaced `yourusername` in the WSGI file

### Files not uploading
- Free accounts have 512MB storage limit
- Your app is only 57KB, so this shouldn't be an issue
- Try uploading again or use smaller chunks

### Can't find the WSGI file
- Go to "Web" tab
- Look for "Code" section
- Click the blue link that says "WSGI configuration file"

### Dependencies won't install
- Make sure you're in the right directory: `cd turbo-response-backend`
- Try: `pip3 install --user Flask flask-cors Flask-SQLAlchemy`

---

## What's Included in Your Upload Package

I've prepared `turbo-response-pythonanywhere.zip` with:
- ✅ All HTML pages (landing, intake, admin, confirmation, legal)
- ✅ Flask application
- ✅ AI chatbot widget
- ✅ Automation system
- ✅ Database setup
- ✅ All configurations
- ✅ Requirements file

---

## After Deployment Checklist

Once your site is live:

### 1. Test Everything
- [ ] Visit the landing page
- [ ] Submit a test case through intake form
- [ ] Login to admin dashboard
- [ ] Test the chatbot
- [ ] Check all legal pages load

### 2. Configure Tracking (Optional)
- [ ] Add Meta Pixel ID
- [ ] Add TikTok Pixel ID
- [ ] Add reCAPTCHA keys
- See TRACKING_SETUP_GUIDE.md for instructions

### 3. Update Links
- [ ] Update social media URLs in footer
- [ ] Update contact email if needed

### 4. Set Up Email Notifications (Optional)
- [ ] Configure Gmail SMTP
- See AUTOMATION_SETUP_GUIDE.md for instructions

---

## Cost Summary

**Free Tier:**
- Cost: $0
- Good for: Testing, learning, low traffic
- Limitations: App sleeps after inactivity, no custom domain

**Hacker Plan:**
- Cost: $5/month
- Good for: Production, real business
- Benefits: Always on, custom domain, better performance

**Web Developer Plan:**
- Cost: $12/month
- Good for: High traffic
- Benefits: More CPU, more storage, priority support

---

## Getting Help

**PythonAnywhere Help:**
- Help pages: https://help.pythonanywhere.com
- Forums: https://www.pythonanywhere.com/forums/
- Email support: support@pythonanywhere.com (paid accounts get faster response)

**Your Platform Help:**
- All documentation is in the uploaded files
- AUTOMATION_SETUP_GUIDE.md - Email and integrations
- TRACKING_SETUP_GUIDE.md - Pixels and reCAPTCHA
- LAUNCH_CHECKLIST.md - Testing guide

---

## Quick Reference

**Your PythonAnywhere Dashboard:**
https://www.pythonanywhere.com/user/yourusername/

**Your Live Site:**
https://yourusername.pythonanywhere.com

**Admin Dashboard:**
https://yourusername.pythonanywhere.com/admin_ai.html

**Admin Credentials:**
- Username: `demarcus`
- Password: `crr2025admin`

**Support Email:**
TurboResponseHQ@gmail.com

---

## Next Steps After Deployment

1. **Test your site** - Go through the entire user flow
2. **Share with friends** - Get feedback on the design and functionality
3. **Add tracking codes** - Set up Meta Pixel and TikTok Pixel for marketing
4. **Get a custom domain** - Makes your site look more professional
5. **Start marketing** - Share on social media, tell potential clients

---

## You're Almost Live! 🚀

Follow the steps above and your Turbo Response platform will be live and helping consumers in about 15 minutes!

**Remember:**
- No coding required
- Just upload, configure, and go
- PythonAnywhere's interface is very beginner-friendly
- If you get stuck, their help docs are excellent

**Good luck with your launch!** 💪

