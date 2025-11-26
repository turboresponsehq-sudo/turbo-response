/**
 * Migration: Remove foreign key constraint from case_messages table
 * Date: 2025-01-26
 * Purpose: Allow messages for both consumer cases (cases table) AND business cases (business_intakes table)
 * 
 * The original FK constraint only allowed messages for cases in the cases table,
 * preventing business clients from using the messaging system.
 */

export async function up(client) {
  console.log('📝 Removing foreign key constraint from case_messages...');

  // Drop the foreign key constraint
  await client.query(`
    ALTER TABLE case_messages 
    DROP CONSTRAINT IF EXISTS case_messages_case_id_fkey;
  `);

  console.log('✅ Foreign key constraint removed - messages now work for both consumer and business cases');
}

export async function down(client) {
  console.log('🗑️ Re-adding foreign key constraint to case_messages...');
  
  // Re-add the foreign key constraint (only if rolling back)
  await client.query(`
    ALTER TABLE case_messages 
    ADD CONSTRAINT case_messages_case_id_fkey 
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;
  `);
  
  console.log('✅ Foreign key constraint restored');
}
