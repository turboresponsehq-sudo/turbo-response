const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');
const logger = require('../utils/logger');

// GET /api/business-intakes - List all business intakes
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        id, full_name, email, phone, business_name, website_url,
        status, created_at
      FROM business_intakes
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      intakes: result.rows
    });
  } catch (error) {
    logger.error('Error fetching business intakes:', error);
    res.status(500).json({
      error: 'Failed to fetch business intakes',
      message: error.message
    });
  }
});

// GET /api/business-intakes/:id - Get single business intake
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT * FROM business_intakes WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Business intake not found'
      });
    }

    res.json({
      success: true,
      intake: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching business intake:', error);
    res.status(500).json({
      error: 'Failed to fetch business intake',
      message: error.message
    });
  }
});

// PATCH /api/business-intakes/:id/status - Update intake status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await query(`
      UPDATE business_intakes
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business intake not found' });
    }

    res.json({
      success: true,
      intake: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating business intake status:', error);
    res.status(500).json({
      error: 'Failed to update status',
      message: error.message
    });
  }
});

module.exports = router;
