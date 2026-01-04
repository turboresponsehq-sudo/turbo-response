const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Verify JWT token from cookies (mobile-friendly)
const authenticateToken = (req, res, next) => {
  // Try to get token from:
  // 1. httpOnly cookie (preferred for mobile)
  // 2. Authorization header (fallback for API clients)
  
  let token = null;

  // First, try to get from httpOnly cookie
  if (req.cookies && req.cookies.admin_session) {
    token = req.cookies.admin_session;
    logger.debug('Token retrieved from httpOnly cookie');
  }
  
  // Fallback to Authorization header for API clients
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      logger.debug('Token retrieved from Authorization header');
    }
  }

  if (!token) {
    logger.warn('No token found in cookies or Authorization header');
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'turbo-response-default-secret-key-2024';
  
  if (!process.env.JWT_SECRET) {
    logger.warn('JWT_SECRET not set in environment, using default fallback');
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt', { 
        error: err.message,
        errorType: err.name,
        tokenLength: token?.length,
        tokenSource: req.cookies?.admin_session ? 'cookie' : 'header'
      });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

// Verify admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn('Unauthorized admin access attempt', { userId: req.user?.id });
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const jwtSecret = process.env.JWT_SECRET || 'turbo-response-default-secret-key-2024';
  
  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '365d'
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken
};
