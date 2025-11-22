const express = require('express');
const router = express.Router();
const clientAuthController = require('../controllers/clientAuthController');
const { authenticateClient } = require('../middleware/clientAuth');

// Public routes (no authentication required)
router.post('/login', clientAuthController.requestLogin);
router.post('/verify', clientAuthController.verifyCode);

// Protected routes (require client authentication)
router.get('/case/:id', authenticateClient, clientAuthController.getClientCase);
router.post('/logout', authenticateClient, clientAuthController.logout);

module.exports = router;
