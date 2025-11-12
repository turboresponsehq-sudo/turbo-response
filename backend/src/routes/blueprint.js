const express = require('express');
const router = express.Router();
const { generate, getBlueprint } = require('../controllers/blueprintController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/blueprint/generate - Generate AI blueprint for a case
router.post('/generate', authenticateToken, generate);

// GET /api/blueprint/:case_id - Get existing blueprint
router.get('/:case_id', authenticateToken, getBlueprint);

module.exports = router;
