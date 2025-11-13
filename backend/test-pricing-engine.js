/**
 * Pricing Engine Test Script
 * Tests the updated AI pricing engine with 4 scenarios
 */

require('dotenv').config();
const { generateComprehensiveAnalysis } = require('./src/services/aiAnalysis');

const testScenarios = [
  {
    name: "Simple Debt Case",
    caseData: {
      category: "debt",
      caseDescription: "I'm being harassed by a debt collector calling me 5+ times per day about a debt I don't recognize. They won't provide validation when I ask. The calls started 2 weeks ago.",
      amount: 1200,
      uploadedFiles: []
    }
  },
  {
    name: "Complex Eviction Case",
    caseData: {
      category: "eviction",
      caseDescription: "My landlord served me an eviction notice without proper 30-day notice. The apartment has had a broken heater for 3 months (reported multiple times), mold in the bathroom, and a leaking roof. I have photos, repair requests, and text messages. The landlord is also trying to charge me for 'damages' that existed before I moved in. I have my move-in inspection report. Eviction hearing is in 15 days.",
      amount: 15000,
      uploadedFiles: ["photo1.jpg", "photo2.jpg", "photo3.jpg", "move-in-report.pdf", "repair-requests.pdf"]
    }
  },
  {
    name: "Urgent Repossession Case",
    caseData: {
      category: "auto",
      caseDescription: "My car was repossessed yesterday without any prior notice. I was only 2 payments behind and was never sent a notice of default or right to cure. The lender is now demanding $8,500 to get my car back, which includes repo fees, storage fees, and 'processing fees' that seem excessive. I need my car for work and have a job interview in 3 days. The lender is threatening to sell the car at auction in 10 days.",
      amount: 8500,
      uploadedFiles: ["loan-agreement.pdf", "payment-history.pdf"]
    }
  },
  {
    name: "Multi-Agency Compliance Case",
    caseData: {
      category: "consumer",
      caseDescription: "I'm dealing with multiple violations: (1) A debt collector is calling my workplace despite being told not to, (2) A credit bureau is reporting a debt that was discharged in bankruptcy 2 years ago, (3) The original creditor sold my debt without notifying me, (4) I'm receiving robocalls on my cell phone without consent, (5) The debt collector threatened to garnish my wages illegally, (6) They're reporting inaccurate information to all 3 credit bureaus. I have documentation of everything including call logs, credit reports, bankruptcy discharge papers, and recorded voicemails. This has been ongoing for 6 months and has caused me to be denied for a mortgage.",
      amount: 25000,
      uploadedFiles: ["call-logs.pdf", "credit-reports.pdf", "bankruptcy-discharge.pdf", "voicemails.mp3", "mortgage-denial.pdf", "correspondence.pdf"]
    }
  }
];

async function runTests() {
  console.log('🧪 PRICING ENGINE TEST SUITE\n');
  console.log('Testing updated pricing ranges: $149-$3,000+\n');
  console.log('='.repeat(80));
  console.log('');

  for (const scenario of testScenarios) {
    console.log(`\n📋 TEST: ${scenario.name}`);
    console.log('-'.repeat(80));
    console.log(`Category: ${scenario.caseData.category}`);
    console.log(`Amount: $${scenario.caseData.amount}`);
    console.log(`Documents: ${scenario.caseData.uploadedFiles.length}`);
    console.log(`Description: ${scenario.caseData.caseDescription.substring(0, 100)}...`);
    console.log('');

    try {
      const analysis = await generateComprehensiveAnalysis(scenario.caseData);
      
      console.log('✅ ANALYSIS RESULTS:');
      console.log('');
      console.log(`🎯 Case Sophistication: ${analysis.case_sophistication || 'N/A'}`);
      console.log(`💰 Pricing Suggestion: $${analysis.pricing_suggestion}`);
      console.log(`📊 Success Probability: ${(analysis.success_probability * 100).toFixed(0)}%`);
      console.log(`⚠️  Urgency Level: ${analysis.urgency_level}`);
      console.log(`💵 Estimated Case Value: $${analysis.estimated_value}`);
      console.log('');
      
      if (analysis.pricing_factors) {
        console.log('📈 PRICING BREAKDOWN:');
        console.log(`   Base Price: $${analysis.pricing_factors.base_price}`);
        console.log(`   Violations Multiplier: ${analysis.pricing_factors.violations_multiplier}x`);
        console.log(`   Urgency Multiplier: ${analysis.pricing_factors.urgency_multiplier}x`);
        console.log(`   Document Factor: ${analysis.pricing_factors.document_factor}x`);
        console.log(`   Strategy Complexity: ${analysis.pricing_factors.strategy_complexity}x`);
        console.log(`   Final Price: $${analysis.pricing_factors.final_price}`);
        console.log('');
      }
      
      console.log(`🔍 Violations Found: ${analysis.violations.length}`);
      analysis.violations.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v}`);
      });
      console.log('');
      
      console.log(`⚖️  Laws Cited: ${analysis.laws_cited.length}`);
      analysis.laws_cited.forEach((l, i) => {
        console.log(`   ${i + 1}. ${l}`);
      });
      console.log('');
      
      console.log(`📝 Recommended Actions: ${analysis.recommended_actions.length}`);
      analysis.recommended_actions.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a}`);
      });
      console.log('');
      
      console.log(`📄 Summary: ${analysis.summary}`);
      console.log('');
      
      // Verify pricing constraints
      if (analysis.pricing_suggestion < 149) {
        console.log('❌ PRICING ERROR: Price below $149 minimum!');
      } else if (analysis.pricing_suggestion >= 149 && analysis.pricing_suggestion <= 799) {
        console.log('✅ PRICING VALID: Standard range ($149-$799)');
      } else if (analysis.pricing_suggestion >= 800 && analysis.pricing_suggestion <= 1499) {
        console.log('✅ PRICING VALID: Complex range ($800-$1,499)');
      } else if (analysis.pricing_suggestion >= 1500) {
        console.log('✅ PRICING VALID: Extreme range ($1,500-$3,000+)');
      }
      
      console.log('');
      console.log(`💸 AI Cost: ${analysis._usage?.tokens || 0} tokens = $${(analysis._usage?.cost || 0).toFixed(4)}`);
      
    } catch (error) {
      console.log('❌ TEST FAILED:', error.message);
    }
    
    console.log('');
    console.log('='.repeat(80));
  }
  
  console.log('\n✅ TEST SUITE COMPLETE\n');
}

// Run tests
runTests().catch(console.error);
