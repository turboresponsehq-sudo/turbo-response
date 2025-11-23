/**
 * Migration: Create cases table
 * Purpose: Add missing cases table for Case File Upload Center
 */

export async function up(connection) {
  console.log('🔄 Creating cases table...');
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      description TEXT,
      client_name VARCHAR(255),
      client_email VARCHAR(255),
      client_phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  
  console.log('✅ Cases table created successfully');
}

export async function down(connection) {
  console.log('🔄 Dropping cases table...');
  await connection.execute('DROP TABLE IF EXISTS cases');
  console.log('✅ Cases table dropped');
}
