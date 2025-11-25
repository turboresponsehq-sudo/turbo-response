const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { query } = require('../services/database/db');

// TEMPORARY endpoint to reset admin password
router.post('/reset-admin-password', async (req, res) => {
  try {
    const email = 'turboresponsehq@gmail.com';
    const newPassword = 'Admin123!';
    
    console.log('🔧 Resetting admin password...');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Check if user exists
    const checkResult = await query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length === 0) {
      // Create admin user
      console.log('❌ Admin user not found, creating...');
      await query(
        'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
        [email, hashedPassword, 'admin', 'Admin']
      );
      console.log('✅ Admin user created');
    } else {
      // Update existing user
      console.log('✅ Admin user found, updating password...');
      await query(
        'UPDATE users SET password = $1, role = $2 WHERE email = $3',
        [hashedPassword, 'admin', email]
      );
      console.log('✅ Password updated');
    }
    
    res.json({
      success: true,
      message: 'Admin password reset successfully',
      credentials: {
        email: 'turboresponsehq@gmail.com',
        password: 'Admin123!'
      }
    });
    
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
