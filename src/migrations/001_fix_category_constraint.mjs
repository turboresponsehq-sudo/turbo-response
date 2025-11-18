/**
 * Migration: Fix category constraint to match frontend intake form
 * 
 * Changes category constraint from:
 *   ('eviction', 'debt_collection', 'irs_tax', 'other')
 * To:
 *   ('eviction', 'debt', 'irs', 'wage', 'medical', 'benefits', 'auto', 'consumer')
 */

import pkg from 'pg';
const { Client } = pkg;

export async function up(client) {
  console.log('🔄 Running migration: Fix category constraint...');
  
  // Drop old constraint
  await client.query(`
    ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_category_check;
  `);
  console.log('✅ Dropped old constraint');
  
  // Add new constraint with all 8 categories
  await client.query(`
    ALTER TABLE cases
    ADD CONSTRAINT cases_category_check
    CHECK (category IN (
      'eviction',
      'debt',
      'irs',
      'wage',
      'medical',
      'benefits',
      'auto',
      'consumer'
    ));
  `);
  console.log('✅ Added new constraint with 8 categories');
  
  // Verify
  const result = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) as definition
    FROM pg_constraint
    WHERE conrelid = 'cases'::regclass
    AND conname = 'cases_category_check';
  `);
  console.log('✅ Verified constraint:', result.rows[0]?.definition);
}

export async function down(client) {
  console.log('🔄 Rolling back: Restore old category constraint...');
  
  await client.query(`
    ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_category_check;
  `);
  
  await client.query(`
    ALTER TABLE cases
    ADD CONSTRAINT cases_category_check
    CHECK (category IN ('eviction', 'debt_collection', 'irs_tax', 'other'));
  `);
  console.log('✅ Restored old constraint');
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const client = new Client({
    connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    await up(client);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
