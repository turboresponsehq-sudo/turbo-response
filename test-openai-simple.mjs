import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

console.log('API Key format check:');
console.log('- Starts with:', apiKey.substring(0, 10) + '...');
console.log('- Length:', apiKey.length);
console.log('- Format:', apiKey.startsWith('sk-proj-') ? 'Project key ✓' : 'Legacy key');

const openai = new OpenAI({ apiKey });

console.log('\nTesting API connectivity...');

try {
  // Simpler test - just list models
  const models = await openai.models.list();
  console.log('✅ SUCCESS! API key is valid');
  console.log('Available models:', models.data.length);
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR:', error.status, error.message);
  if (error.status === 401) {
    console.error('\nPossible causes:');
    console.error('1. Key not fully activated yet (wait 1-2 minutes)');
    console.error('2. Key has been revoked');
    console.error('3. Insufficient permissions on the key');
  }
  process.exit(1);
}
