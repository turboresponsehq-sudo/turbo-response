const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');

/**
 * Drizzle ORM database connection for MySQL
 * Used for type-safe database operations with the schema defined in drizzle/schema.ts
 */

let db = null;
let connection = null;

/**
 * Get or create Drizzle database instance
 * @returns {Promise<import('drizzle-orm/mysql2').MySql2Database>}
 */
async function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      console.warn('[DRIZZLE] DATABASE_URL not found - database operations will fail');
      return null;
    }

    try {
      // Create MySQL connection pool
      connection = await mysql.createPool(process.env.DATABASE_URL);
      
      // Initialize Drizzle with the connection
      db = drizzle(connection);
      
      console.log('[DRIZZLE] Database connection initialized successfully');
    } catch (error) {
      console.error('[DRIZZLE] Failed to initialize database:', error.message);
      return null;
    }
  }

  return db;
}

/**
 * Close database connection (for graceful shutdown)
 */
async function closeDb() {
  if (connection) {
    await connection.end();
    db = null;
    connection = null;
    console.log('[DRIZZLE] Database connection closed');
  }
}

module.exports = {
  getDb,
  closeDb
};
