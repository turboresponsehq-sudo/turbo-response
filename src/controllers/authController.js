const bcrypt = require('bcrypt');
const { query } = require('../services/database/db');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Register new user
const register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, address } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, address, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, phone, address, role, created_at`,
      [email, password_hash, full_name || null, phone || null, address || null, 'user']
    );

    const user = result.rows[0];
    const token = generateToken(user);

    logger.info('New user registered', { userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user (email-based authentication)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // DEBUG: Log query result
    logger.info('🔍 Login attempt', { 
      email, 
      userFound: result.rows.length > 0,
      rowCount: result.rows.length 
    });

    if (result.rows.length === 0) {
      logger.warn('❌ User not found in database', { email });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    
    // DEBUG: Log user details (without password hash)
    logger.info('✅ User found', { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0
    });

    // Verify password
    logger.info('🔐 Comparing password...', { 
      providedPasswordLength: password.length,
      storedHashLength: user.password_hash.length 
    });
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    logger.info('🔐 Password comparison result', { 
      isValid: isValidPassword,
      email: user.email 
    });

    if (!isValidPassword) {
      logger.warn('❌ Password comparison failed', { email: user.email });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    logger.info('User logged in', { userId: user.id, email: user.email });

    // Set token as httpOnly, secure cookie (works on mobile)
    // This replaces localStorage-based authentication
    res.cookie('admin_session', token, {
      httpOnly: true,        // Prevents JavaScript access (XSS protection)
      secure: true,          // HTTPS only
      sameSite: 'lax',       // CSRF protection, allows same-site navigation
      maxAge: 365 * 24 * 60 * 60 * 1000  // 1 year in milliseconds
    });

    logger.info('Admin session cookie set', { userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, phone, address, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Logout user (clear cookie)
const logout = async (req, res, next) => {
  try {
    res.clearCookie('admin_session', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });

    logger.info('User logged out', { userId: req.user?.id });

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
