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
    logger.warn('Email transporter not available. Skipping notification.');
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'turboresponsehq@gmail.com';

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
    await transport.sendMail(mailOptions);
    logger.info('New case notification email sent', {
      caseId: caseData.id,
      caseNumber: caseData.case_number,
      to: adminEmail,
    });
    return true;
  } catch (error) {
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

  const adminEmail = process.env.ADMIN_EMAIL || 'turboresponsehq@gmail.com';

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

module.exports = {
  sendNewCaseNotification,
  sendPaymentConfirmationNotification,
};
