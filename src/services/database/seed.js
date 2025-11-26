const bcrypt = require('bcryptjs');
const { query } = require('./db');
const logger = require('../../utils/logger');

/**
 * Seed admin account on server startup
 * This ensures admin account always exists without manual intervention
 */
const seedAdminAccount = async () => {
  try {
    logger.info('🌱 Checking admin account...');

    // Admin credentials (FORCE UPDATE on every startup)
    const adminEmail = 'turboresponsehq@gmail.com';
    const adminPassword = 'Turbo1234!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if admin account exists
    const existingAdmin = await query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      // FORCE UPDATE: Always reset password hash to ensure it matches
      logger.info('🔄 Admin account exists - FORCE UPDATING password hash...');
      
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [passwordHash, adminEmail]
      );
      
      logger.info('✅ Admin password hash FORCE UPDATED successfully');
      logger.info('🔑 Admin credentials:', {
        email: adminEmail,
        password: adminPassword
      });
      return;
    }

    // Create admin account if it doesn't exist
    logger.info('🔧 Creating new admin account...');

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, role`,
      [adminEmail, passwordHash, 'Admin', 'admin']
    );

    logger.info('✅ Admin account created successfully', {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role
    });

    logger.info('🔑 Admin credentials:', {
      email: adminEmail,
      password: adminPassword
    });

  } catch (error) {
    // Don't crash the server if seeding fails
    logger.error('❌ Failed to seed admin account:', error.message);
    logger.warn('⚠️ Server will continue, but admin login may not work');
  }
};

module.exports = {
  seedAdminAccount
};
