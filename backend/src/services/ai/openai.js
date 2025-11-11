const OpenAI = require('openai');
const logger = require('../../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate legal blueprint using AI
const generateBlueprint = async (caseData) => {
  try {
    const { category, case_details, full_name, address } = caseData;

    const systemPrompt = `You are an expert consumer rights attorney specializing in ${category} cases. 
Your role is to analyze the case details and generate a comprehensive legal response blueprint that empowers 
the consumer to defend their rights. The blueprint should include:

1. Case Analysis - Identify key legal issues and violations
2. Legal Strategy - Outline the best approach to resolve the case
3. Specific Actions - List concrete steps the consumer should take
4. Legal Citations - Reference relevant laws, regulations, and precedents
5. Timeline - Provide a realistic timeline for each action
6. Documentation - List required documents and evidence
7. Communication Templates - Provide sample letters or responses

Be professional, thorough, and actionable. Focus on empowering the consumer with knowledge and clear next steps.`;

    const userPrompt = `Generate a legal response blueprint for the following case:

**Category:** ${category}
**Client Name:** ${full_name}
**Address:** ${address || 'Not provided'}

**Case Details:**
${case_details}

Please provide a comprehensive legal blueprint that this person can use to defend their rights.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const blueprint = response.choices[0].message.content;

    logger.info('Blueprint generated successfully', { 
      category,
      tokens: response.usage.total_tokens 
    });

    return {
      blueprint,
      tokens_used: response.usage.total_tokens,
      model: response.model
    };
  } catch (error) {
    logger.error('Blueprint generation failed', { error: error.message });
    throw new Error(`Failed to generate blueprint: ${error.message}`);
  }
};

// AI Chat endpoint
const chat = async (messages, caseContext = null) => {
  try {
    const systemPrompt = caseContext 
      ? `You are Turbo AI, an expert consumer rights assistant helping with a ${caseContext.category} case. 
         You have access to the case details and blueprint. Provide helpful, accurate legal guidance 
         while being empathetic and professional. Always remind users that you're an AI assistant 
         and they should consult with a licensed attorney for final legal advice.
         
         Case Context:
         - Category: ${caseContext.category}
         - Status: ${caseContext.status}
         - Blueprint Generated: ${caseContext.blueprint_generated ? 'Yes' : 'No'}`
      : `You are Turbo AI, a consumer rights assistant. Help users understand their legal rights 
         and guide them through the process of defending against unfair practices. Be professional, 
         empathetic, and actionable. Always remind users to consult with a licensed attorney for 
         final legal advice.`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: chatMessages,
      temperature: 0.8,
      max_tokens: 1000
    });

    const reply = response.choices[0].message.content;

    logger.info('Chat response generated', { 
      tokens: response.usage.total_tokens 
    });

    return {
      message: reply,
      tokens_used: response.usage.total_tokens
    };
  } catch (error) {
    logger.error('Chat generation failed', { error: error.message });
    throw new Error(`Failed to generate chat response: ${error.message}`);
  }
};

module.exports = {
  generateBlueprint,
  chat
};
