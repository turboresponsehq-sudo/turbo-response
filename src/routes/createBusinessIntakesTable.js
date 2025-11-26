const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');
const logger = require('../utils/logger');

// One-time route to create business_intakes table
router.get('/create-business-intakes-table', async (req, res) => {
  try {
    logger.info('Creating business_intakes table...');

    // Create the table
    await query(`
      CREATE TABLE IF NOT EXISTS business_intakes (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        business_name VARCHAR(255),
        website_url TEXT,
        instagram_url TEXT,
        tiktok_url TEXT,
        facebook_url TEXT,
        youtube_url TEXT,
        link_in_bio TEXT,
        what_you_sell TEXT,
        ideal_customer TEXT,
        biggest_struggle TEXT,
        short_term_goal TEXT,
        long_term_vision TEXT,
        documents JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_business_intakes_email ON business_intakes(email);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_business_intakes_status ON business_intakes(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_business_intakes_created_at ON business_intakes(created_at);`);

    logger.info('✅ business_intakes table created successfully');

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Table Created</title>
        <style>
          body { font-family: Arial; padding: 40px; background: #0f172a; color: white; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 10px; }
          h1 { color: #10b981; }
          p { line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Business Intakes Table Created!</h1>
          <p>The database table has been created successfully.</p>
          <p><strong>Clients can now submit business intake forms.</strong></p>
          <p>You can close this page.</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    logger.error('Failed to create business_intakes table:', error);
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
