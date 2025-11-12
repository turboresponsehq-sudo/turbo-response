/**
 * AI Analysis Service for Consumer Defense Cases
 * Ported from Python letter_generation.py (commit 4f611d3)
 */

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate comprehensive case analysis with violations, laws, and recommendations
 * 
 * This is the CORE AI analysis engine that powers the "Run AI Analysis" button
 */
async function generateComprehensiveAnalysis(caseData) {
  const systemPrompt = `You are an expert consumer rights analyst. Analyze this case and provide:

1. VIOLATIONS: Specific violations of consumer protection laws (FDCPA, FCRA, TCPA, Fair Housing, state laws)
2. LAWS_CITED: Exact statutes and sections that apply
3. RECOMMENDED_ACTIONS: Specific actions we can take (letters, disputes, complaints)
4. URGENCY_LEVEL: low/medium/high/critical based on deadlines and severity
5. ESTIMATED_VALUE: Potential case value based on statutory damages and violations
6. SUCCESS_PROBABILITY: 0-1 probability of successful outcome
7. PRICING_SUGGESTION: Recommended service fee ($99-$499 range)
8. SUMMARY: Executive summary for admin

Be specific, cite exact law sections, and base recommendations on actual violations found.

Return as JSON with these exact field names.`;

  const caseText = `
Category: ${caseData.category || 'Not specified'}
Client Story: ${caseData.caseDescription || 'No description provided'}
Amount Involved: ${caseData.amount || 'Not specified'}
Documents: ${caseData.uploadedFiles?.length || 0} uploaded
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: caseText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);
    
    // Track usage for cost monitoring
    const tokensUsed = response.usage?.total_tokens || 0;
    const estimatedCost = calculateCost(tokensUsed, 'gpt-4o');
    
    // Return usage data along with analysis
    analysis._usage = {
      tokens: tokensUsed,
      cost: estimatedCost,
      model: 'gpt-4o'
    };
    
    // Ensure all required fields exist with defaults
    return {
      violations: analysis.violations || ['Analysis pending'],
      laws_cited: analysis.laws_cited || ['Review required'],
      recommended_actions: analysis.recommended_actions || ['Manual review needed'],
      urgency_level: analysis.urgency_level || 'medium',
      estimated_value: analysis.estimated_value || 0,
      success_probability: analysis.success_probability || 0.5,
      pricing_suggestion: analysis.pricing_suggestion || 199,
      summary: analysis.summary || 'Case requires manual review',
    };
  } catch (error) {
    console.error('Error in comprehensive analysis:', error);
    
    // Return fallback analysis
    return {
      violations: ['Analysis pending - manual review required'],
      laws_cited: ['Review required'],
      recommended_actions: ['Manual review needed'],
      urgency_level: 'medium',
      estimated_value: 0,
      success_probability: 0.5,
      pricing_suggestion: 199,
      summary: 'Case requires manual review due to analysis error',
    };
  }
}

/**
 * Letter templates for different case types
 * Ported from Python LETTER_TEMPLATES
 */
const LETTER_TEMPLATES = {
  debt_collection: {
    cease_desist: `Generate a professional cease and desist letter for debt collection harassment.

Client Info: {client_info}
Case Details: {case_details}
Violations: {violations}

The letter should:
1. Reference specific FDCPA violations (Section 806, 807, 808 as applicable)
2. Demand immediate cessation of contact
3. Cite specific dates/times of violations
4. Be firm but professional
5. Include legal consequences of continued violations
6. Request written confirmation of compliance

Format as a formal business letter.`,

    dispute: `Generate a debt validation/dispute letter under FDCPA Section 809.

Client Info: {client_info}
Debt Details: {case_details}

The letter should:
1. Dispute the debt and request validation
2. Demand proof of debt ownership
3. Request original creditor information
4. Cite FDCPA Section 809(b)
5. Demand cessation of collection until validation provided
6. Be professional and compliance-focused`,
  },

  eviction_housing: {
    habitability: `Generate a formal notice of uninhabitable conditions and repair demand.

Client Info: {client_info}
Property Issues: {case_details}
Violations: {violations}

The letter should:
1. Document specific habitability violations
2. Reference state/local housing codes
3. Demand repairs within reasonable timeframe
4. Mention potential rent withholding/escrow
5. Reference tenant rights under state law
6. Request written response`,

    eviction_defense: `Generate an eviction defense response letter.

Client Info: {client_info}
Eviction Details: {case_details}
Defenses: {violations}

The letter should:
1. Assert specific legal defenses
2. Reference procedural violations if any
3. Cite relevant state landlord-tenant law
4. Demand proper notice/process
5. Assert tenant rights
6. Professional and legally sound`,
  },

  irs_tax: {
    dispute: `Generate an IRS notice dispute/response letter.

Client Info: {client_info}
IRS Notice: {case_details}
Dispute Basis: {violations}

The letter should:
1. Reference specific IRS notice number
2. Clearly state disagreement and basis
3. Request abatement/correction
4. Cite relevant tax code sections
5. Request additional time if needed
6. Professional IRS-appropriate tone`,
  },

  consumer_rights: {
    demand: `Generate a consumer rights violation demand letter.

Client Info: {client_info}
Violation Details: {case_details}
Laws Violated: {violations}

The letter should:
1. Cite specific consumer protection law violations
2. Detail damages suffered
3. Demand specific remedies
4. Reference UDAP/state consumer protection statutes
5. Mention potential legal action
6. Request response within 30 days`,

    dispute: `Generate a consumer dispute/complaint letter.

Client Info: {client_info}
Issue Details: {case_details}

The letter should:
1. Clearly describe the problem
2. Reference purchase/service details
3. Cite warranty/contract terms if applicable
4. Demand specific resolution
5. Mention regulatory complaints if unresolved
6. Professional but firm tone`,
  },
};

/**
 * Generate a professional letter based on case analysis
 */
async function generateLetter(params) {
  try {
    // Find appropriate template
    const categoryTemplates = LETTER_TEMPLATES[params.category];
    let template;

    if (categoryTemplates && params.letterType in categoryTemplates) {
      template = categoryTemplates[params.letterType];
    } else {
      // Generic template
      template = `Generate a professional {letter_type} letter for this consumer rights case.

Client Info: {client_info}
Case Details: {case_details}
Issues/Violations: {violations}

Create a formal, legally sound letter addressing the issues.`;
    }

    // Fill template
    const prompt = template
      .replace('{client_info}', JSON.stringify(params.clientInfo))
      .replace('{case_details}', params.caseDetails)
      .replace('{violations}', JSON.stringify(params.violations))
      .replace('{letter_type}', params.letterType);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional legal letter writer specializing in consumer rights. Generate formal, legally sound letters.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return {
      success: true,
      content,
    };
  } catch (error) {
    console.error('Error generating letter:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Calculate estimated OpenAI API cost based on tokens and model
 * Pricing as of 2024:
 * - GPT-4o: $2.50 per 1M input tokens, $10.00 per 1M output tokens
 * - GPT-4: $30.00 per 1M input tokens, $60.00 per 1M output tokens
 * 
 * Using average estimate: $5 per 1M tokens for GPT-4o
 */
function calculateCost(tokens, model) {
  const costPer1MTokens = {
    'gpt-4o': 5.00,
    'gpt-4': 45.00,
    'gpt-3.5-turbo': 1.50,
  };
  
  const rate = costPer1MTokens[model] || 5.00;
  return (tokens / 1000000) * rate;
}

module.exports = {
  generateComprehensiveAnalysis,
  generateLetter,
  calculateCost,
  LETTER_TEMPLATES,
};
