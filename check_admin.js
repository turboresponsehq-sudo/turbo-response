const { query } = require('./src/services/database/db');

async function checkAdmin() {
  try {
    const result = await query(
      "SELECT id, email, role FROM users WHERE email = $1",
      ['turboresponsehq@gmail.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user NOT FOUND');
      console.log('Creating admin user...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await query(
        "INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)",
        ['turboresponsehq@gmail.com', hashedPassword, 'admin', 'Admin']
      );
      
      console.log('✅ Admin user created');
      console.log('Email: turboresponsehq@gmail.com');
      console.log('Password: Admin123!');
    } else {
      console.log('✅ Admin user exists:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      
      // Reset password
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await query(
        "UPDATE users SET password = $1, role = $2 WHERE email = $3",
        [hashedPassword, 'admin', 'turboresponsehq@gmail.com']
      );
      
      console.log('✅ Password reset to: Admin123!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmin();
