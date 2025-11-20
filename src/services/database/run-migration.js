/**
 * Run database migration
 * Usage: node src/services/database/run-migration.js 004_create_case_messages.sql
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function runMigration(filename) {
  const migrationPath = path.join(__dirname, 'migrations', filename);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`📦 Running migration: ${filename}`);
  
  try {
    await pool.query(sql);
    console.log(`✅ Migration completed successfully: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

const migrationFile = process.argv[2] || '004_create_case_messages.sql';
runMigration(migrationFile);
