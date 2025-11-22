/**
 * Migration: Add Terms of Service acceptance tracking
 * Purpose: Store proof of client agreement to terms for chargeback protection
 */

export async function up(db) {
  console.log('📝 Adding terms acceptance tracking columns...');
  
  await db.query(`
    ALTER TABLE cases 
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS terms_accepted_ip VARCHAR(45);
  `);
  
  console.log('✅ Terms acceptance tracking columns added');
}

export async function down(db) {
  console.log('🔄 Removing terms acceptance tracking columns...');
  
  await db.query(`
    ALTER TABLE cases 
    DROP COLUMN IF EXISTS terms_accepted_at,
    DROP COLUMN IF EXISTS terms_accepted_ip;
  `);
  
  console.log('✅ Terms acceptance tracking columns removed');
}
