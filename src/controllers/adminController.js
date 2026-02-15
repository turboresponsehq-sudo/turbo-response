const { query } = require('../services/database/db');
const logger = require('../utils/logger');

// Get all submissions (admin only)
const getAllSubmissions = async (req, res, next) => {
  try {
    const { status, payment_status, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT c.*, u.email as user_email, u.full_name as user_name
      FROM cases c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND c.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (payment_status) {
      queryText += ` AND c.payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    queryText += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    const countResult = await query('SELECT COUNT(*) as total FROM cases');
    const total = parseInt(countResult.rows[0].total);

    res.json({
      submissions: result.rows,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

// Get single submission details (admin only)
const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, u.email as user_email, u.full_name as user_name
       FROM cases c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update submission status (admin only)
const updateSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (payment_status) {
      updates.push(`payment_status = $${paramCount}`);
      params.push(payment_status);
      paramCount++;
      // Sync payment_verified with payment_status to prevent field drift
      if (payment_status === 'paid') {
        updates.push(`payment_verified = true`);
        updates.push(`payment_verified_at = NOW()`);
      } else {
        updates.push(`payment_verified = false`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(id);
    const queryText = `UPDATE cases SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Log admin action
    await query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'update_submission', 'case', id, JSON.stringify({ status, payment_status })]
    );

    logger.info('Submission updated by admin', {
      adminId: req.user.id,
      caseId: id,
      updates: { status, payment_status }
    });

    res.json({
      message: 'Submission updated successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete submission (admin only)
const deleteSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM cases WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Log admin action
    await query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'delete_submission', 'case', id]
    );

    logger.info('Submission deleted by admin', { adminId: req.user.id, caseId: id });

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get admin dashboard stats
const getStats = async (req, res, next) => {
  try {
    // Total cases
    const totalResult = await query('SELECT COUNT(*) as total FROM cases');
    const total = parseInt(totalResult.rows[0].total);

    // Cases by status
    const statusResult = await query(`
      SELECT status, COUNT(*) as count
      FROM cases
      GROUP BY status
    `);

    // Cases by payment status
    const paymentResult = await query(`
      SELECT payment_status, COUNT(*) as count
      FROM cases
      GROUP BY payment_status
    `);

    // Revenue
    const revenueResult = await query(`
      SELECT SUM(payment_amount) as total_revenue
      FROM cases
      WHERE payment_status = 'paid'
    `);

    // Recent cases
    const recentResult = await query(`
      SELECT id, case_number, category, status, created_at
      FROM cases
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      total_cases: total,
      cases_by_status: statusResult.rows,
      cases_by_payment: paymentResult.rows,
      total_revenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
      recent_cases: recentResult.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getStats
};
