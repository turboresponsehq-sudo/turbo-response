/**
 * Migration: Create business_intakes table for business audit clients
 * Date: 2025-01-26
 * Purpose: Store business intake form submissions separate from consumer cases
 */

export async function up(client) {
  console.log('📝 Creating business_intakes table...');

  // Create business_intakes table
  await client.query(`
    CREATE TABLE IF NOT EXISTS business_intakes (
      id SERIAL PRIMARY KEY,
      business_name VARCHAR(255),
      website_url VARCHAR(500),
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      what_you_sell TEXT,
      ideal_customer TEXT,
      biggest_struggle TEXT,
      short_term_goal TEXT,
      long_term_vision TEXT,
      instagram_url VARCHAR(500),
      tiktok_url VARCHAR(500),
      facebook_url VARCHAR(500),
      youtube_url VARCHAR(500),
      linkinbio_url VARCHAR(500),
      status VARCHAR(50) DEFAULT 'New',
      portal_enabled BOOLEAN DEFAULT FALSE,
      unread_messages_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_business_intakes_email 
    ON business_intakes(email);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_business_intakes_business_name 
    ON business_intakes(business_name);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_business_intakes_created_at 
    ON business_intakes(created_at DESC);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_business_intakes_status 
    ON business_intakes(status);
  `);

  console.log('✅ business_intakes table created successfully');
}

export async function down(client) {
  console.log('🗑️ Dropping business_intakes table...');
  
  await client.query('DROP TABLE IF EXISTS business_intakes CASCADE;');
  
  console.log('✅ business_intakes table dropped');
}
