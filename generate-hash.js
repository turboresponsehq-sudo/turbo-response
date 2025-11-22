const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 10;
  
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('\n=== BCRYPT HASH FOR admin123 ===');
  console.log(hash);
  console.log('\n=== SQL UPDATE COMMAND ===');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'turboresponsehq@gmail.com';`);
  console.log('\n');
}

generateHash().catch(console.error);
