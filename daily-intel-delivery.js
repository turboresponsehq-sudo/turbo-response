#!/usr/bin/env node

/**
 * Daily Intel Delivery - Consumer Defense Intelligence
 * 
 * Purpose: Send daily intel email with consumer defense updates
 * Focus: FTC, CFPB, Federal Register enforcement and rule changes
 * 
 * Stop Rule: Only send if there are actionable updates
 * 
 * Runs: 6:30am ET daily via GitHub Actions (after scanner completes)
 */

const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');

// Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const TO_EMAIL = 'Turboresponsehq@gmail.com';
const FROM_EMAIL = 'Turboresponsehq@gmail.com';
const FROM_NAME = 'Turbo Response Intel';

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
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
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

    // Check if Stop Rule applies (no actionable updates)
    const isStopRule = reportMarkdown.includes('**Status:** No actionable updates today');

    if (isStopRule) {
      console.log('[Stop Rule] No actionable updates today - skipping email');
      console.log('Email will only be sent when there are actionable consumer defense updates');
      process.exit(0);
    }

    // Extract actionable count from report
    const actionableMatch = reportMarkdown.match(/\*\*Total Actionable Items:\*\* (\d+)/);
    const actionableCount = actionableMatch ? actionableMatch[1] : '0';

    // Generate email
    const subject = `⚠️ Daily Intel Report - ${actionableCount} Actionable Items - ${today}`;
    const htmlBody = markdownToHTML(reportMarkdown);
    const textBody = reportMarkdown;

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
