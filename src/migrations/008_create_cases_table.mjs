/**
 * Migration: Create cases table (PostgreSQL version)
 * Purpose: Add missing cases table for Case File Upload Center
 */

export async function up(connection) {
  console.log('🔄 Creating cases table...');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS cases (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      description TEXT,
      client_name VARCHAR(255),
      client_email VARCHAR(255),
      client_phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes separately (Postgres-compatible)
  await connection.query(`CREATE INDEX IF NOT EXISTS idx_category ON cases (category);`);
  await connection.query(`CREATE INDEX IF NOT EXISTS idx_status ON cases (status);`);
  await connection.query(`CREATE INDEX IF NOT EXISTS idx_created_at ON cases (created_at);`);

  console.log('✅ Cases table created successfully');
}

export async function down(connection) {
  console.log('🔄 Dropping cases table...');
  await connection.query('DROP TABLE IF EXISTS cases;');
  console.log('✅ Cases table dropped');
}
