const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');
const logger = require('../utils/logger');

/**
 * TEMPORARY ENDPOINT - DELETE AFTER USE
 * Resets the admin user by deleting and letting seed recreate it
 */
router.post('/reset-admin-user', async (req, res) => {
  try {
    logger.info('🔧 RESET: Deleting admin user...');
    
    // Delete existing admin user
    const result = await query(
      'DELETE FROM users WHERE email = $1 RETURNING id, email',
      ['turboresponsehq@gmail.com']
    );
    
    if (result.rows.length > 0) {
      logger.info('✅ RESET: Admin user deleted', { 
        deletedUser: result.rows[0] 
      });
      
      res.json({
        success: true,
        message: 'Admin user deleted successfully. Restart the backend to recreate.',
        deletedUser: result.rows[0]
      });
    } else {
      logger.warn('⚠️ RESET: No admin user found to delete');
      
      res.json({
        success: false,
        message: 'No admin user found with email turboresponsehq@gmail.com'
      });
    }
    
  } catch (error) {
    logger.error('❌ RESET: Failed to delete admin user', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
