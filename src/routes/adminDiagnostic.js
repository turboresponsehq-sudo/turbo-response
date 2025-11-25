const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../services/database/db');
const logger = require('../utils/logger');

// Diagnostic page - shows admin status and allows password reset
router.get('/admin-diagnostic', async (req, res) => {
  try {
    const adminEmail = 'turboresponsehq@gmail.com';
    
    // Get admin user info
    const result = await query(
      'SELECT id, email, role, password_hash, created_at, updated_at FROM users WHERE email = $1',
      [adminEmail]
    );

    const admin = result.rows[0];
    
    if (!admin) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Admin Diagnostic</title>
          <style>
            body { font-family: Arial; padding: 40px; background: #0f172a; color: white; }
            .container { max-width: 800px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 10px; }
            h1 { color: #ef4444; }
            button { padding: 15px 30px; background: #06b6d4; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
            button:hover { background: #0891b2; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Admin User Not Found</h1>
            <p>No admin user exists in the database.</p>
            <form action="/api/admin-diagnostic/create" method="POST">
              <button type="submit">Create Admin User</button>
            </form>
          </div>
        </body>
        </html>
      `);
    }

    // Test password
    const testPassword = 'admin123';
    const passwordWorks = await bcrypt.compare(testPassword, admin.password_hash);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Diagnostic</title>
        <style>
          body { font-family: Arial; padding: 40px; background: #0f172a; color: white; }
          .container { max-width: 800px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 10px; }
          h1 { color: #06b6d4; }
          .info { background: #334155; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .label { color: #94a3b8; }
          .value { color: #06b6d4; font-weight: bold; }
          .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
          .success { background: #065f46; color: #10b981; }
          .error { background: #7f1d1d; color: #ef4444; }
          button { padding: 15px 30px; background: #06b6d4; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px; }
          button:hover { background: #0891b2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔍 Admin Diagnostic</h1>
          
          <div class="info">
            <div><span class="label">Email:</span> <span class="value">${admin.email}</span></div>
            <div><span class="label">Role:</span> <span class="value">${admin.role}</span></div>
            <div><span class="label">User ID:</span> <span class="value">${admin.id}</span></div>
            <div><span class="label">Created:</span> <span class="value">${admin.created_at}</span></div>
            <div><span class="label">Updated:</span> <span class="value">${admin.updated_at}</span></div>
          </div>

          <div class="status ${passwordWorks ? 'success' : 'error'}">
            ${passwordWorks ? '✅ Password "admin123" works!' : '❌ Password "admin123" does NOT work'}
          </div>

          ${!passwordWorks ? `
            <p>The password hash in the database doesn't match "admin123". Click below to reset it:</p>
            <form action="/api/admin-diagnostic/reset" method="POST">
              <button type="submit">Reset Password to "admin123"</button>
            </form>
          ` : `
            <p>✅ Everything looks good! Try logging in with:</p>
            <div class="info">
              <div><span class="label">Email:</span> <span class="value">turboresponsehq@gmail.com</span></div>
              <div><span class="label">Password:</span> <span class="value">admin123</span></div>
            </div>
            <a href="/admin/login" style="display: inline-block; padding: 15px 30px; background: #06b6d4; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Login</a>
          `}
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    logger.error('Diagnostic error:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Reset password endpoint
router.post('/admin-diagnostic/reset', async (req, res) => {
  try {
    const adminEmail = 'turboresponsehq@gmail.com';
    const newPassword = 'admin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [passwordHash, adminEmail]
    );

    logger.info('✅ Admin password reset via diagnostic page');

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset</title>
        <style>
          body { font-family: Arial; padding: 40px; background: #0f172a; color: white; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 10px; }
          h1 { color: #10b981; }
          a { display: inline-block; padding: 15px 30px; background: #06b6d4; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Password Reset Successfully!</h1>
          <p>You can now login with:</p>
          <p><strong>Email:</strong> turboresponsehq@gmail.com</p>
          <p><strong>Password:</strong> admin123</p>
          <a href="/admin/login">Go to Login</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    logger.error('Reset error:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Create admin endpoint
router.post('/admin-diagnostic/create', async (req, res) => {
  try {
    const adminEmail = 'turboresponsehq@gmail.com';
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await query(
      `INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [adminEmail, passwordHash, 'Admin', 'admin']
    );

    logger.info('✅ Admin user created via diagnostic page');

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Created</title>
        <style>
          body { font-family: Arial; padding: 40px; background: #0f172a; color: white; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 10px; }
          h1 { color: #10b981; }
          a { display: inline-block; padding: 15px 30px; background: #06b6d4; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Admin User Created!</h1>
          <p>You can now login with:</p>
          <p><strong>Email:</strong> turboresponsehq@gmail.com</p>
          <p><strong>Password:</strong> admin123</p>
          <a href="/admin/login">Go to Login</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    logger.error('Create error:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

module.exports = router;
