/**
 * Payment Verification Controller
 * Admin marks payment as verified and activates case
 */

const { query } = require('../services/database/db');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

/**
 * PATCH /api/case/:id/verify-payment
 * Admin marks payment as verified
 * - Updates funnel_stage to "Active Case"
 * - Sets payment_verified = true
 * - Records verification timestamp and admin ID
 * - Creates timeline event
 * - Triggers client account creation (Phase 4)
 */
async function verifyPayment(req, res) {
  try {
    const caseId = parseInt(req.params.id);
    const adminId = req.user?.id || null; // From auth middleware (optional)

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID'
      });
    }

    // Get current case data
    const caseResult = await query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    const caseData = caseResult.rows[0];

    // Check if already verified
    if (caseData.payment_verified) {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified'
      });
    }

    // Update case to Active and enable portal
    await query(
      `UPDATE cases
       SET funnel_stage = 'Active Case',
           payment_verified = true,
           payment_verified_at = CURRENT_TIMESTAMP,
           payment_verified_by = $1,
           portal_enabled = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [adminId, caseId]
    );

    // Create timeline event
    await query(
      `INSERT INTO case_timeline (case_id, event_type, description, created_by, metadata)
       VALUES ($1, 'payment_verified', 'Admin verified payment - case activated', $2, $3)`,
      [caseId, adminId, JSON.stringify({ verified_by: adminId })]
    );

    logger.info('Payment verified by admin', {
      caseId,
      adminId: adminId || 'unknown',
      funnel_stage: 'Active Case'
    });

    // Send portal activation email to client
    try {
      const loginUrl = `${process.env.FRONTEND_URL || 'https://turboresponsehq.ai'}/client/login?caseId=${caseId}&email=${encodeURIComponent(caseData.email)}`;
      
      await emailService.sendEmail({
        to: caseData.email,
        subject: `🎉 Your Turbo Response Portal is Now Active - Case ${caseData.case_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">⚡</div>
              <h1 style="color: #06b6d4; margin: 0; font-size: 28px;">Portal Activated!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e293b; margin-top: 0;">Your Case is Now Active</h2>
              <p style="color: #64748b; line-height: 1.6;">
                Great news! Your payment has been verified and your client portal is now active. You can now access your case details, documents, and updates.
              </p>
              
              <div style="background: #f0f9ff; border: 2px solid #06b6d4; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #0284c7; font-weight: 600;">Case Number:</p>
                <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 18px; font-weight: 700;">${caseData.case_number}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 700; font-size: 16px;">Access Your Portal →</a>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin-top: 20px;">
                <p style="margin: 0; color: #78350f; font-size: 14px;">
                  <strong>📧 How to log in:</strong><br>
                  1. Click the button above<br>
                  2. Enter your email: <strong>${caseData.email}</strong><br>
                  3. Enter your case ID: <strong>${caseId}</strong><br>
                  4. Check your email for the 6-digit verification code
                </p>
              </div>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px;">
              <p>Need help? Reply to this email or contact us at support@turboresponsehq.ai</p>
            </div>
          </div>
        `
      });
      
      logger.info('Portal activation email sent', {
        caseId,
        email: caseData.email
      });
    } catch (emailError) {
      logger.error('Failed to send portal activation email', {
        error: emailError.message,
        caseId,
        email: caseData.email
      });
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      case: {
        id: caseId,
        funnel_stage: 'Active Case',
        payment_verified: true
      }
    });
  } catch (error) {
    logger.error('Failed to verify payment', {
      error: error.message,
      caseId: req.params.id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
}

module.exports = {
  verifyPayment
};
