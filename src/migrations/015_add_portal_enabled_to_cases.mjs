/**
 * Migration: Add portal_enabled field to cases table
 * Purpose: Enable/disable client portal access per case
 */

export async function up(connection) {
  console.log('🔄 Adding portal_enabled column to cases table...');
  
  await connection.query(`
    ALTER TABLE cases 
    ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT FALSE;
  `);
  
  console.log('✅ portal_enabled column added successfully');
}

export async function down(connection) {
  console.log('🔄 Removing portal_enabled column from cases table...');
  await connection.query(`
    ALTER TABLE cases 
    DROP COLUMN IF EXISTS portal_enabled;
  `);
  console.log('✅ portal_enabled column removed');
}
