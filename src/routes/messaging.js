/**
 * Messaging Routes
 * Handles client-admin communication
 */

const express = require('express');
const router = express.Router();
const messagingController = require('../controllers/messagingController');

// Get all messages for a case
router.get('/:id/messages', messagingController.getMessages);

// Send a new message
router.post('/:id/messages', messagingController.sendMessage);

// Mark messages as read (admin only)
router.post('/:id/messages/mark-read', messagingController.markMessagesRead);

module.exports = router;
