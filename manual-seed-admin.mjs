#!/usr/bin/env node

/**
 * Manual Admin Account Seeding Script
 * Run this if the automatic seeding fails
 * 
 * Usage:
 *   node manual-seed-admin.mjs
 * 
 * This script will:
 * 1. Connect to the database using DATABASE_URL
 * 2. Check if admin account exists
 * 3. Create or update admin account with credentials:
 *    - Email: turboresponsehq@gmail.com
 *    - Password: Turbo1234!
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const adminEmail = 'turboresponsehq@gmail.com';
const adminPassword = 'Turbo1234!';

async function seedAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Seeding admin account...');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    
    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed');
    
    // Check if admin exists
    const checkResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('🔄 Admin account exists - updating password...');
      
      const updateResult = await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email, role',
        [passwordHash, adminEmail]
      );
      
      console.log('✅ Admin password updated successfully');
      console.log('👤 Admin account:', updateResult.rows[0]);
    } else {
      console.log('🆕 Creating new admin account...');
      
      const insertResult = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, email, role, created_at`,
        [adminEmail, passwordHash, 'Admin', 'admin']
      );
      
      console.log('✅ Admin account created successfully');
      console.log('👤 Admin account:', insertResult.rows[0]);
    }
    
    console.log('\n✅ SUCCESS! Admin account is ready.');
    console.log('\n📝 Login with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('❌ Error seeding admin account:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    await pool.end();
  }
}

seedAdmin();
