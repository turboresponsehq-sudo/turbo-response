/**
 * Migration: Create case_messages table for client-admin communication
 * This table stores all messages between clients and admins for each case
 */

export async function up(client) {
  console.log('📝 Creating case_messages table...');

  // Create case_messages table
  await client.query(`
    CREATE TABLE IF NOT EXISTS case_messages (
      id SERIAL PRIMARY KEY,
      case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      sender VARCHAR(20) NOT NULL CHECK (sender IN ('client', 'admin')),
      sender_name VARCHAR(255),
      message_text TEXT,
      file_path TEXT,
      file_name VARCHAR(255),
      file_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      CONSTRAINT message_or_file_required CHECK (
        message_text IS NOT NULL OR file_path IS NOT NULL
      )
    );
  `);

  // Create indexes for performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_case_messages_case_id 
    ON case_messages(case_id);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_case_messages_created_at 
    ON case_messages(created_at);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_case_messages_sender 
    ON case_messages(sender);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_case_messages_case_created 
    ON case_messages(case_id, created_at DESC);
  `);

  // Add unread_messages_count to cases table
  await client.query(`
    ALTER TABLE cases 
    ADD COLUMN IF NOT EXISTS unread_messages_count INTEGER DEFAULT 0;
  `);

  console.log('✅ case_messages table created successfully');
}

export async function down(client) {
  console.log('🗑️ Dropping case_messages table...');
  
  await client.query('DROP TABLE IF EXISTS case_messages CASCADE;');
  await client.query('ALTER TABLE cases DROP COLUMN IF EXISTS unread_messages_count;');
  
  console.log('✅ case_messages table dropped');
}
