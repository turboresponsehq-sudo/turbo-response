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

/**
 * Send business intake notification to admin
 * @param {Object} intakeData - Business intake information
 */
async function sendBusinessIntakeNotification(intakeData) {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn('Email transporter not available. Skipping business intake notification.');
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'collinsdemarcus4@gmail.com';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `🚀 New Business Audit Request: ${intakeData.business_name || intakeData.full_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4, #0284c7); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ New Business Audit Request</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Turbo Intake Submission</p>
        </div>

        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <h3 style="margin-top: 0; color: #0c4a6e;">Contact Information</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${intakeData.full_name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${intakeData.email}</p>
            ${intakeData.phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${intakeData.phone}</p>` : ''}
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #78350f;">Business Information</h3>
            ${intakeData.business_name ? `<p style="margin: 8px 0;"><strong>Business Name:</strong> ${intakeData.business_name}</p>` : ''}
            ${intakeData.website_url ? `<p style="margin: 8px 0;"><strong>Website:</strong> <a href="${intakeData.website_url}" style="color: #06b6d4;">${intakeData.website_url}</a></p>` : ''}
          </div>

          ${(intakeData.instagram_url || intakeData.tiktok_url || intakeData.facebook_url || intakeData.youtube_url || intakeData.link_in_bio) ? `
            <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a855f7;">
              <h3 style="margin-top: 0; color: #581c87;">Social Media</h3>
              ${intakeData.instagram_url ? `<p style="margin: 8px 0;"><strong>Instagram:</strong> <a href="${intakeData.instagram_url}" style="color: #06b6d4;">${intakeData.instagram_url}</a></p>` : ''}
              ${intakeData.tiktok_url ? `<p style="margin: 8px 0;"><strong>TikTok:</strong> <a href="${intakeData.tiktok_url}" style="color: #06b6d4;">${intakeData.tiktok_url}</a></p>` : ''}
              ${intakeData.facebook_url ? `<p style="margin: 8px 0;"><strong>Facebook:</strong> <a href="${intakeData.facebook_url}" style="color: #06b6d4;">${intakeData.facebook_url}</a></p>` : ''}
              ${intakeData.youtube_url ? `<p style="margin: 8px 0;"><strong>YouTube:</strong> <a href="${intakeData.youtube_url}" style="color: #06b6d4;">${intakeData.youtube_url}</a></p>` : ''}
              ${intakeData.link_in_bio ? `<p style="margin: 8px 0;"><strong>Link-in-Bio:</strong> <a href="${intakeData.link_in_bio}" style="color: #06b6d4;">${intakeData.link_in_bio}</a></p>` : ''}
            </div>
          ` : ''}

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #064e3b;">Business Snapshot</h3>
            ${intakeData.what_you_sell ? `
              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-weight: 600; color: #065f46;">What They Sell:</p>
                <p style="margin: 8px 0; white-space: pre-wrap;">${intakeData.what_you_sell}</p>
              </div>
            ` : ''}
            ${intakeData.ideal_customer ? `
              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-weight: 600; color: #065f46;">Ideal Customer:</p>
                <p style="margin: 8px 0; white-space: pre-wrap;">${intakeData.ideal_customer}</p>
              </div>
            ` : ''}
            ${intakeData.biggest_struggle ? `
              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-weight: 600; color: #065f46;">Biggest Struggle:</p>
                <p style="margin: 8px 0; white-space: pre-wrap;">${intakeData.biggest_struggle}</p>
              </div>
            ` : ''}
            ${intakeData.short_term_goal ? `
              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-weight: 600; color: #065f46;">Short-Term Goal:</p>
                <p style="margin: 8px 0; white-space: pre-wrap;">${intakeData.short_term_goal}</p>
              </div>
            ` : ''}
            ${intakeData.long_term_vision ? `
              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-weight: 600; color: #065f46;">Long-Term Vision:</p>
                <p style="margin: 8px 0; white-space: pre-wrap;">${intakeData.long_term_vision}</p>
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #06b6d4, #0284c7); border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 15px 0; color: white; font-weight: 600;">⚡ Action Required</p>
            <a href="https://turboresponsehq.ai/admin" 
               style="display: inline-block; padding: 14px 32px; background-color: white; color: #0284c7; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              View in Admin Dashboard
            </a>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-align: center;">
            <p>This is an automated notification from Turbo Response HQ.</p>
            <p>Intake ID: ${intakeData.id} | Submitted: ${new Date(intakeData.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    logger.info('Business intake notification email sent', {
      intakeId: intakeData.id,
      businessName: intakeData.business_name,
      to: adminEmail,
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send business intake notification email', {
      error: error.message,
      intakeId: intakeData.id,
    });
    return false;
  }
}

/**
 * Send business intake confirmation email to client
 * @param {Object} intakeData - Business intake information
 */
async function sendBusinessIntakeConfirmation(intakeData) {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn('Email transporter not available. Skipping business intake confirmation.');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: intakeData.email,
    subject: `✅ Business Audit Request Received - Turbo Response HQ`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4, #0284c7); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ Turbo Response HQ</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Business Growth Platform</p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Thank You, ${intakeData.full_name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your business audit request has been successfully submitted and is now under review by our growth team.
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <h3 style="margin-top: 0; color: #0f172a;">🚀 Your Business Information</h3>
            <p style="margin: 8px 0;"><strong>Business Name:</strong> ${intakeData.business_name || 'Not provided'}</p>
            <p style="margin: 8px 0;"><strong>Contact Email:</strong> ${intakeData.email}</p>
            ${intakeData.phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${intakeData.phone}</p>` : ''}
            ${intakeData.website_url ? `<p style="margin: 8px 0;"><strong>Website:</strong> <a href="${intakeData.website_url}" style="color: #06b6d4;">${intakeData.website_url}</a></p>` : ''}
          </div>

          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a;">📅 What Happens Next?</h3>
            <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
              <li><strong>Business Review</strong> - Our team will analyze your business within 24-48 hours</li>
              <li><strong>Growth Assessment</strong> - We'll identify opportunities to scale your revenue</li>
              <li><strong>Custom Strategy</strong> - You'll receive a tailored action plan and pricing</li>
              <li><strong>Follow-Up Call</strong> - We'll reach out to discuss next steps</li>
            </ol>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>💡 Pro Tip:</strong> Add ${process.env.EMAIL_USER} to your contacts to ensure you receive all updates about your business audit.</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Need Help?</strong></p>
            <p style="margin: 5px 0;">Email: ${process.env.EMAIL_USER}</p>
            <p style="margin: 5px 0;">Website: <a href="https://turboresponsehq.ai" style="color: #06b6d4;">turboresponsehq.ai</a></p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-align: center;">
            <p>This is an automated confirmation from Turbo Response HQ.</p>
            <p>Intake ID: ${intakeData.id} | Submitted: ${new Date(intakeData.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    logger.info('Business intake confirmation email sent', {
      intakeId: intakeData.id,
      to: intakeData.email,
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send business intake confirmation email', {
      error: error.message,
      intakeId: intakeData.id,
      email: intakeData.email,
    });
    return false;
  }
}

/**
 * Send notification to client when admin replies to their message
 * @param {Object} messageData - Message information
 */
async function sendClientMessageReplyNotification(messageData) {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn('Email transporter not available. Skipping client message notification.');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: messageData.client_email,
    subject: `💬 New Message from Turbo Response - Case ${messageData.case_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4, #0284c7); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ Turbo Response HQ</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">New Message from Your Case Manager</p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${messageData.client_name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your case manager has sent you a new message regarding your case.
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <h3 style="margin-top: 0; color: #0f172a;">📋 Case: ${messageData.case_number}</h3>
            <p style="margin: 8px 0;"><strong>Message Preview:</strong></p>
            <p style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; color: #334155; font-style: italic;">
              ${messageData.message_preview}
            </p>
          </div>

          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #475569; margin-bottom: 15px;">Login to your client portal to read the full message and reply:</p>
            <a href="https://turboresponsehq.ai/client/login" 
               style="display: inline-block; padding: 15px 30px; background-color: #06b6d4; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Message in Portal
            </a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;"><strong>⚡ Quick Login Instructions:</strong></p>
            <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
              <li>Visit <a href="https://turboresponsehq.ai/client/login" style="color: #0284c7;">turboresponsehq.ai/client/login</a></li>
              <li>Enter your email: <strong>${messageData.client_email}</strong></li>
              <li>Enter your case number: <strong>${messageData.case_number}</strong></li>
              <li>Check your email for the verification code</li>
            </ol>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-align: center;">
            <p>This is an automated notification from Turbo Response HQ.</p>
            <p>Case: ${messageData.case_number} | ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    logger.info('Client message reply notification sent', {
      caseId: messageData.case_id,
      to: messageData.client_email,
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send client message reply notification', {
      error: error.message,
      caseId: messageData.case_id,
      email: messageData.client_email,
    });
    return false;
  }
}

/**
 * Send notification to client when case status is updated
 * @param {Object} statusData - Status update information
 */
async function sendClientStatusUpdateNotification(statusData) {
  const transport = getTransporter();
  
  if (!transport) {
    logger.warn('Email transporter not available. Skipping client status notification.');
    return false;
  }

  // Status emoji mapping
  const statusEmoji = {
    'Pending Review': '📋',
    'Under Investigation': '🔍',
    'Action Required': '⚠️',
    'In Progress': '⚙️',
    'Resolved': '✅',
    'Closed': '🔒',
    'Lead Submitted': '📝',
    'Awaiting Payment': '💳',
    'Payment Pending': '⏳',
    'Active Case': '✅'
  };

  const emoji = statusEmoji[statusData.new_status] || '📌';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: statusData.client_email,
    subject: `${emoji} Case Status Update - ${statusData.case_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4, #0284c7); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ Turbo Response HQ</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Case Status Update</p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${statusData.client_name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your case status has been updated.
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <h3 style="margin-top: 0; color: #0f172a;">📋 Case: ${statusData.case_number}</h3>
            <p style="margin: 8px 0;"><strong>Previous Status:</strong> <span style="color: #64748b;">${statusData.old_status || 'N/A'}</span></p>
            <p style="margin: 8px 0;"><strong>New Status:</strong> <span style="color: #06b6d4; font-size: 18px; font-weight: bold;">${emoji} ${statusData.new_status}</span></p>
          </div>

          ${statusData.notes ? `
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">📝 Update Notes:</h3>
              <p style="color: #92400e; white-space: pre-wrap;">${statusData.notes}</p>
            </div>
          ` : ''}

          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #475569; margin-bottom: 15px;">View full case details and communicate with your case manager:</p>
            <a href="https://turboresponsehq.ai/client/login" 
               style="display: inline-block; padding: 15px 30px; background-color: #06b6d4; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Access Client Portal
            </a>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-align: center;">
            <p>This is an automated notification from Turbo Response HQ.</p>
            <p>Case: ${statusData.case_number} | Updated: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    logger.info('Client status update notification sent', {
      caseId: statusData.case_id,
      to: statusData.client_email,
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send client status update notification', {
      error: error.message,
      caseId: statusData.case_id,
      email: statusData.client_email,
    });
    return false;
  }
}

module.exports = {
  sendEmail,
  sendNewCaseNotification,
  sendPaymentConfirmationNotification,
  sendClientCaseConfirmation,
  sendBusinessIntakeNotification,
  sendBusinessIntakeConfirmation,
  sendClientMessageReplyNotification,
  sendClientStatusUpdateNotification,
};
