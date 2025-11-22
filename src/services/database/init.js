const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const logger = require('../../utils/logger');

// Initialize database schema
const initDatabase = async () => {
  try {
    logger.info('Initializing database schema...');

    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    // Check if schema file exists (it won't exist in production bundle)
    if (!fs.existsSync(schemaPath)) {
      logger.info('⚠️ schema.sql not found - skipping initialization (database already set up)');
      return;
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    logger.info('✅ Database schema initialized successfully');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initDatabase };
