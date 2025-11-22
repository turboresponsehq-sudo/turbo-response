/**
 * Migration: Change pricing_suggestion and estimated_value to TEXT
 * 
 * Reason: AI returns explanatory text like "$0-$1,000 (statutory damages...)"
 *         which cannot be stored in numeric columns
 * 
 * Changes:
 *   - pricing_suggestion: numeric → text
 *   - estimated_value: numeric → text
 */

import pkg from 'pg';
const { Client } = pkg;

export async function up(client) {
  console.log('🔄 Running migration: Change pricing fields to TEXT...');
  
  // Change pricing_suggestion to text
  await client.query(`
    ALTER TABLE case_analyses 
    ALTER COLUMN pricing_suggestion 
    TYPE text 
    USING pricing_suggestion::text;
  `);
  console.log('✅ Changed pricing_suggestion to TEXT');
  
  // Change estimated_value to text
  await client.query(`
    ALTER TABLE case_analyses 
    ALTER COLUMN estimated_value 
    TYPE text 
    USING estimated_value::text;
  `);
  console.log('✅ Changed estimated_value to TEXT');
  
  // Verify
  const result = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'case_analyses' 
    AND column_name IN ('pricing_suggestion', 'estimated_value');
  `);
  console.log('✅ Verified column types:', result.rows);
}

export async function down(client) {
  console.log('🔄 Rolling back: Restore numeric types...');
  
  await client.query(`
    ALTER TABLE case_analyses 
    ALTER COLUMN pricing_suggestion 
    TYPE numeric 
    USING CASE 
      WHEN pricing_suggestion ~ '^[0-9.]+$' THEN pricing_suggestion::numeric 
      ELSE NULL 
    END;
  `);
  
  await client.query(`
    ALTER TABLE case_analyses 
    ALTER COLUMN estimated_value 
    TYPE numeric 
    USING CASE 
      WHEN estimated_value ~ '^[0-9.]+$' THEN estimated_value::numeric 
      ELSE NULL 
    END;
  `);
  console.log('✅ Restored numeric types');
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
