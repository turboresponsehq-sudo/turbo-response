/**
 * Turbo Response AI Pricing Engine v1.0
 * Deterministic pricing calculation based on strategy, complexity, and urgency
 * 
 * This is the EXACT formula from the official specification.
 * DO NOT modify without Chief Strategist approval.
 */

/**
 * Calculate case pricing using deterministic formula
 * 
 * @param {Object} input - Pricing calculation inputs
 * @param {string} input.category - Case category ('debt'|'consumer'|'billing'|'auto'|'wage'|'benefits'|'eviction'|'housing'|'irs'|'tax')
 * @param {number} input.violations - Number of violations found (default: 0)
 * @param {number} input.documents - Number of documents uploaded (default: 0)
 * @param {number} input.amountAtStake - Dollar amount involved in case (default: 0)
 * @param {string} input.strategyLevel - Strategy complexity ('basic'|'multi_step'|'agency_complaint'|'evidence_review'|'legal_positioning'|'multi_agency'|'case_building')
 * @param {string} input.urgency - Time urgency ('standard'|'week_left'|'few_days'|'two_days'|'one_day'|'immediate')
 * @param {string[]} input.documentTypes - Types of documents (['contract','gov_notice','court','medical',...])
 * 
 * @returns {Object} Pricing result
 * @returns {number} finalPrice - Final calculated price (rounded to nearest $25, minimum $149)
 * @returns {string} tier - Pricing tier ('standard'|'high'|'extreme')
 * @returns {Object} breakdown - Detailed breakdown of pricing components
 */
function calculatePrice(input) {
  let {
    category,
    violations = 0,
    documents = 0,
    amountAtStake = 0,
    strategyLevel = 'basic',
    urgency = 'standard',
    documentTypes = []
  } = input;

  // ========================================
  // 1. BASE PRICE (Starting Point)
  // ========================================
  const basePrices = {
    debt: 149,
    consumer: 149,
    billing: 199,
    auto: 249,
    wage: 249,
    benefits: 249,
    eviction: 299,
    housing: 299,
    irs: 349,
    tax: 349
  };
  let base = basePrices[category] || 149;

  // ========================================
  // 2. COMPLEXITY SCORE (0-400 pts)
  // ========================================
  let complexity = 0;

  // Violations count
  if (violations >= 6) {
    complexity += 200;
  } else if (violations >= 3) {
    complexity += 150;
  } else if (violations >= 1) {
    complexity += 75;
  }

  // Document count
  if (documents >= 4) {
    complexity += 100;
  } else if (documents >= 1) {
    complexity += 50;
  }

  // Amount at stake
  if (amountAtStake >= 10000) {
    complexity += 100;
  } else if (amountAtStake >= 1500) {
    complexity += 75;
  } else if (amountAtStake >= 500) {
    complexity += 50;
  } else if (amountAtStake > 0) {
    complexity += 25;
  }

  // ========================================
  // 3. STRATEGY SCORE (0-600 pts)
  // ========================================
  const strategyPoints = {
    basic: 50,
    multi_step: 150,
    agency_complaint: 200,
    evidence_review: 150,
    legal_positioning: 250,
    multi_agency: 350,
    case_building: 400
  };
  const strategy = strategyPoints[strategyLevel] || 0;

  // ========================================
  // 4. DOCUMENT TYPE MODIFIER (0-250 pts)
  // ========================================
  let docModifier = 0;
  
  if (documentTypes.includes('court')) {
    docModifier += 100;
  }
  if (documentTypes.includes('gov_notice')) {
    docModifier += 75;
  }
  if (documentTypes.includes('medical')) {
    docModifier += 125;
  }
  if (documentTypes.includes('contract')) {
    docModifier += 50;
  }
  if (documentTypes.length > 3) {
    docModifier += 250;
  }

  // ========================================
  // 5. URGENCY MULTIPLIER (1.0x-3.0x)
  // ========================================
  const urgencyMap = {
    standard: 1.0,
    week_left: 1.3,
    few_days: 1.7,
    two_days: 2.0,
    one_day: 2.5,
    immediate: 3.0
  };
  const urgencyMultiplier = urgencyMap[urgency] || 1.0;

  // ========================================
  // 6. FINAL PRICE CALCULATION
  // ========================================
  // Formula: (Base + Complexity + Strategy + DocModifier) × UrgencyMultiplier
  let rawPrice = (base + complexity + strategy + docModifier) * urgencyMultiplier;

  // Enforce minimum $149
  rawPrice = Math.max(rawPrice, 149);

  // Round to nearest $25
  const finalPrice = Math.round(rawPrice / 25) * 25;

  // ========================================
  // 7. TIER CLASSIFICATION
  // ========================================
  let tier = 'standard';
  if (finalPrice >= 1500) {
    tier = 'extreme';
  } else if (finalPrice >= 800) {
    tier = 'high';
  }

  // ========================================
  // 8. RETURN RESULT
  // ========================================
  return {
    finalPrice,
    tier,
    breakdown: {
      base,
      complexity,
      strategy,
      docModifier,
      urgencyMultiplier
    }
  };
}

module.exports = {
  calculatePrice
};
