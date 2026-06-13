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
        device_type, user_agent, ip_address, created_at, message_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 0)
      RETURNING id, session_id, created_at
    `, [session_id, visitor_id, page_url, referrer_url, device_type, user_agent, ip_address]);

    console.log('[CHAT] Session created:', result.rows[0].session_id);
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
    
    // Validate session exists
    const sessionCheck = await pool.query(
      'SELECT id FROM chat_sessions WHERE session_id = $1',
      [session_id]
    );
    
    if (sessionCheck.rows.length === 0) {
      console.error('[CHAT] Invalid session_id:', session_id);
      return res.status(400).json({
        success: false,
        error: 'Invalid session_id - session does not exist'
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

    console.log('[CHAT] Message saved:', result.rows[0].id, 'session=', session_id, 'role=', role);
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
      SET status = 'completed', updated_at = NOW()
      WHERE session_id = $1
      RETURNING id, session_id, updated_at
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

/**
 * POST /api/chat/ai-response
 * Get AI response for user message
 * 
 * Body: {
 *   session_id: string,
 *   message: string
 * }
 */
router.post('/ai-response', async (req, res) => {
  try {
    const { session_id, message } = req.body;

    if (!session_id || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: session_id, message'
      });
    }

    // Call OpenAI API
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are Turbo AI, a consumer defense assistant for Turbo Response. Help users with:
- Eviction notices and tenant rights
- Debt collection violations (FDCPA)
- IRS notices and tax issues
- Auto repossession and yo-yo financing
- Benefit denials and administrative actions

Be helpful, professional, and encourage users to click "Get Started" on the homepage to begin their case analysis. Keep responses concise (2-3 sentences).`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;

    res.json({
      success: true,
      response: aiResponse,
      tokens_used: tokensUsed,
      model: 'gpt-4'
    });

  } catch (error) {
    console.error('[CHAT API] Error getting AI response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      response: "I can help you with evictions, debt collection, IRS issues, and more. To get started with your case, click the 'Get Started' button on the homepage."
    });
  }
});

module.exports = router;
