/**
 * AI Analysis Service for Consumer Defense Cases
 * Ported from Python letter_generation.py (commit 4f611d3)
 * Version: 2.0.1 - Timeout parameter fix deployed
 */

const OpenAI = require('openai');
const { calculatePrice } = require('./pricingEngine');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate comprehensive case analysis with violations, laws, and recommendations
 * 
 * This is the CORE AI analysis engine that powers the "Run AI Analysis" button
 */
async function generateComprehensiveAnalysis(caseData) {
  // Brain RAG retrieval DISABLED temporarily until /admin/brain UI is ready
  // TODO: Re-enable after Brain upload system is fully operational
  let brainContext = '';
  console.log('[AI Analysis] VERSION 2738b46-fix - Brain RAG disabled, using GPT-4o base knowledge only');
  
  const systemPrompt = `You are Turbo Response's legal analysis engine. 
Your ONLY job is to output a complete JSON object with the following exact keys:

violations: an array of specific legal violations based on the case details
laws_cited: an array of exact law citations (e.g., "26 U.S.C. § 6201(d)")
recommended_actions: an array of next steps Turbo Response should take
urgency_level: "low", "medium", "high", or "critical"
estimated_value: a numeric estimate of case value
success_probability: number between 0 and 1
summary: a 2–3 sentence summary of the case
potential_violations: array of objects with:
  { "label": "...", "citation": "..." }

Rules:
- ALWAYS include at least 1 violation if any possibility exists.
- ALWAYS cite at least 1 law if the issue involves IRS, debt, housing, or consumer law.
- NEVER return empty violations or empty laws_cited unless the case is truly blank.`;

  const caseText = `
Category: ${caseData.category || 'Not specified'}
Client Story: ${caseData.caseDescription || 'No description provided'}
Amount Involved: ${caseData.amount || 'Not specified'}
Documents: ${caseData.uploadedFiles?.length || 0} uploaded
`;

  try {
    console.log('[AI Analysis] Starting OpenAI API call with GPT-4o...');
    console.log('[AI Analysis] Case category:', caseData.category);
    console.log('[AI Analysis] Case details length:', caseData.caseDescription?.length || 0);
    console.log('[AI Analysis] Case description preview:', caseData.caseDescription?.substring(0, 100) || 'EMPTY');
    
    // Add timeout wrapper to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI API timeout after 60 seconds')), 60000)
    );
    
    const apiPromise = openai.chat.completions.create({
      model: 'gpt-4o', // Universal model for all Turbo Response agents
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: caseText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const response = await Promise.race([apiPromise, timeoutPromise]);
    console.log('[AI Analysis] OpenAI API call completed successfully');
    console.log('[AI Analysis] Tokens used:', response.usage?.total_tokens || 0);

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
    
    // ========================================
    // DETERMINISTIC PRICING ENGINE v1.0
    // ========================================
    // Calculate pricing using exact formula from specification
    const violations = (analysis.violations || []).length;
    const documents = caseData.uploadedFiles?.length || 0;
    const amountAtStake = parseFloat(caseData.amount) || 0;
    
    // Map AI analysis to strategy level
    let strategyLevel = 'basic';
    const actions = analysis.recommended_actions || [];
    if (actions.some(a => a.toLowerCase().includes('case-building') || a.toLowerCase().includes('timeline'))) {
      strategyLevel = 'case_building';
    } else if (actions.some(a => a.toLowerCase().includes('multi-agency') || a.toLowerCase().includes('escalate'))) {
      strategyLevel = 'multi_agency';
    } else if (actions.some(a => a.toLowerCase().includes('legal positioning') || a.toLowerCase().includes('statute'))) {
      strategyLevel = 'legal_positioning';
    } else if (actions.some(a => a.toLowerCase().includes('agency') || a.toLowerCase().includes('complaint'))) {
      strategyLevel = 'agency_complaint';
    } else if (actions.some(a => a.toLowerCase().includes('evidence') || a.toLowerCase().includes('review'))) {
      strategyLevel = 'evidence_review';
    } else if (actions.length > 2) {
      strategyLevel = 'multi_step';
    }
    
    // Map urgency level to urgency multiplier
    const urgencyMap = {
      'critical': 'immediate',
      'high': 'few_days',
      'medium': 'week_left',
      'low': 'standard'
    };
    const urgency = urgencyMap[analysis.urgency_level] || 'standard';
    
    // Detect document types from file names (if available)
    const documentTypes = [];
    if (caseData.uploadedFiles) {
      caseData.uploadedFiles.forEach(file => {
        const fileName = (file.filename || file.name || '').toLowerCase();
        if (fileName.includes('court') || fileName.includes('filing')) {
          documentTypes.push('court');
        } else if (fileName.includes('notice') || fileName.includes('government') || fileName.includes('irs')) {
          documentTypes.push('gov_notice');
        } else if (fileName.includes('medical') || fileName.includes('health')) {
          documentTypes.push('medical');
        } else if (fileName.includes('contract') || fileName.includes('agreement')) {
          documentTypes.push('contract');
        }
      });
    }
    
    // Calculate deterministic pricing
    const pricing = calculatePrice({
      category: caseData.category || 'consumer',
      violations,
      documents,
      amountAtStake,
      strategyLevel,
      urgency,
      documentTypes
    });
    
    // Ensure all required fields exist with defaults
    const finalResult = {
      violations: analysis.violations || ['Analysis pending'],
      laws_cited: analysis.laws_cited || ['Review required'],
      recommended_actions: analysis.recommended_actions || ['Manual review needed'],
      urgency_level: analysis.urgency_level || 'medium',
      estimated_value: analysis.estimated_value || 0,
      success_probability: analysis.success_probability || 0.5,
      pricing_suggestion: pricing.finalPrice, // Deterministic pricing
      pricing_tier: pricing.tier, // standard | high | extreme
      pricing_breakdown: pricing.breakdown, // Detailed breakdown
      summary: analysis.summary || 'Case requires manual review',
      potential_violations: analysis.potential_violations || [],
      _usage: analysis._usage
    };
    
    console.log('[AI Analysis] ✅ Analysis completed successfully');
    console.log('[AI Analysis] Violations found:', finalResult.violations?.length || 0);
    console.log('[AI Analysis] Laws cited:', finalResult.laws_cited?.length || 0);
    console.log('[AI Analysis] Pricing:', finalResult.pricing_suggestion);
    
    return finalResult;
  } catch (error) {
    console.error('[AI Analysis] ❌ CRITICAL ERROR in comprehensive analysis');
    console.error('[AI Analysis] Error message:', error.message);
    console.error('[AI Analysis] Error stack:', error.stack);
    console.error('[AI Analysis] Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
      model: 'gpt-4o',
      caseId: caseData.id,
      category: caseData.category
    });
    
    // Return fallback analysis with deterministic pricing and error details
    const fallbackPricing = calculatePrice({
      category: caseData.category || 'consumer',
      violations: 0,
      documents: caseData.uploadedFiles?.length || 0,
      amountAtStake: parseFloat(caseData.amount) || 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: []
    });
    
    return {
      violations: ['Analysis pending - manual review required'],
      laws_cited: ['Review required'],
      recommended_actions: ['Manual review needed'],
      urgency_level: 'medium',
      estimated_value: 0,
      success_probability: 0.5,
      pricing_suggestion: fallbackPricing.finalPrice, // Deterministic pricing
      pricing_tier: fallbackPricing.tier,
      pricing_breakdown: fallbackPricing.breakdown,
      summary: `Case requires manual review due to analysis error: ${error.message || 'Unknown error'}`,
      _error: {
        message: error.message,
        status: error.status,
        type: error.type
      },
      potential_violations: [],
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
      model: 'gpt-4o', // Universal model for all Turbo Response agents
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
    'gpt-4o': 2.50, // GPT-4o pricing: $2.50 per 1M input tokens
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
