const { query } = require('../services/database/db');
const { createCheckoutSession, verifyWebhookSignature, handlePaymentSuccess } = require('../services/payment/stripe');
const logger = require('../utils/logger');

// Create Stripe checkout session
const createCheckout = async (req, res, next) => {
  try {
    const { case_id, plan } = req.body;

    if (!case_id || !plan) {
      return res.status(400).json({ error: 'case_id and plan are required' });
    }

    // Validate plan
    const validPlans = ['starter', 'standard', 'comprehensive'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid payment plan' });
    }

    // Get case details
    const caseResult = await query(
      'SELECT * FROM cases WHERE id = $1 AND user_id = $2',
      [case_id, req.user.id]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseData = caseResult.rows[0];

    // Check if already paid
    if (caseData.payment_status === 'paid') {
      return res.status(400).json({ error: 'Case already paid' });
    }

    // Create checkout session
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${frontendUrl}/payment/success?case_id=${case_id}`;
    const cancelUrl = `${frontendUrl}/payment/cancel?case_id=${case_id}`;

    const session = await createCheckoutSession(
      plan,
      case_id,
      caseData.email,
      successUrl,
      cancelUrl
    );

    // Update case with payment plan
    await query(
      'UPDATE cases SET payment_plan = $1 WHERE id = $2',
      [plan, case_id]
    );

    res.json({
      message: 'Checkout session created',
      session_id: session.session_id,
      checkout_url: session.url,
      amount: session.amount
    });
  } catch (error) {
    next(error);
  }
};

// Handle Stripe webhook
const webhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    // Verify webhook signature
    const event = verifyWebhookSignature(payload, signature);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const paymentData = await handlePaymentSuccess(session);

        // Update case payment status
        await query(
          `UPDATE cases 
           SET payment_status = 'paid',
               payment_amount = $1,
               stripe_payment_id = $2,
               status = 'processing'
           WHERE id = $3`,
          [paymentData.amount, paymentData.stripe_payment_id, paymentData.case_id]
        );

        logger.info('Case payment status updated', { caseId: paymentData.case_id });
        break;

      case 'payment_intent.payment_failed':
        logger.warn('Payment failed', { event: event.data.object });
        break;

      default:
        logger.info('Unhandled webhook event', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// Get payment status
const getPaymentStatus = async (req, res, next) => {
  try {
    const { case_id } = req.params;

    const result = await query(
      `SELECT payment_status, payment_amount, payment_plan, stripe_payment_id 
       FROM cases 
       WHERE id = $1 AND user_id = $2`,
      [case_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckout,
  webhook,
  getPaymentStatus
};
