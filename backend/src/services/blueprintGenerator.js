/**
 * Blueprint Generator Service
 * Generates AI-powered 5-section business strategy blueprints using GPT-4o
 */

const { invokeLLM } = require('../_core/llm');
const logger = require('../utils/logger');

/**
 * Generate a comprehensive business strategy blueprint
 * @param {Object} submission - Business submission data
 * @returns {Promise<Object>} - Blueprint with 5 sections
 */
async function generateBlueprint(submission) {
  try {
    logger.info(`Generating blueprint for submission: ${submission.id}`);

    const prompt = `You are a world-class business strategist. Create a comprehensive 5-section business strategy blueprint based on this business intake data:

**Business Information:**
- Business Name: ${submission.business_name}
- Owner: ${submission.full_name}
- What They Sell: ${submission.what_you_sell}
- Ideal Customer: ${submission.ideal_customer}
- Biggest Struggle: ${submission.biggest_struggle}
- Short-Term Goal (60-90 days): ${submission.short_term_goal}
- Long-Term Vision: ${submission.long_term_vision}

**Digital Presence:**
- Website: ${submission.website_url}
- Instagram: ${submission.instagram_url || 'Not provided'}
- TikTok: ${submission.tiktok_url || 'Not provided'}
- Facebook: ${submission.facebook_url || 'Not provided'}
- YouTube: ${submission.youtube_url || 'Not provided'}
- Link-in-Bio: ${submission.link_in_bio || 'Not provided'}

**Requirements:**
1. Generate EXACTLY 5 sections:
   - executive_summary
   - brand_positioning
   - funnel_website_strategy
   - social_strategy
   - action_plan

2. Each section must be 400-600 words of actionable, specific advice
3. Focus on their biggest struggle and short-term goal
4. Reference their actual digital presence (analyze what's working/missing)
5. Make recommendations specific to their ideal customer
6. Include concrete action steps in the action_plan

**Output Format:**
Return ONLY valid JSON in this exact structure:
{
  "executive_summary": "...",
  "brand_positioning": "...",
  "funnel_website_strategy": "...",
  "social_strategy": "...",
  "action_plan": "..."
}

Do not include any markdown formatting, code blocks, or explanatory text. Return ONLY the JSON object.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a world-class business strategist who generates comprehensive, actionable business strategy blueprints. You always return valid JSON without any markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'business_blueprint',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              executive_summary: {
                type: 'string',
                description: 'High-level overview of the business and key strategic recommendations (400-600 words)'
              },
              brand_positioning: {
                type: 'string',
                description: 'Brand identity, unique value proposition, and market positioning strategy (400-600 words)'
              },
              funnel_website_strategy: {
                type: 'string',
                description: 'Website optimization, conversion funnel, and customer journey strategy (400-600 words)'
              },
              social_strategy: {
                type: 'string',
                description: 'Social media content strategy, platform recommendations, and engagement tactics (400-600 words)'
              },
              action_plan: {
                type: 'string',
                description: 'Concrete 60-90 day action plan with specific steps and priorities (400-600 words)'
              }
            },
            required: ['executive_summary', 'brand_positioning', 'funnel_website_strategy', 'social_strategy', 'action_plan'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    const blueprint = JSON.parse(content);

    logger.info(`Blueprint generated successfully for submission: ${submission.id}`);

    return {
      success: true,
      blueprint: blueprint,
      generated_at: new Date().toISOString(),
      submission_id: submission.id
    };

  } catch (error) {
    logger.error(`Error generating blueprint: ${error.message}`);
    throw new Error(`Blueprint generation failed: ${error.message}`);
  }
}

module.exports = {
  generateBlueprint
};
