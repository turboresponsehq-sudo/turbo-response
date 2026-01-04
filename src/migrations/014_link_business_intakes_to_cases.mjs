/**
 * Migration: Link business_intakes to cases table
 * Date: 2025-01-03
 * Purpose: Add case_id foreign key and missing fields to business_intakes
 * 
 * This migration links business intake submissions to their corresponding case records.
 * All business intakes now create proper case records with case numbers.
 */

export const id = '014_link_business_intakes_to_cases';

export async function up(db) {
  console.log('[MIGRATION 014] Adding case_id and missing fields to business_intakes...');
  
  try {
    // Add missing columns if they don't exist
    await db.query(`
      ALTER TABLE business_intakes
      ADD COLUMN IF NOT EXISTS case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS link_in_bio VARCHAR(500),
      ADD COLUMN IF NOT EXISTS estimated_amount VARCHAR(100),
      ADD COLUMN IF NOT EXISTS case_description TEXT,
      ADD COLUMN IF NOT EXISTS primary_goal TEXT,
      ADD COLUMN IF NOT EXISTS target_authority TEXT,
      ADD COLUMN IF NOT EXISTS stage VARCHAR(100),
      ADD COLUMN IF NOT EXISTS deadline DATE;
    `);
    
    console.log('[MIGRATION 014] ✅ Columns added successfully');
    
    // Create index for case_id lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_business_intakes_case_id 
      ON business_intakes(case_id);
    `);
    
    console.log('[MIGRATION 014] ✅ Index created for case_id');
    console.log('[MIGRATION 014] Migration completed successfully');
    
  } catch (error) {
    console.error('[MIGRATION 014] ❌ Migration failed:', error);
    throw error;
  }
}

export async function down(db) {
  console.log('[MIGRATION 014] Rolling back business_intakes changes...');
  
  try {
    // Drop index
    await db.query(`
      DROP INDEX IF EXISTS idx_business_intakes_case_id;
    `);
    
    // Remove columns
    await db.query(`
      ALTER TABLE business_intakes
      DROP COLUMN IF EXISTS case_id,
      DROP COLUMN IF EXISTS link_in_bio,
      DROP COLUMN IF EXISTS estimated_amount,
      DROP COLUMN IF EXISTS case_description,
      DROP COLUMN IF EXISTS primary_goal,
      DROP COLUMN IF EXISTS target_authority,
      DROP COLUMN IF EXISTS stage,
      DROP COLUMN IF EXISTS deadline;
    `);
    
    console.log('[MIGRATION 014] ✅ Rollback completed successfully');
  } catch (error) {
    console.error('[MIGRATION 014] ❌ Rollback failed:', error);
    throw error;
  }
}
