/**
 * Chat API Routes - Intelligence Capture System
 * 
 * Purpose: Capture all chat interactions from Floating Chat Widget
 * Database: chat_sessions, chat_messages tables
 * 
 * Endpoints:
 * - POST /api/chat/sessions - Create new chat session
 * - POST /api/chat/messages - Send message in session
 * - GET /api/chat/history/:sessionId - Get chat history
 * - POST /api/chat/sessions/:sessionId/end - End chat session
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * POST /api/chat/sessions
 * Create a new chat session
 * 
 * Body: {
 *   visitor_id: string,
 *   page_url: string,
 *   referrer_url: string (optional),
 *   device_type: string (optional),
 *   user_agent: string (optional),
 *   ip_address: string (optional)
 * }
 */
router.post('/sessions', async (req, res) => {
  try {
    const {
      visitor_id,
      page_url,
      referrer_url,
      device_type,
      user_agent,
      ip_address
    } = req.body;

    // Generate unique session ID
    const session_id = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert session into database
    const result = await pool.query(`
      INSERT INTO chat_sessions (
        session_id, visitor_id, page_url, referrer_url, 
        device_type, user_agent, ip_address, started_at, message_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 0)
      RETURNING id, session_id, started_at
    `, [session_id, visitor_id, page_url, referrer_url, device_type, user_agent, ip_address]);

    res.status(201).json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('[CHAT API] Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat session'
    });
  }
});

/**
 * POST /api/chat/messages
 * Send a message in a chat session
 * 
 * Body: {
 *   session_id: string,
 *   role: 'user' | 'assistant' | 'system',
 *   content: string,
 *   tokens_used: number (optional),
 *   model: string (optional)
 * }
 */
router.post('/messages', async (req, res) => {
  try {
    const {
      session_id,
      role,
      content,
      tokens_used = 0,
      model = null
    } = req.body;

    // Validate required fields
    if (!session_id || !role || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: session_id, role, content'
      });
    }

    // Insert message into database
    const result = await pool.query(`
      INSERT INTO chat_messages (
        session_id, role, content, tokens_used, model, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, session_id, role, created_at
    `, [session_id, role, content, tokens_used, model]);

    // Update message count in session
    await pool.query(`
      UPDATE chat_sessions 
      SET message_count = message_count + 1
      WHERE session_id = $1
    `, [session_id]);

    res.status(201).json({
      success: true,
      message: result.rows[0]
    });
  } catch (error) {
    console.error('[CHAT API] Error saving message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save message'
    });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Get all messages in a chat session
 */
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(`
      SELECT id, session_id, role, content, tokens_used, model, created_at
      FROM chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [sessionId]);

    res.json({
      success: true,
      messages: result.rows
    });
  } catch (error) {
    console.error('[CHAT API] Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});

/**
 * POST /api/chat/sessions/:sessionId/end
 * End a chat session
 */
router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(`
      UPDATE chat_sessions
      SET ended_at = NOW()
      WHERE session_id = $1
      RETURNING id, session_id, ended_at
    `, [sessionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('[CHAT API] Error ending session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end session'
    });
  }
});

module.exports = router;
