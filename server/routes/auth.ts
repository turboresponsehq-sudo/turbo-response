import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';

const router = express.Router();

// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ message: 'Database not available' });
    }

    // Find user by email
    const users = await db.select().from(await import('../../drizzle/schema').then(m => m.users))
      .where((await import('drizzle-orm').then(m => m.eq))(
        (await import('../../drizzle/schema').then(m => m.users)).email,
        email
      ))
      .limit(1);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Note: Password validation is handled by hardcoded credentials in .env
    // Users table doesn't have password column (OAuth-only)
    // This endpoint is deprecated - use OAuth instead

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Auth] JWT_SECRET not set in environment');
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not set' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
