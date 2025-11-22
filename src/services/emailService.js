const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service for sending notifications
 * Uses Gmail SMTP or configured email provider
 */

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    logger.warn('Email credentials not configured. Email notifications disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
  });

  return transporter;
}

/**
 * Send new case notification to admin
 * @param {Object} caseData - Case information
 */
async function sendNewCaseNotification(caseData) {
  const transport = getTransporter();
  
  if (!transport) {
    console.log('[EMAIL DEBUG] ⚠️ Email transporter not available - missing EMAIL_USER or EMAIL_PASSWORD');
    logger.warn('Email transporter not available. Skipping notification.');
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'collinsdemarcus4@gmail.com';
  
  console.log('[EMAIL DEBUG] Preparing to send new case notification:', {
    to: adminEmail,
    caseId: caseData.id,
    caseNumber: caseData.case_number,
    category: caseData.category
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `🚨 New Case Submission: ${caseData.category} - ${caseData.full_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">New Case Submission</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Client Information</h3>
          <p><strong>Name:</strong> ${caseData.full_name}</p>
          <p><strong>Email:</strong> ${caseData.email}</p>
          ${caseData.phone ? `<p><strong>Phone:</strong> ${caseData.phone}</p>` : ''}
          ${caseData.address ? `<p><strong>Address:</strong> ${caseData.address}</p>` : ''}
        </div>

        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Case Details</h3>
          <p><strong>Case Number:</strong> ${caseData.case_number}</p>
          <p><strong>Category:</strong> ${caseData.category.toUpperCase()}</p>
          ${caseData.amount ? `<p><strong>Amount:</strong> $${caseData.amount}</p>` : ''}
          ${caseData.deadline ? `<p><strong>Deadline:</strong> ${caseData.deadline}</p>` : ''}
          <p><strong>Description:</strong></p>
          <p style="white-space: pre-wrap;">${caseData.case_details}</p>
        </div>

        ${caseData.documents && caseData.documents.length > 0 ? `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📎 Attachments</h3>
            <p>${caseData.documents.length} file(s) uploaded</p>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 20px; background-color: #d4edda; border-radius: 8px;">
          <p style="margin: 0;"><strong>Action Required:</strong></p>
          <p style="margin: 10px 0 0 0;">
            <a href="https://turboresponsehq.ai/admin" 
               style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px;">
              View in Admin Dashboard
            </a>
          </p>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
          <p>This is an automated notification from Turbo Response HQ.</p>
          <p>Case ID: ${caseData.id} | Submitted: ${new Date(caseData.created_at).toLocaleString()}</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log('[EMAIL DEBUG] ✅ Email sent successfully:', {
      messageId: info.messageId,
      to: adminEmail,
      caseId: caseData.id
    });
    logger.info('New case notification email sent', {
      caseId: caseData.id,
      caseNumber: caseData.case_number,
      to: adminEmail,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL DEBUG] ❌ Email failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      caseId: caseData.id
    });
    logger.error('Failed to send new case notification email', {
      error: error.message,
      caseId: caseData.id,
    });
    return false;
  }
}

/**
 * Send payment confirmation notification to admin
 * @param {Object} paymentData - Payment information
 */
async function sendPaymentConfirmationNotification(paymentData) {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn('Email transporter not available. Skipping notification.');
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'collinsdemarcus4@gmail.com';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `💰 Payment Confirmation: ${paymentData.case_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Payment Confirmation Received</h2>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Case Number:</strong> ${paymentData.case_number}</p>
          <p><strong>Client:</strong> ${paymentData.client_name}</p>
          <p><strong>Payment Method:</strong> ${paymentData.payment_method}</p>
          <p><strong>Confirmed At:</strong> ${new Date(paymentData.confirmed_at).toLocaleString()}</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 8px;">
          <p style="margin: 0;"><strong>⚠️ Action Required:</strong></p>
          <p style="margin: 10px 0 0 0;">Please verify the payment in your ${paymentData.payment_method} account and mark as verified in the admin dashboard.</p>
          <p style="margin: 10px 0 0 0;">
            <a href="https://turboresponsehq.ai/admin" 
               style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 6px;">
              Verify Payment
            </a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    logger.info('Payment confirmation notification email sent', {
      caseId: paymentData.case_id,
      to: adminEmail,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send payment confirmation notification email', {
      error: error.message,
      caseId: paymentData.case_id,
    });
    return false;
  }
}

/**
 * Generic send email function
 * @param {Object} options - Email options {to, subject, html, text}
 */
async function sendEmail(options) {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn('Email transporter not available. Skipping email.');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html || undefined,
    text: options.text || undefined,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send email', {
      error: error.message,
      to: options.to,
      subject: options.subject,
    });
    return false;
  }
}

/**
 * Send case confirmation email to client
 * @param {Object} caseData - Case information
 */
async function sendClientCaseConfirmation(caseData) {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn('Email transporter not available. Skipping client confirmation.');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: caseData.email,
    subject: `✅ Case Submitted Successfully - ${caseData.case_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4, #0284c7); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ Turbo Response HQ</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Consumer Defense Platform</p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Thank You, ${caseData.full_name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your case has been successfully submitted and is now under review by our legal team.
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <h3 style="margin-top: 0; color: #0f172a;">📋 Your Case Information</h3>
            <p style="margin: 8px 0;"><strong>Case Number:</strong> <span style="color: #06b6d4; font-size: 18px; font-weight: bold;">${caseData.case_number}</span></p>
            <p style="margin: 8px 0;"><strong>Category:</strong> ${caseData.category.charAt(0).toUpperCase() + caseData.category.slice(1)}</p>
            <p style="margin: 8px 0; color: #64748b; font-size: 14px;">⚠️ Save this case number - you'll need it to access your client portal</p>
          </div>

          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a;">🔐 Access Your Client Portal</h3>
            <p style="color: #475569; margin-bottom: 15px;">Track your case status, communicate with our team, and upload documents securely:</p>
            <a href="https://turboresponsehq.ai/client/login" 
               style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #06b6d4, #0284c7); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Access Client Portal →
            </a>
            <p style="color: #64748b; font-size: 14px; margin-top: 15px;">You'll need your email address and case number (${caseData.case_number}) to log in.</p>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a;">📅 What Happens Next?</h3>
            <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
              <li><strong>Case Review</strong> - Our team will analyze your case within 24-48 hours</li>
              <li><strong>AI Analysis</strong> - We'll run an AI-powered assessment to identify legal violations</li>
              <li><strong>Pricing & Strategy</strong> - You'll receive a customized action plan and pricing</li>
              <li><strong>Portal Access</strong> - Once enabled, you can access your portal to view updates</li>
            </ol>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>💡 Pro Tip:</strong> Add ${process.env.EMAIL_USER} to your contacts to ensure you receive all updates about your case.</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Need Help?</strong></p>
            <p style="margin: 5px 0;">Email: ${process.env.EMAIL_USER}</p>
            <p style="margin: 5px 0;">Website: <a href="https://turboresponsehq.ai" style="color: #06b6d4;">turboresponsehq.ai</a></p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-align: center;">
            <p>This is an automated confirmation from Turbo Response HQ.</p>
            <p>Case ID: ${caseData.id} | Submitted: ${new Date(caseData.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    logger.info('Client case confirmation email sent', {
      caseId: caseData.id,
      caseNumber: caseData.case_number,
      to: caseData.email,
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send client case confirmation email', {
      error: error.message,
      caseId: caseData.id,
      email: caseData.email,
    });
    return false;
  }
}

module.exports = {
  sendEmail,
  sendNewCaseNotification,
  sendPaymentConfirmationNotification,
  sendClientCaseConfirmation,
};
