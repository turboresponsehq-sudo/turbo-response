const bcrypt = require('bcryptjs');

const password = 'Admin123!';
bcrypt.hash(password, 10).then(hash => {
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('\nSQL Command:');
  console.log(`INSERT INTO users (email, password_hash, full_name, role)`);
  console.log(`VALUES ('turboresponsehq@gmail.com', '${hash}', 'Admin', 'admin')`);
  console.log(`ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin';`);
});
