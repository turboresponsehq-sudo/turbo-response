import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('🧠 Testing OpenAI Reasoning Capabilities...\n');

const testPrompt = `You are analyzing a consumer rights case. Here's the scenario:

A debt collector called Sarah 8 times in one day, threatened to garnish her wages without a court order, and refused to provide written verification of the debt when requested.

Task: Identify which federal laws were violated and explain the violations briefly.`;

try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { 
        role: 'system', 
        content: 'You are a legal AI assistant specializing in consumer protection laws. Provide concise, accurate analysis.' 
      },
      { 
        role: 'user', 
        content: testPrompt 
      }
    ],
    max_tokens: 300
  });
  
  console.log('✅ API CONNECTION: SUCCESS\n');
  console.log('📊 Model Used:', completion.model);
  console.log('💭 Tokens Used:', completion.usage.total_tokens);
  console.log('\n🎯 AI REASONING RESPONSE:\n');
  console.log(completion.choices[0].message.content);
  console.log('\n✅ REASONING TEST: PASSED');
  
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  if (error.status) {
    console.error('Status Code:', error.status);
  }
  process.exit(1);
}
