const express = require('express');
const router = express.Router();
const { chat } = require('../services/ai/openai');
const logger = require('../utils/logger');

/**
 * POST /api/turbo/chat
 * Turbo Command Interface - Chat endpoint
 * Accepts user messages and returns AI responses
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, agent = 'turbo' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    // Define system prompts for each agent
    let systemPrompt;
    switch (agent) {
      case 'turbo':
        systemPrompt = `You are Turbo, the main AI assistant for Turbo Response HQ.
Your role is to help the Chief manage operations, coordinate between agents, and provide strategic guidance.
You have access to case analysis, business auditing, and market intelligence capabilities.
Be professional, concise, and action-oriented in your responses.`;
        break;
      
      case 'case-analyzer':
        systemPrompt = `You are the Case Analyzer agent for Turbo Response HQ.
Your specialty is analyzing consumer protection cases, identifying legal violations, and recommending strategies.
You help evaluate case strength, estimate potential damages, and suggest next steps.
Provide detailed legal analysis with specific law citations when applicable.`;
        break;
      
      case 'business-auditor':
        systemPrompt = `You are the Business Auditor agent for Turbo Response HQ.
Your specialty is analyzing business operations, compliance issues, and strategic planning.
You help identify operational inefficiencies, revenue opportunities, and risk mitigation strategies.
Provide data-driven insights and actionable business recommendations.`;
        break;
      
      case 'market-scout':
        systemPrompt = `You are the Market Scout agent for Turbo Response HQ.
Your specialty is market research, competitive analysis, and identifying growth opportunities.
You help understand market trends, customer needs, and strategic positioning.
Provide insights on market dynamics, customer acquisition, and competitive advantages.`;
        break;
      
      default:
        systemPrompt = `You are Turbo, an AI assistant for Turbo Response HQ.`;
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    // Call OpenAI chat function (it expects messages array and caseContext)
    // We pass null for caseContext since this is general command interface chat
    const response = await chat(messages, null);

    logger.info(`Turbo chat - Agent: ${agent}, Message length: ${message.length}, Tokens: ${response.tokens_used}`);

    res.json({
      reply: response.message,
      agent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Turbo chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

module.exports = router;
