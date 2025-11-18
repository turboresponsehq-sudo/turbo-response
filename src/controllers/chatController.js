const { query } = require('../services/database/db');
const { chat } = require('../services/ai/openai');
const logger = require('../utils/logger');

// Send chat message
const sendMessage = async (req, res, next) => {
  try {
    const { message, case_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let caseContext = null;

    // If case_id provided, get case context
    if (case_id) {
      const caseResult = await query(
        'SELECT category, status, blueprint_generated FROM cases WHERE id = $1',
        [case_id]
      );

      if (caseResult.rows.length > 0) {
        caseContext = caseResult.rows[0];
      }
    }

    // Get chat history if case_id provided
    let chatHistory = [];
    if (case_id) {
      const historyResult = await query(
        `SELECT role, message FROM chat_history 
         WHERE case_id = $1 
         ORDER BY created_at ASC 
         LIMIT 10`,
        [case_id]
      );

      chatHistory = historyResult.rows.map(row => ({
        role: row.role,
        content: row.message
      }));
    }

    // Add current user message to history
    chatHistory.push({ role: 'user', content: message });

    // Generate AI response
    const { message: aiResponse, tokens_used } = await chat(chatHistory, caseContext);

    // Save user message to database
    if (case_id) {
      await query(
        'INSERT INTO chat_history (case_id, user_id, role, message) VALUES ($1, $2, $3, $4)',
        [case_id, req.user?.id || null, 'user', message]
      );

      // Save AI response to database
      await query(
        'INSERT INTO chat_history (case_id, user_id, role, message) VALUES ($1, $2, $3, $4)',
        [case_id, req.user?.id || null, 'assistant', aiResponse]
      );
    }

    logger.info('Chat message processed', { 
      userId: req.user?.id, 
      caseId: case_id,
      tokens: tokens_used 
    });

    res.json({
      message: aiResponse,
      tokens_used
    });
  } catch (error) {
    next(error);
  }
};

// Get chat history
const getHistory = async (req, res, next) => {
  try {
    const { case_id } = req.params;

    const result = await query(
      `SELECT role, message, created_at 
       FROM chat_history 
       WHERE case_id = $1 
       ORDER BY created_at ASC`,
      [case_id]
    );

    res.json({
      history: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory
};
