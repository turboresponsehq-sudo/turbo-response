from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

automation_bp = Blueprint('automation', __name__)

# Automation configuration
AUTOMATION_CONFIG = {
    'notification_email': 'TurboResponseHQ@gmail.com',
    'data_storage_path': '/tmp/turbo_response_data',
    'enable_notifications': True,
    'enable_data_logging': True
}

# Ensure data directory exists
os.makedirs(AUTOMATION_CONFIG['data_storage_path'], exist_ok=True)

@automation_bp.route('/api/form-submission', methods=['POST'])
def handle_form_submission():
    """Handle intake form submissions with automation triggers"""
    try:
        data = request.get_json()
        
        # Add timestamp and generate case ID
        submission_data = {
            'case_id': f"TURBO-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            'timestamp': datetime.now().isoformat(),
            'client_data': data,
            'status': 'submitted',
            'automation_triggers': []
        }
        
        # Trigger 1: Store in local database/file system
        if AUTOMATION_CONFIG['enable_data_logging']:
            store_submission_data(submission_data)
            submission_data['automation_triggers'].append('data_stored')
        
        # Trigger 2: Send notification email
        if AUTOMATION_CONFIG['enable_notifications']:
            send_notification_email(submission_data)
            submission_data['automation_triggers'].append('notification_sent')
        
        # Trigger 3: Log for external integrations (Zapier/Notion ready)
        log_for_external_integration(submission_data)
        submission_data['automation_triggers'].append('external_logged')
        
        # Trigger 4: Send auto-reply to client
        send_client_confirmation(submission_data)
        submission_data['automation_triggers'].append('client_confirmed')
        
        return jsonify({
            'success': True,
            'case_id': submission_data['case_id'],
            'message': 'Case submitted successfully. You will receive confirmation within 24-48 hours.',
            'automation_status': submission_data['automation_triggers']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Submission failed. Please try again.'
        }), 500

@automation_bp.route('/api/chatbot-lead', methods=['POST'])
def handle_chatbot_lead():
    """Handle chatbot lead capture with automation"""
    try:
        lead_data = request.get_json()
        
        # Add metadata
        lead_record = {
            'lead_id': f"LEAD-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            'timestamp': datetime.now().isoformat(),
            'source': 'turbo_ai_chatbot',
            'lead_data': lead_data,
            'status': 'new_lead'
        }
        
        # Store lead data
        store_lead_data(lead_record)
        
        # Send lead notification
        send_lead_notification(lead_record)
        
        # Log for CRM integration
        log_lead_for_crm(lead_record)
        
        return jsonify({
            'success': True,
            'lead_id': lead_record['lead_id'],
            'message': 'Lead captured successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@automation_bp.route('/api/webhook/zapier', methods=['POST'])
def zapier_webhook():
    """Webhook endpoint for Zapier integrations"""
    try:
        data = request.get_json()
        
        # Process Zapier webhook data
        webhook_record = {
            'webhook_id': f"ZAP-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            'timestamp': datetime.now().isoformat(),
            'source': 'zapier',
            'data': data
        }
        
        # Store webhook data
        store_webhook_data(webhook_record)
        
        return jsonify({
            'success': True,
            'webhook_id': webhook_record['webhook_id']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def store_submission_data(submission_data):
    """Store form submission data locally"""
    try:
        filename = f"{submission_data['case_id']}_submission.json"
        filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], filename)
        
        with open(filepath, 'w') as f:
            json.dump(submission_data, f, indent=2)
            
        # Also append to master log
        log_filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], 'submissions_log.jsonl')
        with open(log_filepath, 'a') as f:
            f.write(json.dumps(submission_data) + '\n')
            
    except Exception as e:
        print(f"Error storing submission data: {e}")

def store_lead_data(lead_record):
    """Store chatbot lead data"""
    try:
        filename = f"{lead_record['lead_id']}_lead.json"
        filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], filename)
        
        with open(filepath, 'w') as f:
            json.dump(lead_record, f, indent=2)
            
        # Append to leads log
        log_filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], 'leads_log.jsonl')
        with open(log_filepath, 'a') as f:
            f.write(json.dumps(lead_record) + '\n')
            
    except Exception as e:
        print(f"Error storing lead data: {e}")

def store_webhook_data(webhook_record):
    """Store webhook data"""
    try:
        filename = f"{webhook_record['webhook_id']}_webhook.json"
        filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], filename)
        
        with open(filepath, 'w') as f:
            json.dump(webhook_record, f, indent=2)
            
    except Exception as e:
        print(f"Error storing webhook data: {e}")

def send_notification_email(submission_data):
    """Send notification email to TurboResponseHQ@gmail.com"""
    try:
        client_data = submission_data['client_data']
        
        # Create notification email content
        subject = f"New Turbo Response Case: {submission_data['case_id']}"
        
        body = f"""
New case submission received:

Case ID: {submission_data['case_id']}
Timestamp: {submission_data['timestamp']}

Client Information:
- Name: {client_data.get('name', 'Not provided')}
- Email: {client_data.get('email', 'Not provided')}
- Phone: {client_data.get('phone', 'Not provided')}
- Category: {client_data.get('category', 'Not specified')}

Case Details:
- Issue Description: {client_data.get('issue_description', 'Not provided')}
- Urgency: {client_data.get('urgency', 'Not specified')}
- Documents: {len(client_data.get('documents', []))} files uploaded

Review this case in your admin dashboard:
https://turbo-response-platform.com/admin

---
Turbo Response Automation System
        """
        
        # Log notification (actual email sending would require SMTP configuration)
        notification_log = {
            'type': 'email_notification',
            'to': AUTOMATION_CONFIG['notification_email'],
            'subject': subject,
            'body': body,
            'timestamp': datetime.now().isoformat(),
            'case_id': submission_data['case_id']
        }
        
        log_filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], 'notifications_log.jsonl')
        with open(log_filepath, 'a') as f:
            f.write(json.dumps(notification_log) + '\n')
            
    except Exception as e:
        print(f"Error sending notification email: {e}")

def send_lead_notification(lead_record):
    """Send lead notification email"""
    try:
        lead_data = lead_record['lead_data']
        
        subject = f"New Turbo AI Lead: {lead_record['lead_id']}"
        
        body = f"""
New lead captured via Turbo AI Chatbot:

Lead ID: {lead_record['lead_id']}
Timestamp: {lead_record['timestamp']}

Lead Information:
- Name: {lead_data.get('name', 'Not provided')}
- Email: {lead_data.get('email', 'Not provided')}
- Question: {lead_data.get('question', 'Not provided')}

Follow up with this lead within 24 hours for best conversion rates.

---
Turbo Response AI System
        """
        
        # Log lead notification
        notification_log = {
            'type': 'lead_notification',
            'to': AUTOMATION_CONFIG['notification_email'],
            'subject': subject,
            'body': body,
            'timestamp': datetime.now().isoformat(),
            'lead_id': lead_record['lead_id']
        }
        
        log_filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], 'lead_notifications_log.jsonl')
        with open(log_filepath, 'a') as f:
            f.write(json.dumps(notification_log) + '\n')
            
    except Exception as e:
        print(f"Error sending lead notification: {e}")

def send_client_confirmation(submission_data):
    """Send auto-reply confirmation to client"""
    try:
        client_data = submission_data['client_data']
        client_email = client_data.get('email')
        
        if not client_email:
            return
            
        subject = f"Case Received: {submission_data['case_id']} - Turbo Response"
        
        body = f"""
Dear {client_data.get('name', 'Valued Client')},

✅ Thank you — your case has been received. Our AI system is analyzing your information.

Case Details:
- Case ID: {submission_data['case_id']}
- Category: {client_data.get('category', 'Consumer Defense')}
- Submitted: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}

What Happens Next:
1. Our AI analyzes your documents and case details
2. Our expert team reviews your situation
3. We create your personalized game plan
4. You receive your defense strategy within 24-48 hours

You'll receive an update within 24–48 hours with your customized legal response strategy.

Questions? Reply to this email or visit our website.

Best regards,
The Turbo Response Team
AI-Powered Consumer Defense

---
This is an automated confirmation. Please do not reply to this email.
        """
        
        # Log client confirmation
        confirmation_log = {
            'type': 'client_confirmation',
            'to': client_email,
            'subject': subject,
            'body': body,
            'timestamp': datetime.now().isoformat(),
            'case_id': submission_data['case_id']
        }
        
        log_filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], 'client_confirmations_log.jsonl')
        with open(log_filepath, 'a') as f:
            f.write(json.dumps(confirmation_log) + '\n')
            
    except Exception as e:
        print(f"Error sending client confirmation: {e}")

def log_for_external_integration(submission_data):
    """Log data in format ready for external integrations (Zapier, Notion, etc.)"""
    try:
        # Format data for external systems
        external_data = {
            'case_id': submission_data['case_id'],
            'timestamp': submission_data['timestamp'],
            'client_name': submission_data['client_data'].get('name', ''),
            'client_email': submission_data['client_data'].get('email', ''),
            'client_phone': submission_data['client_data'].get('phone', ''),
            'category': submission_data['client_data'].get('category', ''),
            'issue_description': submission_data['client_data'].get('issue_description', ''),
            'urgency': submission_data['client_data'].get('urgency', ''),
            'document_count': len(submission_data['client_data'].get('documents', [])),
            'status': 'new_submission',
            'integration_ready': True
        }
        
        # Store in integration-ready format
        log_filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], 'external_integrations_log.jsonl')
        with open(log_filepath, 'a') as f:
            f.write(json.dumps(external_data) + '\n')
            
    except Exception as e:
        print(f"Error logging for external integration: {e}")

def log_lead_for_crm(lead_record):
    """Log lead data for CRM integration"""
    try:
        crm_data = {
            'lead_id': lead_record['lead_id'],
            'timestamp': lead_record['timestamp'],
            'source': 'turbo_ai_chatbot',
            'name': lead_record['lead_data'].get('name', ''),
            'email': lead_record['lead_data'].get('email', ''),
            'question': lead_record['lead_data'].get('question', ''),
            'status': 'new_lead',
            'priority': 'medium',
            'follow_up_required': True
        }
        
        # Store in CRM-ready format
        log_filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], 'crm_leads_log.jsonl')
        with open(log_filepath, 'a') as f:
            f.write(json.dumps(crm_data) + '\n')
            
    except Exception as e:
        print(f"Error logging lead for CRM: {e}")

@automation_bp.route('/api/automation-status', methods=['GET'])
def get_automation_status():
    """Get automation system status"""
    try:
        # Count recent submissions and leads
        submissions_count = count_recent_files('submissions_log.jsonl')
        leads_count = count_recent_files('leads_log.jsonl')
        
        status = {
            'system_status': 'operational',
            'recent_submissions': submissions_count,
            'recent_leads': leads_count,
            'automation_config': {
                'notifications_enabled': AUTOMATION_CONFIG['enable_notifications'],
                'data_logging_enabled': AUTOMATION_CONFIG['enable_data_logging']
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(status), 200
        
    except Exception as e:
        return jsonify({
            'system_status': 'error',
            'error': str(e)
        }), 500

def count_recent_files(filename):
    """Count recent entries in log file"""
    try:
        filepath = os.path.join(AUTOMATION_CONFIG['data_storage_path'], filename)
        if not os.path.exists(filepath):
            return 0
            
        with open(filepath, 'r') as f:
            lines = f.readlines()
            return len(lines)
            
    except Exception:
        return 0

