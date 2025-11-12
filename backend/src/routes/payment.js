const express = require('express');
const router = express.Router();
const db = require('../services/database/db');

/**
 * Client Payment Confirmation
 * POST /api/payment/confirm
 * 
 * Called when client clicks "I've Completed Payment" button
 * Updates case status to "payment_pending" and creates admin notification
 */
router.post('/confirm', async (req, res) => {
  try {
    const { case_id, payment_method } = req.body;

    if (!case_id) {
      return res.status(400).json({ error: 'case_id is required' });
    }

    // Update case status to payment_pending
    const updateQuery = `
      UPDATE cases 
      SET payment_status = 'payment_pending',
          payment_method = $1,
          payment_confirmed_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(updateQuery, [payment_method || 'manual', case_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseData = result.rows[0];

    // Create admin notification
    const notificationQuery = `
      INSERT INTO admin_notifications (
        case_id,
        notification_type,
        message,
        is_read
      ) VALUES ($1, $2, $3, $4)
    `;

    await db.query(notificationQuery, [
      case_id,
      'payment_confirmation',
      `Payment confirmation received for Case #${case_id} (${caseData.name || 'Unknown Client'}) via ${payment_method || 'manual payment'}`,
      false
    ]);

    res.json({
      success: true,
      message: 'Payment confirmation received',
      case: {
        id: caseData.id,
        status: caseData.payment_status,
        payment_method: caseData.payment_method
      }
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      details: error.message 
    });
  }
});

/**
 * Admin Payment Verification
 * PUT /api/payment/verify/:case_id
 * 
 * Called by admin to mark payment as verified or not paid
 * Body: { status: "paid" | "unpaid", verified_by: admin_id }
 */
router.put('/verify/:case_id', async (req, res) => {
  try {
    const { case_id } = req.params;
    const { status, verified_by } = req.body;

    if (!status || !['paid', 'unpaid'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required (paid or unpaid)' });
    }

    const updateQuery = `
      UPDATE cases 
      SET payment_status = $1,
          payment_verified_by = $2,
          payment_verified_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await db.query(updateQuery, [status, verified_by || null, case_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Create admin notification
    const notificationQuery = `
      INSERT INTO admin_notifications (
        case_id,
        notification_type,
        message,
        is_read
      ) VALUES ($1, $2, $3, $4)
    `;

    await db.query(notificationQuery, [
      case_id,
      'payment_verification',
      `Payment ${status === 'paid' ? 'verified' : 'marked as not paid'} for Case #${case_id}`,
      false
    ]);

    res.json({
      success: true,
      message: `Payment status updated to ${status}`,
      case: result.rows[0]
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error.message 
    });
  }
});

/**
 * Get Payment Status
 * GET /api/payment/status/:case_id
 */
router.get('/status/:case_id', async (req, res) => {
  try {
    const { case_id } = req.params;

    const result = await db.query(
      `SELECT 
        id,
        payment_status,
        payment_method,
        payment_confirmed_at,
        payment_verified_at,
        payment_verified_by
      FROM cases 
      WHERE id = $1`,
      [case_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({
      success: true,
      payment: result.rows[0]
    });

  } catch (error) {
    console.error('Payment status fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment status',
      details: error.message 
    });
  }
});

module.exports = router;
