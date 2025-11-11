const express = require('express');
const router = express.Router();
const { getMyCases, getCaseById } = require('../controllers/casesController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/cases - Get all cases for current user
router.get('/', authenticateToken, getMyCases);

// GET /api/cases/:case_id - Get single case details
router.get('/:case_id', authenticateToken, getCaseById);

module.exports = router;
