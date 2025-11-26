/**
 * Messaging Controller
 * Handles client-admin messaging for cases
 */

const { query } = require('../services/database/db');
const logger = require('../utils/logger');

/**
 * GET /api/case/:id/messages
 * Get all messages for a case
 * Auth: Client can only access their case, admin can access all
 */
async function getMessages(req, res) {
  try {
    const caseId = parseInt(req.params.id);

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID'
      });
    }

    // TODO: Add authorization check
    // If client, verify case belongs to them via session
    // If admin, allow access to all cases

    const result = await query(
      `SELECT id, case_id, sender, sender_name, message_text, 
              file_path, file_name, file_type, created_at
       FROM case_messages
       WHERE case_id = $1
       ORDER BY created_at ASC`,
      [caseId]
    );

    res.json({
      success: true,
      messages: result.rows
    });

  } catch (error) {
    logger.error('Failed to get messages', {
      error: error.message,
      caseId: req.params.id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to load messages'
    });
  }
}

/**
 * POST /api/case/:id/messages
 * Send a new message
 * Body: { sender: 'client'|'admin', senderName, messageText, filePath, fileName, fileType }
 */
async function sendMessage(req, res) {
  try {
    const caseId = parseInt(req.params.id);
    const { sender, senderName, messageText, filePath, fileName, fileType } = req.body;

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID'
      });
    }

    if (!sender || !['client', 'admin'].includes(sender)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender type'
      });
    }

    if (!messageText && !filePath) {
      return res.status(400).json({
        success: false,
        message: 'Either message text or file is required'
      });
    }

    // Insert message
    const result = await query(
      `INSERT INTO case_messages 
       (case_id, sender, sender_name, message_text, file_path, file_name, file_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [caseId, sender, senderName, messageText, filePath, fileName, fileType]
    );

    // Update unread count if client sent message
    if (sender === 'client') {
      // Check if case exists in cases table (consumer) or business_intakes (business)
      const consumerCase = await query(
        `SELECT id FROM cases WHERE id = $1`,
        [caseId]
      );

      if (consumerCase.rows.length > 0) {
        // Consumer case
        await query(
          `UPDATE cases 
           SET unread_messages_count = unread_messages_count + 1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [caseId]
        );
      } else {
        // Business case
        await query(
          `UPDATE business_intakes 
           SET unread_messages_count = COALESCE(unread_messages_count, 0) + 1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [caseId]
        );
      }
    }

    logger.info('Message sent', {
      caseId,
      sender,
      messageId: result.rows[0].id
    });

    res.json({
      success: true,
      message: result.rows[0]
    });

  } catch (error) {
    logger.error('Failed to send message', {
      error: error.message,
      caseId: req.params.id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
}

/**
 * POST /api/case/:id/messages/mark-read
 * Mark all messages as read (admin only)
 * Resets unread_messages_count to 0
 */
async function markMessagesRead(req, res) {
  try {
    const caseId = parseInt(req.params.id);

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID'
      });
    }

    // TODO: Add admin authorization check

    // Check if case exists in cases table (consumer) or business_intakes (business)
    const consumerCase = await query(
      `SELECT id FROM cases WHERE id = $1`,
      [caseId]
    );

    if (consumerCase.rows.length > 0) {
      // Consumer case
      await query(
        `UPDATE cases 
         SET unread_messages_count = 0,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [caseId]
      );
    } else {
      // Business case
      await query(
        `UPDATE business_intakes 
         SET unread_messages_count = 0,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [caseId]
      );
    }

    logger.info('Messages marked as read', { caseId });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    logger.error('Failed to mark messages as read', {
      error: error.message,
      caseId: req.params.id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
}

module.exports = {
  getMessages,
  sendMessage,
  markMessagesRead
};
