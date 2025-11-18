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
