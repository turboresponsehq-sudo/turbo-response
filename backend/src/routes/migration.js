const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../services/database/db');
const logger = require('../utils/logger');

// ONE-TIME MIGRATION ENDPOINT
// Sets admin email to turboresponsehq@gmail.com with password admin123
// DELETE THIS FILE AFTER RUNNING SUCCESSFULLY
router.post('/setup-admin', async (req, res) => {
  try {
    logger.info('🔧 Setting up admin account...');

    const adminEmail = 'turboresponsehq@gmail.com';
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists
    const existingAdmin = await query(
      'SELECT id, email, role FROM users WHERE role = $1',
      ['admin']
    );

    if (existingAdmin.rows.length > 0) {
      // Update existing admin
      const updateResult = await query(
        `UPDATE users 
         SET email = $1, password_hash = $2 
         WHERE role = 'admin'
         RETURNING id, email, role`,
        [adminEmail, passwordHash]
      );
      
      logger.info('✅ Admin account updated', updateResult.rows[0]);

      return res.json({
        success: true,
        message: 'Admin account updated successfully!',
        admin: updateResult.rows[0],
        credentials: {
          email: adminEmail,
          password: adminPassword
        },
        warning: '⚠️ DELETE /backend/src/routes/migration.js NOW'
      });
    } else {
      // Create new admin
      const insertResult = await query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, role`,
        [adminEmail, passwordHash, 'Admin', 'admin']
      );

      logger.info('✅ Admin account created', insertResult.rows[0]);

      return res.json({
        success: true,
        message: 'Admin account created successfully!',
        admin: insertResult.rows[0],
        credentials: {
          email: adminEmail,
          password: adminPassword
        },
        warning: '⚠️ DELETE /backend/src/routes/migration.js NOW'
      });
    }
  } catch (error) {
    logger.error('❌ Admin setup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
