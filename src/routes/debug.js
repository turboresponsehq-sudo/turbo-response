const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');

// GET /api/debug/cases/:email - Check cases for an email
router.get('/debug/cases/:email', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, case_number, full_name, email, category, created_at FROM cases WHERE email = $1 ORDER BY id DESC',
      [req.params.email]
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      cases: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
