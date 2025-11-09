import { config } from 'dotenv';
config();

const submissionId = 4; // Real Analysis Test submission

console.log(`Testing blueprint generation for submission ID: ${submissionId}`);

const response = await fetch('http://localhost:3000/api/trpc/turboIntake.generateBlueprint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    submissionId
  })
});

const result = await response.json();
console.log('Response:', JSON.stringify(result, null, 2));

