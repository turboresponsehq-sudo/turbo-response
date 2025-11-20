/**
 * Migration: Payment-Gated Client Portal System
 * Date: 2025-11-19
 * 
 * Adds funnel stages, payment tracking, and timeline system
 */

export const id = '004_payment_gated_portal';

export async function up(db) {
  console.log('[MIGRATION 004] Adding payment-gated portal columns...');
  
  try {
    // Add funnel stage tracking
    await db.query(`
      ALTER TABLE cases
      ADD COLUMN IF NOT EXISTS funnel_stage VARCHAR(50) DEFAULT 'Lead Submitted',
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
      ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS payment_verified_by INTEGER,
      ADD COLUMN IF NOT EXISTS client_account_created BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS client_user_id INTEGER;
    `);
    
    console.log('[MIGRATION 004] ✅ Funnel stage columns added');
    
    // Create case timeline table
    await db.query(`
      CREATE TABLE IF NOT EXISTS case_timeline (
        id SERIAL PRIMARY KEY,
        case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        metadata JSONB
      );
    `);
    
    console.log('[MIGRATION 004] ✅ Case timeline table created');
    
    // Create indexes for performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cases_funnel_stage ON cases(funnel_stage);
      CREATE INDEX IF NOT EXISTS idx_cases_payment_verified ON cases(payment_verified);
      CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON case_timeline(case_id);
      CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON case_timeline(created_at DESC);
    `);
    
    console.log('[MIGRATION 004] ✅ Indexes created');
    
    // Set default funnel stage for existing cases based on old status
    await db.query(`
      UPDATE cases 
      SET funnel_stage = CASE
        WHEN status = 'Completed' THEN 'Active Case'
        WHEN status = 'In Review' THEN 'Active Case'
        WHEN status = 'Awaiting Client' THEN 'Awaiting Payment'
        ELSE 'Lead Submitted'
      END
      WHERE funnel_stage IS NULL OR funnel_stage = 'Lead Submitted';
    `);
    
    console.log('[MIGRATION 004] ✅ Default funnel stages set for existing cases');
    
    // Create initial timeline events for existing cases
    await db.query(`
      INSERT INTO case_timeline (case_id, event_type, description, created_at)
      SELECT id, 'case_created', 'Case submitted via intake form', created_at
      FROM cases
      WHERE NOT EXISTS (
        SELECT 1 FROM case_timeline WHERE case_timeline.case_id = cases.id
      );
    `);
    
    console.log('[MIGRATION 004] ✅ Initial timeline events created');
    console.log('[MIGRATION 004] Migration completed successfully');
    
  } catch (error) {
    console.error('[MIGRATION 004] ❌ Migration failed:', error);
    throw error;
  }
}

export async function down(db) {
  console.log('[MIGRATION 004] Rolling back payment-gated portal...');
  
  try {
    // Drop indexes
    await db.query(`
      DROP INDEX IF EXISTS idx_cases_funnel_stage;
      DROP INDEX IF EXISTS idx_cases_payment_verified;
      DROP INDEX IF EXISTS idx_timeline_case_id;
      DROP INDEX IF EXISTS idx_timeline_created_at;
    `);
    
    // Drop timeline table
    await db.query(`
      DROP TABLE IF EXISTS case_timeline;
    `);
    
    // Remove columns
    await db.query(`
      ALTER TABLE cases
      DROP COLUMN IF EXISTS funnel_stage,
      DROP COLUMN IF EXISTS payment_method,
      DROP COLUMN IF EXISTS payment_verified,
      DROP COLUMN IF EXISTS payment_verified_at,
      DROP COLUMN IF EXISTS payment_verified_by,
      DROP COLUMN IF EXISTS client_account_created,
      DROP COLUMN IF EXISTS client_user_id;
    `);
    
    console.log('[MIGRATION 004] ✅ Rollback completed successfully');
  } catch (error) {
    console.error('[MIGRATION 004] ❌ Rollback failed:', error);
    throw error;
  }
}
