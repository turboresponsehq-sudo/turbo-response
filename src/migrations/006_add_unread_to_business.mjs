/**
 * Migration: Add unread_messages_count to business_intakes table
 * Date: 2025-01-26
 * Purpose: Enable messaging system for business clients
 */

export async function up(client) {
  console.log('[MIGRATION 006] Adding unread_messages_count to business_intakes...');
  
  await client.query(`
    ALTER TABLE business_intakes
    ADD COLUMN IF NOT EXISTS unread_messages_count INTEGER DEFAULT 0;
  `);
  
  console.log('[MIGRATION 006] ✅ Column added successfully');
}

export async function down(client) {
  console.log('[MIGRATION 006] Rolling back unread_messages_count from business_intakes...');
  
  await client.query(`
    ALTER TABLE business_intakes
    DROP COLUMN IF EXISTS unread_messages_count;
  `);
  
  console.log('[MIGRATION 006] ✅ Rollback complete');
}
