const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');
const logger = require('../utils/logger');

// One-time route to create admin_cases table
router.get('/create-admin-cases-table', async (req, res) => {
  try {
    logger.info('Creating admin_cases table...');

    // Create the table
    await query(`
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

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_admin_cases_category ON admin_cases(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_admin_cases_status ON admin_cases(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_admin_cases_created_at ON admin_cases(created_at);`);

    logger.info('✅ admin_cases table created successfully');

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Table Created</title>
        <style>
          body { font-family: Arial; padding: 40px; background: #0f172a; color: white; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 10px; }
          h1 { color: #10b981; }
          a { display: inline-block; padding: 15px 30px; background: #06b6d4; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ admin_cases Table Created!</h1>
          <p>The database table has been created successfully.</p>
          <p>You can now access the admin dashboard.</p>
          <a href="/admin">Go to Admin Dashboard</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    logger.error('Failed to create admin_cases table:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial; padding: 40px; background: #0f172a; color: white; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 10px; }
          h1 { color: #ef4444; }
          pre { background: #334155; padding: 15px; border-radius: 5px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error Creating Table</h1>
          <pre>${error.message}\n\n${error.stack}</pre>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;
