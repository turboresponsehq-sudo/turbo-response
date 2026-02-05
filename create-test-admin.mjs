import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

async function createTestAdmin() {
  try {
    // Hash password
    const password = 'TestAdmin123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Password hash generated:', hashedPassword);
    
    // Connect to database
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);
    
    // Insert test admin user
    const email = 'test-admin@turboresponse.test';
    await connection.execute(
      `INSERT INTO users (email, name, password, role, createdAt, updatedAt, lastSignedIn) 
       VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())
       ON DUPLICATE KEY UPDATE password = ?, role = 'admin'`,
      [email, 'Test Admin', hashedPassword, 'admin', hashedPassword]
    );
    
    console.log('✅ Test admin user created successfully');
    console.log('Email:', email);
    console.log('Password:', password);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    process.exit(1);
  }
}

createTestAdmin();
