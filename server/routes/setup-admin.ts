import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from '../db';

const router = express.Router();

// One-time setup endpoint to create admin user
router.get('/setup-admin', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).send('Database not available');
    }

    const email = 'turboresponsehq@gmail.com';
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // First, try to add password column if it doesn't exist
    try {
      await db.execute('ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER email');
      console.log('✅ Password column added');
    } catch (error: any) {
      if (error.message.includes('Duplicate column')) {
        console.log('✅ Password column already exists');
      } else {
        console.log('⚠️ Column add warning:', error.message);
      }
    }

    // Check if admin exists
    const users = await db.execute(`SELECT id, email FROM users WHERE email = '${email}'`);
    const existingUser = (users as any).rows?.[0] || (users as any)[0];

    if (existingUser) {
      // Update existing user
      await db.execute(`
        UPDATE users 
        SET password = '${hashedPassword}', role = 'admin' 
        WHERE email = '${email}'
      `);
      console.log('✅ Admin user updated');
    } else {
      // Create new user
      await db.execute(`
        INSERT INTO users (openId, email, password, role, name, createdAt, updatedAt, lastSignedIn) 
        VALUES (
          'admin-local',
          '${email}',
          '${hashedPassword}',
          'admin',
          'Admin',
          NOW(),
          NOW(),
          NOW()
        )
      `);
      console.log('✅ Admin user created');
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Setup Complete</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: rgba(15, 23, 42, 0.8);
            border-radius: 20px;
            border: 1px solid #06b6d4;
            box-shadow: 0 10px 40px rgba(6, 182, 212, 0.3);
          }
          h1 { color: #06b6d4; margin-bottom: 20px; }
          .credentials {
            background: rgba(30, 41, 59, 0.6);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid #334155;
          }
          .credential-row {
            margin: 10px 0;
            font-size: 18px;
          }
          .label { color: #94a3b8; }
          .value { color: #06b6d4; font-weight: bold; }
          a {
            display: inline-block;
            margin-top: 20px;
            padding: 15px 30px;
            background: #06b6d4;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            transition: all 0.3s;
          }
          a:hover {
            background: #0891b2;
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(6, 182, 212, 0.4);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Admin Setup Complete!</h1>
          <p>Your admin account is ready to use.</p>
          <div class="credentials">
            <div class="credential-row">
              <span class="label">Email:</span>
              <span class="value">turboresponsehq@gmail.com</span>
            </div>
            <div class="credential-row">
              <span class="label">Password:</span>
              <span class="value">Admin123!</span>
            </div>
          </div>
          <a href="/admin/login">Go to Admin Login →</a>
        </div>
      </body>
      </html>
    `);

  } catch (error: any) {
    console.error('❌ Setup error:', error);
    res.status(500).send(`
      <h1>Setup Error</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    `);
  }
});

export default router;
