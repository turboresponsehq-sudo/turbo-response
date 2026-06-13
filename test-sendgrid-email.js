#!/usr/bin/env node

/**
 * SendGrid Email Delivery Test Script
 * 
 * Purpose: Verify SendGrid API key works and emails are delivered
 * Run in Render shell where SENDGRID_API_KEY is configured
 * 
 * Usage: node test-sendgrid-email.js
 */

const sgMail = require('@sendgrid/mail');

// Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const TO_EMAIL = 'Turboresponsehq@gmail.com';
const FROM_EMAIL = 'Turboresponsehq@gmail.com';
const FROM_NAME = 'Turbo Response Intel - TEST';

console.log('=== SendGrid Email Delivery Test ===');
console.log('Timestamp:', new Date().toISOString());
console.log('');

// Validate API key exists
if (!SENDGRID_API_KEY) {
  console.error('❌ ERROR: SENDGRID_API_KEY environment variable not set');
  console.error('');
  console.error('To fix:');
  console.error('1. Verify SENDGRID_API_KEY is set in Render environment variables');
  console.error('2. Restart the Render service');
  console.error('3. Run this script again');
  process.exit(1);
}

console.log('✅ SENDGRID_API_KEY found');
console.log('   Length:', SENDGRID_API_KEY.length, 'characters');
console.log('   Starts with:', SENDGRID_API_KEY.substring(0, 10) + '...');
console.log('');

// Initialize SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

// Prepare test email
const msg = {
  to: TO_EMAIL,
  from: {
    email: FROM_EMAIL,
    name: FROM_NAME
  },
  subject: '🧪 SendGrid Test Email - ' + new Date().toLocaleTimeString(),
  text: `This is a test email sent at ${new Date().toISOString()} to verify SendGrid integration is working correctly.`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #1a1a1a; font-size: 24px; margin: 20px 0 10px 0;">🧪 SendGrid Test Email</h1>
    
    <p style="color: #2c3e50; font-size: 16px;">This is a test email to verify SendGrid integration is working correctly.</p>
    
    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
      <h3 style="margin-top: 0; color: #2e7d32;">✅ Test Details</h3>
      <p style="margin: 8px 0;"><strong>Sent at:</strong> ${new Date().toISOString()}</p>
      <p style="margin: 8px 0;"><strong>From:</strong> ${FROM_EMAIL}</p>
      <p style="margin: 8px 0;"><strong>To:</strong> ${TO_EMAIL}</p>
      <p style="margin: 8px 0;"><strong>Purpose:</strong> Verify daily intel email delivery system</p>
    </div>
    
    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0; color: #856404;">⚠️ Next Steps</h3>
      <p style="margin: 8px 0;">If you received this email:</p>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>SendGrid API key is valid ✅</li>
        <li>Sender email is verified ✅</li>
        <li>Email delivery is working ✅</li>
        <li>Configure SENDGRID_API_KEY in GitHub repository secrets</li>
        <li>Daily intel emails will start arriving at 6:30 AM ET</li>
      </ol>
    </div>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>Turbo Response - SendGrid Integration Test</p>
  </div>
</body>
</html>
  `.trim()
};

console.log('📧 Sending test email...');
console.log('   To:', TO_EMAIL);
console.log('   From:', FROM_EMAIL);
console.log('   Subject:', msg.subject);
console.log('');

// Send email
sgMail
  .send(msg)
  .then((response) => {
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('');
    console.log('SendGrid Response:');
    console.log('   Status Code:', response[0].statusCode);
    console.log('   Status Message:', response[0].statusMessage || 'OK');
    console.log('');
    console.log('=== Next Steps ===');
    console.log('1. Check your email inbox: ' + TO_EMAIL);
    console.log('2. Check spam folder if not in inbox');
    console.log('3. If received, configure SENDGRID_API_KEY in GitHub repository secrets');
    console.log('   URL: https://github.com/turboresponsehq-sudo/turbo-response/settings/secrets/actions');
    console.log('');
    console.log('=== Test Complete ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ EMAIL FAILED TO SEND');
    console.error('');
    console.error('Error Details:');
    console.error('   Message:', error.message);
    
    if (error.response) {
      console.error('   Status Code:', error.response.statusCode);
      console.error('   Body:', JSON.stringify(error.response.body, null, 2));
    }
    
    console.error('');
    console.error('=== Common Issues ===');
    console.error('1. Invalid API Key:');
    console.error('   - Verify key in SendGrid dashboard');
    console.error('   - Check for typos in Render environment variables');
    console.error('   - Regenerate key if necessary');
    console.error('');
    console.error('2. Sender Not Verified:');
    console.error('   - Go to SendGrid dashboard → Settings → Sender Authentication');
    console.error('   - Verify ' + FROM_EMAIL);
    console.error('   - Complete domain authentication if using custom domain');
    console.error('');
    console.error('3. Rate Limit Exceeded:');
    console.error('   - Check SendGrid dashboard for usage limits');
    console.error('   - Wait and try again');
    console.error('');
    console.error('4. Account Suspended:');
    console.error('   - Check SendGrid dashboard for account status');
    console.error('   - Contact SendGrid support if needed');
    console.error('');
    console.error('=== Test Failed ===');
    process.exit(1);
  });
