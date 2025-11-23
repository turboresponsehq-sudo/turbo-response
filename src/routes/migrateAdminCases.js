const express = require('express');
const router = express.Router();
const db = require('../services/database/db');

/**
 * ONE-TIME MIGRATION ENDPOINT
 * Creates admin_cases and admin_case_documents tables
 * DELETE THIS FILE AFTER RUNNING
 */
router.post('/admin-cases', async (req, res) => {
  try {
    console.log('🔄 Starting admin_cases table creation...');
    
    // Create admin_cases table
    await db.query(`
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
    
    console.log('✅ admin_cases table created');
    
    // Create indexes for admin_cases
    await db.query(`CREATE INDEX IF NOT EXISTS idx_admin_cases_category ON admin_cases(category);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_admin_cases_status ON admin_cases(status);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_admin_cases_created_at ON admin_cases(created_at);`);
    
    console.log('✅ admin_cases indexes created');
    
    // Create admin_case_documents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_case_documents (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES admin_cases(id) ON DELETE CASCADE,
        file_key VARCHAR(500) NOT NULL,
        file_url TEXT NOT NULL,
        file_name VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100),
        file_size INTEGER,
        note TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ admin_case_documents table created');
    
    // Create indexes for admin_case_documents
    await db.query(`CREATE INDEX IF NOT EXISTS idx_admin_case_documents_case_id ON admin_case_documents(case_id);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_admin_case_documents_uploaded_at ON admin_case_documents(uploaded_at);`);
    
    console.log('✅ admin_case_documents indexes created');
    
    // Verify tables exist
    const casesResult = await db.query(`SELECT COUNT(*) FROM admin_cases;`);
    const docsResult = await db.query(`SELECT COUNT(*) FROM admin_case_documents;`);
    
    res.json({
      success: true,
      message: 'Admin cases tables created successfully',
      tables: {
        admin_cases: {
          exists: true,
          row_count: parseInt(casesResult.rows[0].count)
        },
        admin_case_documents: {
          exists: true,
          row_count: parseInt(docsResult.rows[0].count)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
