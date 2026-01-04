const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
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
        tokenLength: token?.length
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
