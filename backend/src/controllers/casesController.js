const { query } = require('../services/database/db');
const logger = require('../utils/logger');

// Get all cases for current user
const getMyCases = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, case_number, category, status, payment_status, payment_plan,
              blueprint_generated, created_at, updated_at
       FROM cases
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      cases: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    next(error);
  }
};

// Get single case details
const getCaseById = async (req, res, next) => {
  try {
    const { case_id } = req.params;

    const result = await query(
      `SELECT * FROM cases
       WHERE id = $1 AND user_id = $2`,
      [case_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ case: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCases,
  getCaseById
};
