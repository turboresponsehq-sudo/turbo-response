const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'Admin123!';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL to run in your database:');
  console.log(`
DELETE FROM users WHERE email = 'turboresponsehq@gmail.com';

INSERT INTO users (email, password, role, name, created_at, updated_at) 
VALUES (
  'turboresponsehq@gmail.com',
  '${hash}',
  'admin',
  'Admin',
  NOW(),
  NOW()
);
  `);
}

generateHash();
