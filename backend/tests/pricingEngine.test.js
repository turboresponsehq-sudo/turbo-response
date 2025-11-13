/**
 * Pricing Engine v1.0 Tests
 * Validates deterministic pricing calculation
 */

const { calculatePrice } = require('../src/services/pricingEngine');

describe('Pricing Engine v1.0', () => {
  
  test('enforces $149 minimum floor', () => {
    const result = calculatePrice({
      category: 'consumer',
      violations: 0,
      documents: 0,
      amountAtStake: 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: []
    });
    
    expect(result.finalPrice).toBeGreaterThanOrEqual(149);
    expect(result.tier).toBe('standard');
  });

  test('simple debt case yields standard tier', () => {
    const result = calculatePrice({
      category: 'debt',
      violations: 1,
      documents: 1,
      amountAtStake: 200,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: ['pdf']
    });
    
    expect(result.finalPrice).toBeGreaterThanOrEqual(149);
    expect(result.finalPrice).toBeLessThan(800);
    expect(result.tier).toBe('standard');
  });

  test('complex eviction case yields high or extreme tier', () => {
    const result = calculatePrice({
      category: 'eviction',
      violations: 4,
      documents: 5,
      amountAtStake: 3500,
      strategyLevel: 'legal_positioning',
      urgency: 'few_days',
      documentTypes: ['contract', 'court', 'gov_notice']
    });
    
    expect(result.finalPrice).toBeGreaterThanOrEqual(800);
    expect(['high', 'extreme']).toContain(result.tier);
  });

  test('immediate urgency increases price significantly', () => {
    const standardResult = calculatePrice({
      category: 'auto',
      violations: 3,
      documents: 2,
      amountAtStake: 9000,
      strategyLevel: 'multi_agency',
      urgency: 'standard',
      documentTypes: ['contract']
    });

    const immediateResult = calculatePrice({
      category: 'auto',
      violations: 3,
      documents: 2,
      amountAtStake: 9000,
      strategyLevel: 'multi_agency',
      urgency: 'immediate',
      documentTypes: ['contract']
    });
    
    expect(immediateResult.finalPrice).toBeGreaterThan(standardResult.finalPrice);
    expect(immediateResult.finalPrice).toBeGreaterThanOrEqual(1500);
    expect(immediateResult.tier).toBe('extreme');
  });

  test('pricing rounds to nearest $25', () => {
    const result = calculatePrice({
      category: 'consumer',
      violations: 2,
      documents: 2,
      amountAtStake: 750,
      strategyLevel: 'multi_step',
      urgency: 'standard',
      documentTypes: []
    });
    
    expect(result.finalPrice % 25).toBe(0);
  });

  test('breakdown includes all components', () => {
    const result = calculatePrice({
      category: 'debt',
      violations: 3,
      documents: 3,
      amountAtStake: 1000,
      strategyLevel: 'agency_complaint',
      urgency: 'week_left',
      documentTypes: ['contract', 'gov_notice']
    });
    
    expect(result.breakdown).toHaveProperty('base');
    expect(result.breakdown).toHaveProperty('complexity');
    expect(result.breakdown).toHaveProperty('strategy');
    expect(result.breakdown).toHaveProperty('docModifier');
    expect(result.breakdown).toHaveProperty('urgencyMultiplier');
    expect(result.breakdown.urgencyMultiplier).toBe(1.3);
  });

  test('IRS/tax cases have higher base price', () => {
    const debtResult = calculatePrice({
      category: 'debt',
      violations: 0,
      documents: 0,
      amountAtStake: 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: []
    });

    const irsResult = calculatePrice({
      category: 'irs',
      violations: 0,
      documents: 0,
      amountAtStake: 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: []
    });
    
    expect(irsResult.finalPrice).toBeGreaterThan(debtResult.finalPrice);
    expect(debtResult.breakdown.base).toBe(149);
    expect(irsResult.breakdown.base).toBe(349);
  });

  test('case building strategy adds maximum strategy points', () => {
    const basicResult = calculatePrice({
      category: 'consumer',
      violations: 0,
      documents: 0,
      amountAtStake: 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: []
    });

    const caseBuildingResult = calculatePrice({
      category: 'consumer',
      violations: 0,
      documents: 0,
      amountAtStake: 0,
      strategyLevel: 'case_building',
      urgency: 'standard',
      documentTypes: []
    });
    
    expect(caseBuildingResult.finalPrice).toBeGreaterThan(basicResult.finalPrice);
    expect(caseBuildingResult.breakdown.strategy).toBe(400);
  });

  test('court documents add significant modifier', () => {
    const noDocsResult = calculatePrice({
      category: 'consumer',
      violations: 0,
      documents: 0,
      amountAtStake: 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: []
    });

    const courtDocsResult = calculatePrice({
      category: 'consumer',
      violations: 0,
      documents: 1,
      amountAtStake: 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: ['court']
    });
    
    expect(courtDocsResult.finalPrice).toBeGreaterThan(noDocsResult.finalPrice);
    expect(courtDocsResult.breakdown.docModifier).toBeGreaterThanOrEqual(100);
  });

  test('high violations count increases complexity significantly', () => {
    const lowViolationsResult = calculatePrice({
      category: 'consumer',
      violations: 1,
      documents: 0,
      amountAtStake: 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: []
    });

    const highViolationsResult = calculatePrice({
      category: 'consumer',
      violations: 6,
      documents: 0,
      amountAtStake: 0,
      strategyLevel: 'basic',
      urgency: 'standard',
      documentTypes: []
    });
    
    expect(highViolationsResult.finalPrice).toBeGreaterThan(lowViolationsResult.finalPrice);
    expect(highViolationsResult.breakdown.complexity).toBeGreaterThanOrEqual(200);
  });

});
