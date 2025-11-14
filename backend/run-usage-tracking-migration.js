#!/usr/bin/env node

/**
 * AI Usage Tracking Migration Runner
 * 
 * Executes add_usage_tracking.sql migration on production database
 * Creates ai_usage_logs and admin_settings tables
 * 
 * Usage:
 *   node backend/run-usage-tracking-migration.js
 * 
 * Requirements:
 *   - DATABASE_URL environment variable must be set
 *   - PostgreSQL database must be accessible
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting AI Usage Tracking Migration...\n');

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set');
    console.error('   Please set DATABASE_URL before running this script.\n');
    process.exit(1);
  }

  // Read migration file
  const migrationPath = path.join(__dirname, 'migrations', 'add_usage_tracking.sql');
  
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

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ai_usage_logs', 'admin_settings')
      ORDER BY table_name
    `);

    if (checkTables.rows.length === 2) {
      console.log('✅ Tables verified:');
      checkTables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      console.log('');
    } else {
      console.warn('⚠️  Warning: Expected 2 tables, found ' + checkTables.rows.length);
    }

    // Check admin_settings default values
    const checkSettings = await client.query(`
      SELECT setting_key, setting_value 
      FROM admin_settings 
      ORDER BY setting_key
    `);

    console.log('✅ Admin settings initialized:');
    checkSettings.rows.forEach(row => {
      console.log(`   - ${row.setting_key}: ${row.setting_value || 'NULL'}`);
    });
    console.log('');

    console.log('🎉 Migration completed successfully!');
    console.log('   The backend should now start without errors.\n');

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === '42P07') {
      console.log('\n⚠️  Tables already exist. This is safe to ignore.');
      console.log('   The migration has already been run previously.\n');
      process.exit(0);
    }
    
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
