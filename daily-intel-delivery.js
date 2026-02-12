#!/usr/bin/env node

/**
 * Daily Intel Delivery - Consumer Defense Intelligence
 * 
 * Purpose: Send daily intel email with consumer defense updates
 * Focus: FTC, CFPB, Federal Register enforcement and rule changes
 * 
 * Configuration: ALWAYS_SEND_DAILY_EMAIL (default: true)
 *   - true: Send email every day, even if 0 actionable items
 *   - false: Only send when there are actionable updates
 * 
 * Runs: 6:00am ET daily via GitHub Actions (after scanner completes)
 */

const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');

// Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const TO_EMAIL = 'Turboresponsehq@gmail.com';
const FROM_EMAIL = 'Turboresponsehq@gmail.com';
const FROM_NAME = 'Turbo Response Intel';

// NEW: Configurable flag (default: true = always send)
const ALWAYS_SEND_DAILY_EMAIL = process.env.ALWAYS_SEND_DAILY_EMAIL !== 'false';

const REPORT_DIR = path.join(__dirname, 'docs', 'intel-reports');

// Initialize SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

// Utility: Send email via SendGrid SDK
async function sendEmail(to, subject, htmlBody, textBody) {
  const msg = {
    to: to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: subject,
    text: textBody,
    html: htmlBody
  };
  
  try {
    console.log('[EMAIL_SEND_ATTEMPT] Calling SendGrid API...');
    const response = await sgMail.send(msg);
    
    // Extract message ID from SendGrid response
    const messageId = response[0]?.headers?.['x-message-id'] || 'n/a';
    const statusCode = response[0]?.statusCode || 'n/a';
    
    console.log(`[SENDGRID_RESULT] status=${statusCode} message_id=${messageId}`);
    
    return { success: true, messageId, statusCode };
  } catch (error) {
    console.error(`[SENDGRID_RESULT] status=error message_id=n/a error="${error.message}"`);
    throw new Error(`SendGrid error: ${error.message}`);
  }
}

// Convert markdown report to HTML email
function markdownToHTML(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^# (.*$)/gm, '<h1 style="color: #1a1a1a; font-size: 24px; margin: 20px 0 10px 0;">$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2 style="color: #2c3e50; font-size: 20px; margin: 15px 0 10px 0;">$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3 style="color: #34495e; font-size: 18px; margin: 10px 0 5px 0;">$1</h3>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3498db; text-decoration: none;">$1</a>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');
  
  // Horizontal rules
  html = html.replace(/---/g, '<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">');
  
  // Wrap in container
  html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    ${html}
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>Turbo Response - Consumer Defense Intelligence</p>
    <p>Automated daily monitoring of FTC, CFPB, and Federal Register</p>
  </div>
</body>
</html>
  `.trim();
  
  return html;
}

// Main execution
async function main() {
  console.log('=== Daily Intel Delivery - Consumer Defense Intelligence ===');
  console.log('Started at:', new Date().toISOString());
  console.log('');

  try {
    // Get today's report file
    const today = new Date().toISOString().split('T')[0];
    const reportPath = path.join(REPORT_DIR, `intel-${today}.md`);

    // Check if report exists
    if (!fs.existsSync(reportPath)) {
      console.log(`[Report] No report found for ${today} at ${reportPath}`);
      console.log('Exiting - no report to send');
      process.exit(0);
    }

    // Read report
    const reportMarkdown = fs.readFileSync(reportPath, 'utf8');
    console.log('[Report] Loaded report from:', reportPath);

    // Check if there are actionable updates
    const isNoUpdates = reportMarkdown.includes('**Status:** No actionable updates today');
    
    // Extract actionable count from report
    const actionableMatch = reportMarkdown.match(/\*\*Total Actionable Items:\*\* (\d+)/);
    const actionableCount = actionableMatch ? actionableMatch[1] : '0';

    // NEW: Decision logging
    console.log(`[EMAIL_DECISION] always_send=${ALWAYS_SEND_DAILY_EMAIL} actionable_count=${actionableCount}`);

    // NEW: Conditional logic based on ALWAYS_SEND_DAILY_EMAIL flag
    if (!ALWAYS_SEND_DAILY_EMAIL && isNoUpdates) {
      console.log('[Skip Rule] No actionable updates today - skipping email (ALWAYS_SEND_DAILY_EMAIL=false)');
      console.log('Email will only be sent when there are actionable consumer defense updates');
      process.exit(0);
    }

    // Generate email subject and body
    let subject, htmlBody, textBody;

    if (isNoUpdates || actionableCount === '0') {
      // NEW: Email template for "0 updates" days
      subject = `Daily Intel Report — No actionable updates — ${today}`;
      
      const noUpdatesReport = `
# Daily Intel Report — ${today}

**Status:** System ran successfully

**Actionable Items Found:** 0

---

## Summary

The daily intelligence scanner successfully completed its monitoring of:
- Federal Trade Commission (FTC) enforcement actions
- Consumer Financial Protection Bureau (CFPB) updates
- Federal Register consumer protection rules

**No actionable consumer defense updates were found today.**

---

## Report Details

Full report available at: \`docs/intel-reports/intel-${today}.md\`

${reportMarkdown}

---

*This is an automated daily report. You will receive this email every day, even when there are no actionable items, to confirm the system is working correctly.*
      `.trim();
      
      htmlBody = markdownToHTML(noUpdatesReport);
      textBody = noUpdatesReport;
    } else {
      // Standard email for days with actionable updates
      subject = `⚠️ Daily Intel Report - ${actionableCount} Actionable Items - ${today}`;
      htmlBody = markdownToHTML(reportMarkdown);
      textBody = reportMarkdown;
    }

    // Send email
    console.log('[Email] Sending to', TO_EMAIL + '...');
    console.log('[Email] Subject:', subject);

    await sendEmail(TO_EMAIL, subject, htmlBody, textBody);

    console.log('[Email] ✅ Sent successfully!');
    console.log('');
    console.log('=== Delivery Complete ===');
    process.exit(0);

  } catch (error) {
    console.error('[Email] ❌ Failed to send:', error.message);
    process.exit(1);
  }
}

// Run
main();
