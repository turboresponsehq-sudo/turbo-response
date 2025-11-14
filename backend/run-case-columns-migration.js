#!/usr/bin/env node

/**
 * Missing Case Columns Migration Runner
 * 
 * Adds all missing columns to cases table
 * Fixes frontend showing blank fields
 * 
 * Usage:
 *   node backend/run-case-columns-migration.js
 * 
 * Requirements:
 *   - DATABASE_URL environment variable must be set
 *   - PostgreSQL database must be accessible
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting Missing Case Columns Migration...\n');

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set');
    console.error('   Please set DATABASE_URL before running this script.\n');
    process.exit(1);
  }

  // Read migration file
  const migrationPath = path.join(__dirname, 'migrations', 'add_missing_case_columns.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ ERROR: Migration file not found at ${migrationPath}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log(`📄 Loaded migration: ${migrationPath}`);
  console.log(`📏 SQL length: ${migrationSQL.length} characters\n`);

  // Connect to database
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Execute migration
    console.log('⚙️  Executing migration SQL...');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully\n');

    // Verify columns were added
    console.log('🔍 Verifying columns...');
    
    const checkColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cases' 
      AND column_name IN (
        'full_name', 'email', 'phone', 'address', 
        'case_details', 'amount', 'deadline', 'documents',
        'created_at', 'updated_at'
      )
      ORDER BY column_name
    `);

    console.log('✅ Columns verified:');
    checkColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    console.log('');

    if (checkColumns.rows.length === 10) {
      console.log('🎉 All 10 columns exist!');
    } else {
      console.warn(`⚠️  Warning: Expected 10 columns, found ${checkColumns.rows.length}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('   The backend should now return full case data.\n');

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    console.error(`\n   Stack trace:\n${error.stack}\n`);
    process.exit(1);
    
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run migration
runMigration().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
