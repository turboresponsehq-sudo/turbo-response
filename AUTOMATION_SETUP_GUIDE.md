# Turbo Response Automation Setup Guide

## Overview

Your Turbo Response platform has built-in automation workflows that trigger when clients submit intake forms or interact with the AI chatbot. This guide explains how to connect external services for maximum automation.

## Current Automation Features (Already Working)

### ✅ Local Data Storage
- All form submissions are automatically saved to `/tmp/turbo_response_data/`
- Each case gets a unique JSON file: `TURBO-YYYYMMDD-HHMMSS_submission.json`
- Master log file: `submissions_log.jsonl` (one case per line)
- Chatbot leads saved separately: `leads_log.jsonl`

### ✅ Email Notifications (Logged)
- System logs all email notifications to `notifications_log.jsonl`
- Emails are prepared but need SMTP configuration to actually send
- See "Email Setup" section below to enable actual sending

### ✅ Webhook Endpoints
- `/api/form-submission` - Handles intake form submissions
- `/api/chatbot-lead` - Captures chatbot leads
- `/api/webhook/zapier` - Receives Zapier webhook data

## Email Setup (Gmail SMTP)

To enable actual email sending (not just logging):

### Step 1: Generate Gmail App Password
1. Go to Google Account settings: https://myaccount.google.com/security
2. Enable 2-Factor Authentication if not already enabled
3. Go to "App passwords" section
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 2: Update automation.py

Edit `/home/ubuntu/turbo-response-backend/src/routes/automation.py` and add this function:

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_via_smtp(to_email, subject, body):
    """Actually send email via Gmail SMTP"""
    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = "TurboResponseHQ@gmail.com"
        sender_password = "YOUR_APP_PASSWORD_HERE"  # Replace with your app password
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False
```

### Step 3: Update notification functions

In `send_notification_email()` and `send_client_confirmation()`, add this line after creating the email body:

```python
# Actually send the email
send_email_via_smtp(
    to=AUTOMATION_CONFIG['notification_email'],  # or client_email
    subject=subject,
    body=body
)
```

## Notion Database Integration

### Step 1: Create Notion Database
1. Create a new database in Notion with these columns:
   - **Case ID** (Title)
   - **Client Name** (Text)
   - **Client Email** (Email)
   - **Phone** (Phone)
   - **Category** (Select)
   - **Status** (Select: Submitted, Under Review, Completed)
   - **Timestamp** (Date)
   - **Urgency** (Select: Low, Medium, High)
   - **Issue Description** (Text)
   - **Documents** (Number)

### Step 2: Get Notion API Key
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "Turbo Response Automation"
4. Copy the Internal Integration Token

### Step 3: Share Database with Integration
1. Open your Notion database
2. Click "..." menu → "Add connections"
3. Select "Turbo Response Automation"

### Step 4: Get Database ID
1. Open your database in Notion
2. Copy the URL - it looks like: `https://notion.so/workspace/DATABASE_ID?v=...`
3. The DATABASE_ID is the 32-character code between the last `/` and the `?`

### Step 5: Install Notion SDK

```bash
cd /home/ubuntu/turbo-response-backend
source venv/bin/activate
pip install notion-client
```

### Step 6: Add Notion Integration Code

Create `/home/ubuntu/turbo-response-backend/src/integrations/notion_sync.py`:

```python
from notion_client import Client
from datetime import datetime

NOTION_TOKEN = "YOUR_NOTION_INTEGRATION_TOKEN"
NOTION_DATABASE_ID = "YOUR_DATABASE_ID"

notion = Client(auth=NOTION_TOKEN)

def add_case_to_notion(submission_data):
    """Add a new case to Notion database"""
    try:
        client_data = submission_data['client_data']
        
        notion.pages.create(
            parent={"database_id": NOTION_DATABASE_ID},
            properties={
                "Case ID": {"title": [{"text": {"content": submission_data['case_id']}}]},
                "Client Name": {"rich_text": [{"text": {"content": client_data.get('name', 'N/A')}}]},
                "Client Email": {"email": client_data.get('email', '')},
                "Phone": {"phone_number": client_data.get('phone', '')},
                "Category": {"select": {"name": client_data.get('category', 'General')}},
                "Status": {"select": {"name": "Submitted"}},
                "Timestamp": {"date": {"start": submission_data['timestamp']}},
                "Urgency": {"select": {"name": client_data.get('urgency', 'Medium')}},
                "Issue Description": {"rich_text": [{"text": {"content": client_data.get('issue_description', '')[:2000]}}]},
                "Documents": {"number": len(client_data.get('documents', []))}
            }
        )
        return True
    except Exception as e:
        print(f"Notion sync error: {e}")
        return False
```

### Step 7: Update automation.py to call Notion

In `/home/ubuntu/turbo-response-backend/src/routes/automation.py`, add:

```python
from src.integrations.notion_sync import add_case_to_notion

# In handle_form_submission(), after storing data locally:
if AUTOMATION_CONFIG['enable_notion_sync']:
    add_case_to_notion(submission_data)
    submission_data['automation_triggers'].append('notion_synced')
```

## Google Drive Integration

### Step 1: Enable Google Drive API
1. Go to https://console.cloud.google.com/
2. Create a new project: "Turbo Response Automation"
3. Enable Google Drive API
4. Create credentials → Service Account
5. Download JSON key file

### Step 2: Share Drive Folder
1. Create a folder in Google Drive: "Turbo Response Cases"
2. Share it with the service account email (from JSON file)
3. Give it "Editor" permissions
4. Copy the folder ID from the URL

### Step 3: Install Google Drive SDK

```bash
cd /home/ubuntu/turbo-response-backend
source venv/bin/activate
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### Step 4: Add Google Drive Integration Code

Create `/home/ubuntu/turbo-response-backend/src/integrations/gdrive_sync.py`:

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import json

SERVICE_ACCOUNT_FILE = '/path/to/your/service-account-key.json'
FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID'

SCOPES = ['https://www.googleapis.com/auth/drive.file']
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
drive_service = build('drive', 'v3', credentials=credentials)

def upload_case_to_gdrive(submission_data, local_file_path):
    """Upload case JSON to Google Drive"""
    try:
        file_metadata = {
            'name': f"{submission_data['case_id']}_submission.json",
            'parents': [FOLDER_ID]
        }
        
        media = MediaFileUpload(local_file_path, mimetype='application/json')
        
        file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        
        return file.get('webViewLink')
    except Exception as e:
        print(f"Google Drive upload error: {e}")
        return None
```

## Zapier Integration (No-Code Alternative)

If you prefer not to code Notion/Google Drive integrations:

### Option 1: Zapier Webhook
1. Create a Zap in Zapier
2. Trigger: "Webhooks by Zapier" → "Catch Hook"
3. Copy the webhook URL
4. Update your intake form to also POST to this webhook URL
5. Actions: Add Notion row, Upload to Google Drive, Send email, etc.

### Option 2: Email Parsing
1. Set up email forwarding from TurboResponseHQ@gmail.com to Zapier Email Parser
2. Zapier parses the notification emails
3. Automatically creates Notion entries and uploads to Drive

## Testing Your Automation

### Test Form Submission
1. Submit a test case through the intake form
2. Check `/tmp/turbo_response_data/` for JSON files
3. Check `submissions_log.jsonl` for the entry
4. Check `notifications_log.jsonl` for email logs
5. If SMTP configured: Check TurboResponseHQ@gmail.com inbox
6. If Notion configured: Check your Notion database
7. If Google Drive configured: Check your Drive folder

### Test Chatbot Lead Capture
1. Open chatbot on any page
2. Provide name and email when prompted
3. Check `leads_log.jsonl` for the entry
4. Check `lead_notifications_log.jsonl` for notification

## Automation Checklist

- [ ] Email SMTP configured and tested
- [ ] Notion integration set up (optional)
- [ ] Google Drive integration set up (optional)
- [ ] Zapier webhooks configured (alternative)
- [ ] Test form submission end-to-end
- [ ] Test chatbot lead capture
- [ ] Verify all notifications are being sent
- [ ] Verify data is syncing to all platforms

## Support

For automation issues:
- Check logs in `/tmp/turbo_response_data/`
- Check Flask console output for errors
- Verify API keys and credentials are correct
- Test each integration independently before combining

## Security Notes

**IMPORTANT**: Never commit API keys or credentials to Git!

Store sensitive credentials in environment variables:

```bash
export NOTION_TOKEN="your_token_here"
export GMAIL_APP_PASSWORD="your_password_here"
export GDRIVE_SERVICE_ACCOUNT="/path/to/key.json"
```

Then reference them in your code:

```python
import os
NOTION_TOKEN = os.getenv('NOTION_TOKEN')
```

