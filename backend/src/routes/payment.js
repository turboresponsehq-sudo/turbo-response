const express = require('express');
const router = express.Router();
const { createCheckout, webhook, getPaymentStatus } = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/payment/create-checkout - Create Stripe checkout session
router.post('/create-checkout', authenticateToken, createCheckout);

// POST /api/payment/webhook - Stripe webhook endpoint (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

// GET /api/payment/status/:case_id - Get payment status
router.get('/status/:case_id', authenticateToken, getPaymentStatus);

module.exports = router;
