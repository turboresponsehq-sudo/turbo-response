import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
config();

// Get submission data
const db = drizzle(process.env.DATABASE_URL);

console.log('Fetching submission ID 4...');

const result = await db.execute(`
  SELECT * FROM turbo_intake_submissions WHERE id = 4 LIMIT 1
`);

if (!result || !result[0] || result[0].length === 0) {
  console.error('Submission not found');
  process.exit(1);
}

const submission = result[0][0];
console.log('Found submission:', submission.businessName);
console.log('Audit generated:', submission.auditGenerated);
console.log('Blueprint generated:', submission.blueprintGenerated);

// Now manually call the OpenAI API
console.log('\nGenerating 5-section blueprint with OpenAI...');

const auditData = {
  businessName: submission.businessName,
  ownerName: submission.ownerName,
  industry: submission.industry,
  whatYouSell: submission.whatYouSell,
  idealCustomer: submission.idealCustomer,
  biggestStruggle: submission.biggestStruggle,
  goal60To90Days: submission.goal60To90Days,
  longTermVision: submission.longTermVision,
  websiteUrl: submission.websiteUrl,
  instagramHandle: submission.instagramHandle,
  facebookUrl: submission.facebookUrl,
  tiktokHandle: submission.tiktokHandle,
  manusAudit: "Audit content placeholder" // We'll use the actual audit if needed
};

const openaiResponse = await fetch(process.env.BUILT_IN_FORGE_API_URL + '/llm/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a business strategist who creates clean, actionable business strategy blueprints.

Your output MUST be in JSON format with EXACTLY 5 sections:
1. executive_summary (5-7 sentences)
2. brand_positioning (short summary)
3. funnel_and_website_strategy (high-level structure)
4. social_strategy (platform-by-platform)
5. thirty_day_plan (week-by-week action steps)

Keep it simple, structured, and actionable. This is for closing business clients.`
      },
      {
        role: 'user',
        content: `Based on the Manus audit below, create a strategic business blueprint.

**Business Data:**
${JSON.stringify(auditData, null, 2)}

**Output MUST be valid JSON with these 5 sections:**

1. **executive_summary**: 5-7 sentences covering:
   - Who the business is
   - Main problems found
   - Main opportunities
   - Big-picture ROI

2. **brand_positioning**: Short summary of:
   - Current brand identity
   - Target audience alignment
   - Positioning weaknesses
   - Messaging recommendations

3. **funnel_and_website_strategy**: High-level plan for:
   - What their website should look like (key sections)
   - Customer journey structure
   - Recommended funnel structure
   - Key CTAs
   - Data collection points
   - Recommended automations

4. **social_strategy**: Platform-by-platform breakdown:
   - Content themes that attract their audience
   - Content types that convert
   - Posting frequency
   - Brand voice

5. **thirty_day_plan**: Week-by-week action steps:
   - Week 1: Fix foundational issues
   - Week 2: Website/funnel changes
   - Week 3: Content rollout
   - Week 4: Automations + data tracking

Return ONLY the JSON object. No markdown, no extra text.`
      }
    ]
  })
});

const openaiResult = await openaiResponse.json();
console.log('\nOpenAI Response:');
console.log(JSON.stringify(openaiResult, null, 2));

if (openaiResult.choices && openaiResult.choices[0]) {
  const blueprintContent = openaiResult.choices[0].message.content;
  console.log('\n=== GENERATED BLUEPRINT ===');
  console.log(blueprintContent);
  
  try {
    const parsed = JSON.parse(blueprintContent);
    console.log('\n✅ Valid JSON with sections:');
    console.log('- executive_summary:', parsed.executive_summary ? '✓' : '✗');
    console.log('- brand_positioning:', parsed.brand_positioning ? '✓' : '✗');
    console.log('- funnel_and_website_strategy:', parsed.funnel_and_website_strategy ? '✓' : '✗');
    console.log('- social_strategy:', parsed.social_strategy ? '✓' : '✗');
    console.log('- thirty_day_plan:', parsed.thirty_day_plan ? '✓' : '✗');
  } catch (e) {
    console.error('\n❌ Invalid JSON:', e.message);
  }
}

