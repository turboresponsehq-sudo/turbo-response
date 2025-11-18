const Stripe = require('stripe');
const logger = require('../../utils/logger');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Payment plans configuration
const PAYMENT_PLANS = {
  starter: {
    name: 'Case Starter Plan',
    amount: 14900, // $149.00 in cents
    currency: 'usd',
    description: 'One case review + AI-assisted response'
  },
  standard: {
    name: 'Standard Defense Plan',
    amount: 34900, // $349.00 in cents
    currency: 'usd',
    description: 'Full AI + expert-reviewed case defense'
  },
  comprehensive: {
    name: 'Comprehensive Case Management',
    amount: 69900, // $699.00 in cents
    currency: 'usd',
    description: 'End-to-end case handling with priority support'
  }
};

// Create Stripe checkout session
const createCheckoutSession = async (plan, caseId, userEmail, successUrl, cancelUrl) => {
  try {
    if (!PAYMENT_PLANS[plan]) {
      throw new Error(`Invalid payment plan: ${plan}`);
    }

    const planConfig = PAYMENT_PLANS[plan];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: planConfig.currency,
            product_data: {
              name: planConfig.name,
              description: planConfig.description
            },
            unit_amount: planConfig.amount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        case_id: caseId.toString(),
        plan: plan
      }
    });

    logger.info('Stripe checkout session created', {
      sessionId: session.id,
      caseId,
      plan,
      amount: planConfig.amount
    });

    return {
      session_id: session.id,
      url: session.url,
      amount: planConfig.amount
    };
  } catch (error) {
    logger.error('Stripe checkout session creation failed', { error: error.message });
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

// Verify webhook signature
const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    logger.error('Webhook signature verification failed', { error: error.message });
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

// Handle successful payment
const handlePaymentSuccess = async (session) => {
  const caseId = session.metadata.case_id;
  const plan = session.metadata.plan;
  const amount = session.amount_total;
  const paymentIntentId = session.payment_intent;

  logger.info('Payment successful', {
    caseId,
    plan,
    amount,
    paymentIntentId
  });

  return {
    case_id: caseId,
    plan,
    amount: amount / 100, // Convert cents to dollars
    stripe_payment_id: paymentIntentId
  };
};

module.exports = {
  createCheckoutSession,
  verifyWebhookSignature,
  handlePaymentSuccess,
  PAYMENT_PLANS
};
