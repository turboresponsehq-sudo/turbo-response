const express = require('express');
const router = express.Router();
const { sendMessage, getHistory } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/chat - Send chat message
router.post('/', authenticateToken, sendMessage);

// GET /api/chat/history/:case_id - Get chat history for a case
router.get('/history/:case_id', authenticateToken, getHistory);

module.exports = router;
