/**
 * Migration: Create screenshots table (PostgreSQL)
 * Purpose: Store uploaded screenshots with metadata for admin research
 */

export async function up(connection) {
  console.log('🔄 Creating screenshots table...');
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS screenshots (
      id SERIAL PRIMARY KEY,
      file_url TEXT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      research_notes TEXT,
      mime_type VARCHAR(100) NOT NULL,
      file_size INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_screenshots_created_at ON screenshots(created_at DESC);
  `);
  
  console.log('✅ screenshots table created successfully');
}

export async function down(connection) {
  console.log('🔄 Dropping screenshots table...');
  await connection.query('DROP TABLE IF EXISTS screenshots CASCADE');
  console.log('✅ screenshots table dropped');
}
