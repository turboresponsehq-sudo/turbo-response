const express = require('express');
const router = express.Router();
const { submit } = require('../controllers/intakeController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/intake/submit - Submit new intake form (optional auth)
router.post('/submit', (req, res, next) => {
  // Try to authenticate, but don't require it
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, submit);

module.exports = router;
