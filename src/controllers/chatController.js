const { query } = require('../services/database/db');
const { chat } = require('../services/ai/openai');
const { generateEmbedding } = require('../services/embeddings');
const { searchSimilarChunks } = require('../services/vectorSearch');
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

    // Retrieve relevant context from Brain documents
    let brainContext = null;
    try {
      // Generate embedding for user message
      const queryEmbedding = await generateEmbedding(message);
      
      // Search for relevant chunks
      const relevantChunks = await searchSimilarChunks(queryEmbedding, {
        topK: 3,
        minScore: 0.75
      });

      if (relevantChunks.length > 0) {
        // Fetch document titles
        const documentIds = [...new Set(relevantChunks.map(c => c.documentId))];
        const docsResult = await query(
          'SELECT id, title FROM brain_documents WHERE id = ANY($1)',
          [documentIds]
        );
        
        const docsMap = {};
        docsResult.rows.forEach(doc => {
          docsMap[doc.id] = doc.title;
        });

        // Assemble context from chunks
        const contextParts = relevantChunks.map(chunk => 
          `[Source: ${docsMap[chunk.documentId] || 'Unknown'}]\n${chunk.content}`
        );
        
        brainContext = {
          context: contextParts.join('\n\n---\n\n'),
          sources: relevantChunks.map(c => ({
            title: docsMap[c.documentId] || 'Unknown',
            score: c.score
          }))
        };

        logger.info('Brain context retrieved', {
          chunksFound: relevantChunks.length,
          sources: brainContext.sources.length
        });
      }
    } catch (error) {
      logger.error('Brain context retrieval failed', { error: error.message });
      // Continue without Brain context if retrieval fails
    }

    // Generate AI response with Brain context
    const { message: aiResponse, tokens_used } = await chat(chatHistory, caseContext, brainContext);

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
