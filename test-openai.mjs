import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('Testing OpenAI API connectivity...');

try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say "API key is working!" if you can read this.' }
    ],
    max_tokens: 20
  });
  
  console.log('✅ SUCCESS!');
  console.log('Response:', completion.choices[0].message.content);
  console.log('Model:', completion.model);
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}
