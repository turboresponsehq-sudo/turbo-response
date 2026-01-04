const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', authenticateToken, getMe);

// POST /api/auth/logout - Logout user (clear cookie)
router.post('/logout', authenticateToken, logout);

module.exports = router;
