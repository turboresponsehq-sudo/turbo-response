/**
 * AI Analysis Service for Consumer Defense Cases
 * Ported from Python letter_generation.py (commit 4f611d3)
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
  // Step 1: Retrieve relevant knowledge from Brain
  let brainContext = '';
  try     const { generateQueryEmbedding } = require('./embeddingsService');
    const { queryVectors } = require('./vectorStore');
    
    // Build query from case data
    const query = `${caseData.category} ${caseData.description || ''} consumer rights violations`;
    
    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Query Brain for consumer-rights domain knowledge
    const matches = await queryVectors(queryEmbedding, {
      topK: 5,
      filter: { document_domain: 'consumer-rights' },
      includeMetadata: true
    });
    
    if (matches.length > 0 && matches[0].score > 0.7) {
      brainContext = '\n\n=== RELEVANT LAWS AND REGULATIONS FROM BRAIN ===\n';
      matches.forEach((match, index) => {
        if (match.score > 0.7) {
          brainContext += `[Source ${index + 1}: ${match.metadata.document_title}]\n`;
          brainContext += `${match.metadata.chunk_text}\n\n`;
        }
      });
      brainContext += 'Use this knowledge to identify specific violations and cite exact statutes.\n';
      brainContext += '=====================\n';
    }
  } catch (error) {
    console.warn('Brain retrieval failed for case analysis:', error.message);
    // Continue without Brain context
  }
  
  const systemPrompt = `You are an expert consumer rights strategist and case analyst for Turbo Response, a premium AI-powered consumer advocacy platform.
${brainContext}

Analyze this case and provide:

1. VIOLATIONS: Specific violations of consumer protection laws (FDCPA, FCRA, TCPA, Fair Housing, state laws)
2. LAWS_CITED: Exact statutes and sections that apply
3. RECOMMENDED_ACTIONS: Specific strategic actions (letters, disputes, complaints, escalation pathways)
4. URGENCY_LEVEL: low/medium/high/critical based on deadlines and severity
5. ESTIMATED_VALUE: Potential case value based on statutory damages and violations
6. SUCCESS_PROBABILITY: 0-1 probability of successful outcome
7. CASE_SOPHISTICATION: Rate case complexity as 'standard', 'complex', or 'extreme' based on:
   - Number of violations
   - Document volume
   - Strategic pathways required
   - Time investment needed
   - Escalation requirements
8. PRICING_SUGGESTION: Recommended service fee using these ranges:
   - Standard cases (1-2 violations, simple strategy): $149-$799
   - Complex cases (3-5 violations, multi-step strategy): $799-$1,499
   - Extreme cases (6+ violations, multi-agency, urgent): $1,500-$3,000+
   
   NEVER suggest below $149. Price reflects intellectual labor, strategic positioning, and case sophistication.
   
9. PRICING_FACTORS: JSON object explaining pricing:
   {
     "base_price": number,
     "violations_multiplier": number,
     "urgency_multiplier": number,
     "document_factor": number,
     "strategy_complexity": number,
     "final_price": number
   }
10. SUMMARY: Executive summary for admin emphasizing strategic value
11. POTENTIAL_VIOLATIONS: Array of potential law violations found, each with:
   - label: Brief description of the violation (e.g., "FDCPA § 1692d - Harassment")
   - citation: Optional statute citation (e.g., "15 U.S.C. § 1692d")

Be specific, cite exact law sections, and base recommendations on actual violations found.

Return as JSON with these exact field names (use snake_case: potential_violations).`;

  const caseText = `
Category: ${caseData.category || 'Not specified'}
Client Story: ${caseData.caseDescription || 'No description provided'}
Amount Involved: ${caseData.amount || 'Not specified'}
Documents: ${caseData.uploadedFiles?.length || 0} uploaded
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Universal model for all Turbo Response agents
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
    return {
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
  } catch (error) {
    console.error('Error in comprehensive analysis:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      model: 'gpt-4o'
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
