/**
 * Payment Controller
 * Handles public payment page and "I Paid" workflow
 */

const { query } = require('../services/database/client');
const logger = require('../utils/logger');

/**
 * GET /api/case/:caseId/payment-info
 * Public endpoint - returns basic case info for payment page
 */
async function getPaymentInfo(req, res) {
  try {
    const caseId = parseInt(req.params.caseId);

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID'
      });
    }

    const result = await query(
      `SELECT id, case_number, full_name, email, category, amount, funnel_stage
       FROM cases
       WHERE id = $1`,
      [caseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    const caseData = result.rows[0];

    // Don't show payment page if already paid
    if (caseData.funnel_stage === 'Active Case') {
      return res.status(400).json({
        success: false,
        message: 'This case has already been activated'
      });
    }

    res.json({
      success: true,
      case: caseData
    });
  } catch (error) {
    logger.error('Failed to get payment info', {
      error: error.message,
      caseId: req.params.caseId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to load payment information'
    });
  }
}

/**
 * POST /api/case/:caseId/mark-payment-pending
 * Client clicks "I Paid" - updates status to Payment Pending
 */
async function markPaymentPending(req, res) {
  try {
    const caseId = parseInt(req.params.caseId);
    const { payment_method } = req.body;

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID'
      });
    }

    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Update case funnel stage and payment method
    await query(
      `UPDATE cases
       SET funnel_stage = 'Payment Pending',
           payment_method = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [payment_method, caseId]
    );

    // Create timeline event
    await query(
      `INSERT INTO case_timeline (case_id, event_type, description, metadata)
       VALUES ($1, 'payment_pending', 'Client clicked I Paid button', $2)`,
      [caseId, JSON.stringify({ payment_method })]
    );

    logger.info('Payment marked as pending', {
      caseId,
      payment_method
    });

    res.json({
      success: true,
      message: 'Payment confirmation received'
    });
  } catch (error) {
    logger.error('Failed to mark payment as pending', {
      error: error.message,
      caseId: req.params.caseId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to submit payment confirmation'
    });
  }
}

module.exports = {
  getPaymentInfo,
  markPaymentPending
};
