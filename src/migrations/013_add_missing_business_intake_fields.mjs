/**
 * Migration: Add missing fields to business_intakes table
 * Date: 2025-12-31
 * Purpose: Add estimated_amount, case_description, primary_goal, target_authority, stage, deadline
 */
export async function up(client) {
  console.log('📝 Adding missing fields to business_intakes table...');
  
  // Add estimated_amount column
  await client.query(`
    ALTER TABLE business_intakes 
    ADD COLUMN IF NOT EXISTS estimated_amount VARCHAR(255);
  `);
  
  // Add case_description column
  await client.query(`
    ALTER TABLE business_intakes 
    ADD COLUMN IF NOT EXISTS case_description TEXT;
  `);
  
  // Add primary_goal column
  await client.query(`
    ALTER TABLE business_intakes 
    ADD COLUMN IF NOT EXISTS primary_goal VARCHAR(255);
  `);
  
  // Add target_authority column
  await client.query(`
    ALTER TABLE business_intakes 
    ADD COLUMN IF NOT EXISTS target_authority VARCHAR(255);
  `);
  
  // Add stage column
  await client.query(`
    ALTER TABLE business_intakes 
    ADD COLUMN IF NOT EXISTS stage VARCHAR(255);
  `);
  
  // Add deadline column
  await client.query(`
    ALTER TABLE business_intakes 
    ADD COLUMN IF NOT EXISTS deadline VARCHAR(255);
  `);
  
  console.log('✅ Missing fields added to business_intakes table');
}

export async function down(client) {
  console.log('🗑️ Removing added fields from business_intakes table...');
  
  await client.query('ALTER TABLE business_intakes DROP COLUMN IF EXISTS estimated_amount;');
  await client.query('ALTER TABLE business_intakes DROP COLUMN IF EXISTS case_description;');
  await client.query('ALTER TABLE business_intakes DROP COLUMN IF EXISTS primary_goal;');
  await client.query('ALTER TABLE business_intakes DROP COLUMN IF EXISTS target_authority;');
  await client.query('ALTER TABLE business_intakes DROP COLUMN IF EXISTS stage;');
  await client.query('ALTER TABLE business_intakes DROP COLUMN IF EXISTS deadline;');
  
  console.log('✅ Fields removed from business_intakes table');
}
