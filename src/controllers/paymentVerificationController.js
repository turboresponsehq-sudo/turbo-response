/**
 * Payment Verification Controller
 * Admin marks payment as verified and activates case
 */

const { query } = require('../db/client');
const logger = require('../utils/logger');

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

    // Update case to Active
    await query(
      `UPDATE cases
       SET funnel_stage = 'Active Case',
           payment_verified = true,
           payment_verified_at = CURRENT_TIMESTAMP,
           payment_verified_by = $1,
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
