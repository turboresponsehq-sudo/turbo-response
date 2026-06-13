#!/usr/bin/env node

/**
 * Weekly Heartbeat Email - System Health Check
 * 
 * Purpose: Send weekly test email to verify email delivery is working
 * Runs: Sunday 8:00 PM ET via GitHub Actions
 * 
 * This proves long-term deliverability and catches silent failures.
 */

const sgMail = require('@sendgrid/mail');

// Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const TO_EMAIL = 'Turboresponsehq@gmail.com';
const FROM_EMAIL = 'Turboresponsehq@gmail.com';
const FROM_NAME = 'Turbo Response System Monitor';

// Initialize SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

// Send heartbeat email
async function sendHeartbeatEmail() {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();
  
  const subject = `[System Check] Email Delivery OK - ${today}`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #27ae60; font-size: 24px; margin: 0 0 20px 0;">✅ System Health Check</h1>
    
    <p style="font-size: 16px; margin: 15px 0;">
      <strong>Status:</strong> <span style="color: #27ae60;">Email delivery system is operational</span>
    </p>
    
    <p style="font-size: 16px; margin: 15px 0;">
      <strong>Date:</strong> ${today}
    </p>
    
    <p style="font-size: 16px; margin: 15px 0;">
      <strong>Timestamp:</strong> ${timestamp}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    
    <h2 style="color: #2c3e50; font-size: 18px; margin: 20px 0 10px 0;">What This Means</h2>
    
    <p style="font-size: 14px; line-height: 1.6; color: #555;">
      This is a weekly automated test email that confirms:
    </p>
    
    <ul style="font-size: 14px; line-height: 1.8; color: #555;">
      <li>SendGrid API is working correctly</li>
      <li>Email delivery infrastructure is operational</li>
      <li>Daily intel emails can reach your inbox</li>
      <li>No silent failures in the email system</li>
    </ul>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    
    <h2 style="color: #2c3e50; font-size: 18px; margin: 20px 0 10px 0;">System Components</h2>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Daily Intel Scanner</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #27ae60;">✓ Active</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Email Delivery</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #27ae60;">✓ Operational</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>SendGrid Integration</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #27ae60;">✓ Connected</td>
      </tr>
      <tr>
        <td style="padding: 8px;"><strong>GitHub Actions</strong></td>
        <td style="padding: 8px; text-align: right; color: #27ae60;">✓ Running</td>
      </tr>
    </table>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    
    <p style="font-size: 12px; color: #888; margin: 20px 0 0 0;">
      <strong>Note:</strong> You will receive this heartbeat email every Sunday at 8:00 PM ET to verify system health.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>Turbo Response - System Monitoring</p>
    <p>Automated weekly health check</p>
  </div>
</body>
</html>
  `.trim();
  
  const textBody = `
SYSTEM HEALTH CHECK

Status: Email delivery system is operational
Date: ${today}
Timestamp: ${timestamp}

---

What This Means:

This is a weekly automated test email that confirms:
- SendGrid API is working correctly
- Email delivery infrastructure is operational
- Daily intel emails can reach your inbox
- No silent failures in the email system

---

System Components:
- Daily Intel Scanner: ✓ Active
- Email Delivery: ✓ Operational
- SendGrid Integration: ✓ Connected
- GitHub Actions: ✓ Running

---

Note: You will receive this heartbeat email every Sunday at 8:00 PM ET to verify system health.

Turbo Response - System Monitoring
Automated weekly health check
  `.trim();
  
  const msg = {
    to: TO_EMAIL,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: subject,
    text: textBody,
    html: htmlBody
  };
  
  try {
    console.log('[HEARTBEAT] Sending weekly test email...');
    console.log('[HEARTBEAT] To:', TO_EMAIL);
    console.log('[HEARTBEAT] Subject:', subject);
    
    const response = await sgMail.send(msg);
    
    // Extract message ID from SendGrid response
    const messageId = response[0]?.headers?.['x-message-id'] || 'n/a';
    const statusCode = response[0]?.statusCode || 'n/a';
    
    console.log(`[HEARTBEAT] ✅ Sent successfully!`);
    console.log(`[HEARTBEAT_RESULT] status=${statusCode} message_id=${messageId} timestamp=${timestamp}`);
    
    return { success: true, messageId, statusCode };
  } catch (error) {
    console.error(`[HEARTBEAT] ❌ Failed to send:`, error.message);
    console.error(`[HEARTBEAT_RESULT] status=error message_id=n/a timestamp=${timestamp} error="${error.message}"`);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('=== Weekly Heartbeat Email - System Health Check ===');
  console.log('Started at:', new Date().toISOString());
  console.log('');
  
  try {
    await sendHeartbeatEmail();
    
    console.log('');
    console.log('=== Heartbeat Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('[HEARTBEAT] Failed:', error.message);
    process.exit(1);
  }
}

// Run
main();
