/**
 * Migration: Create admin_cases table (PostgreSQL)
 * Purpose: Admin personal case management system (separate from consumer intake)
 */

export async function up(connection) {
  console.log('🔄 Creating admin_cases table...');
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS admin_cases (
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
  
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_cases_category ON admin_cases(category);
  `);
  
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_cases_status ON admin_cases(status);
  `);
  
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_cases_created_at ON admin_cases(created_at);
  `);
  
  console.log('✅ admin_cases table created successfully');
}

export async function down(connection) {
  console.log('🔄 Dropping admin_cases table...');
  await connection.query('DROP TABLE IF EXISTS admin_cases CASCADE');
  console.log('✅ admin_cases table dropped');
}
