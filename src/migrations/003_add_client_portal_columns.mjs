/**
 * Migration: Add client portal columns to cases table
 * Date: 2025-11-19
 */

export const id = '003_add_client_portal_columns';

export async function up(db) {
  console.log('[MIGRATION 003] Adding client portal columns to cases table...');
  
  try {
    // Add columns if they don't exist
    await db.query(`
      ALTER TABLE cases
      ADD COLUMN IF NOT EXISTS client_status VARCHAR(100),
      ADD COLUMN IF NOT EXISTS client_notes TEXT,
      ADD COLUMN IF NOT EXISTS payment_link VARCHAR(500),
      ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT TRUE;
    `);
    
    console.log('[MIGRATION 003] ✅ Columns added successfully');
    
    // Create index for faster lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cases_portal_enabled ON cases(portal_enabled);
    `);
    
    console.log('[MIGRATION 003] ✅ Index created successfully');
    
    // Set default values for existing cases
    await db.query(`
      UPDATE cases 
      SET portal_enabled = TRUE 
      WHERE portal_enabled IS NULL;
    `);
    
    await db.query(`
      UPDATE cases 
      SET client_status = 'Under Review' 
      WHERE client_status IS NULL;
    `);
    
    console.log('[MIGRATION 003] ✅ Default values set for existing cases');
    console.log('[MIGRATION 003] Migration completed successfully');
    
  } catch (error) {
    console.error('[MIGRATION 003] ❌ Migration failed:', error);
    throw error;
  }
}

export async function down(db) {
  console.log('[MIGRATION 003] Rolling back client portal columns...');
  
  try {
    await db.query(`
      DROP INDEX IF EXISTS idx_cases_portal_enabled;
    `);
    
    await db.query(`
      ALTER TABLE cases
      DROP COLUMN IF EXISTS client_status,
      DROP COLUMN IF EXISTS client_notes,
      DROP COLUMN IF EXISTS payment_link,
      DROP COLUMN IF EXISTS portal_enabled;
    `);
    
    console.log('[MIGRATION 003] ✅ Rollback completed successfully');
  } catch (error) {
    console.error('[MIGRATION 003] ❌ Rollback failed:', error);
    throw error;
  }
}
