const crypto = require('crypto');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Meta Conversions API (CAPI) Service
 * Sends server-side events to Meta for better tracking and attribution
 * 
 * Events tracked:
 * - intake_started: User starts case intake form
 * - intake_completed: User completes case submission
 * - business_signup: Business submits intake form
 * - case_created: Case successfully created in database
 * - user_signup: New user registration
 */

const PIXEL_ID = '1355933342933181';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const CAPI_URL = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

/**
 * Hash user data for privacy (Meta requires SHA256 hashing)
 * @param {string} value - Value to hash
 * @returns {string} SHA256 hash
 */
function hashValue(value) {
  if (!value) return null;
  // Normalize: lowercase and trim
  const normalized = String(value).toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Send event to Meta Conversions API
 * @param {Object} eventData - Event data
 * @param {string} eventData.eventName - Event name (e.g., 'intake_started')
 * @param {string} eventData.email - User email (optional)
 * @param {string} eventData.phone - User phone (optional)
 * @param {string} eventData.firstName - User first name (optional)
 * @param {string} eventData.lastName - User last name (optional)
 * @param {string} eventData.city - User city (optional)
 * @param {string} eventData.state - User state (optional)
 * @param {string} eventData.zip - User zip code (optional)
 * @param {string} eventData.country - User country (optional, defaults to 'us')
 * @param {Object} eventData.customData - Custom event data (optional)
 * @param {string} eventData.eventSourceUrl - Page URL where event occurred (optional)
 * @param {string} eventData.userAgent - User's browser user agent (optional)
 * @param {string} eventData.ipAddress - User's IP address (optional)
 * @returns {Promise<boolean>} Success status
 */
async function sendEvent(eventData) {
  try {
    // Check if CAPI is configured
    if (!ACCESS_TOKEN) {
      logger.warn('[Meta CAPI] Access token not configured. Skipping event.', {
        eventName: eventData.eventName
      });
      return false;
    }

    const eventTime = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    const eventId = `${eventData.eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build user data object with hashed PII
    const userData = {};
    
    if (eventData.email) {
      userData.em = hashValue(eventData.email);
    }
    
    if (eventData.phone) {
      // Remove non-numeric characters
      const cleanPhone = eventData.phone.replace(/\D/g, '');
      userData.ph = hashValue(cleanPhone);
    }
    
    if (eventData.firstName) {
      userData.fn = hashValue(eventData.firstName);
    }
    
    if (eventData.lastName) {
      userData.ln = hashValue(eventData.lastName);
    }
    
    if (eventData.city) {
      userData.ct = hashValue(eventData.city);
    }
    
    if (eventData.state) {
      userData.st = hashValue(eventData.state);
    }
    
    if (eventData.zip) {
      userData.zp = hashValue(eventData.zip);
    }
    
    if (eventData.country) {
      userData.country = hashValue(eventData.country);
    } else {
      userData.country = hashValue('us'); // Default to US
    }

    // Add client IP and user agent if available
    if (eventData.ipAddress) {
      userData.client_ip_address = eventData.ipAddress;
    }
    
    if (eventData.userAgent) {
      userData.client_user_agent = eventData.userAgent;
    }

    // Build event payload
    const eventPayload = {
      event_name: eventData.eventName,
      event_time: eventTime,
      event_id: eventId,
      event_source_url: eventData.eventSourceUrl || 'https://turboresponsehq.ai',
      action_source: 'website', // Server-side events from website
      user_data: userData
    };

    // Add custom data if provided
    if (eventData.customData) {
      eventPayload.custom_data = eventData.customData;
    }

    // Send to Meta Conversions API
    const response = await axios.post(
      CAPI_URL,
      {
        data: [eventPayload],
        access_token: ACCESS_TOKEN
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      }
    );

    logger.info('[Meta CAPI] Event sent successfully', {
      eventName: eventData.eventName,
      eventId: eventId,
      hasEmail: !!eventData.email,
      hasPhone: !!eventData.phone,
      response: response.data
    });

    return true;

  } catch (error) {
    logger.error('[Meta CAPI] Failed to send event', {
      eventName: eventData.eventName,
      error: error.message,
      response: error.response?.data
    });
    return false;
  }
}

/**
 * Track intake started event
 * @param {Object} userData - User data
 */
async function trackIntakeStarted(userData) {
  return sendEvent({
    eventName: 'intake_started',
    email: userData.email,
    phone: userData.phone,
    firstName: userData.firstName,
    lastName: userData.lastName,
    eventSourceUrl: userData.sourceUrl || 'https://turboresponsehq.ai',
    userAgent: userData.userAgent,
    ipAddress: userData.ipAddress
  });
}

/**
 * Track intake completed event
 * @param {Object} userData - User data
 * @param {Object} caseData - Case data
 */
async function trackIntakeCompleted(userData, caseData) {
  return sendEvent({
    eventName: 'intake_completed',
    email: userData.email,
    phone: userData.phone,
    firstName: userData.firstName,
    lastName: userData.lastName,
    city: userData.city,
    state: userData.state,
    zip: userData.zip,
    eventSourceUrl: userData.sourceUrl || 'https://turboresponsehq.ai',
    userAgent: userData.userAgent,
    ipAddress: userData.ipAddress,
    customData: {
      case_number: caseData.caseNumber,
      category: caseData.category,
      case_id: caseData.caseId
    }
  });
}

/**
 * Track business signup event
 * @param {Object} businessData - Business data
 */
async function trackBusinessSignup(businessData) {
  return sendEvent({
    eventName: 'business_signup',
    email: businessData.email,
    phone: businessData.phone,
    city: businessData.city,
    state: businessData.state,
    zip: businessData.zip,
    eventSourceUrl: businessData.sourceUrl || 'https://turboresponsehq.ai/business',
    userAgent: businessData.userAgent,
    ipAddress: businessData.ipAddress,
    customData: {
      business_name: businessData.businessName,
      business_type: businessData.businessType
    }
  });
}

/**
 * Track case created event (after successful database insert)
 * @param {Object} userData - User data
 * @param {Object} caseData - Case data
 */
async function trackCaseCreated(userData, caseData) {
  return sendEvent({
    eventName: 'case_created',
    email: userData.email,
    phone: userData.phone,
    firstName: userData.firstName,
    lastName: userData.lastName,
    city: userData.city,
    state: userData.state,
    zip: userData.zip,
    eventSourceUrl: userData.sourceUrl || 'https://turboresponsehq.ai',
    userAgent: userData.userAgent,
    ipAddress: userData.ipAddress,
    customData: {
      case_number: caseData.caseNumber,
      category: caseData.category,
      case_id: caseData.caseId,
      value: caseData.value || 0, // Case value if applicable
      currency: 'USD'
    }
  });
}

/**
 * Track user signup event (admin or user registration)
 * @param {Object} userData - User data
 */
async function trackUserSignup(userData) {
  return sendEvent({
    eventName: 'user_signup',
    email: userData.email,
    phone: userData.phone,
    firstName: userData.firstName,
    lastName: userData.lastName,
    eventSourceUrl: userData.sourceUrl || 'https://turboresponsehq.ai',
    userAgent: userData.userAgent,
    ipAddress: userData.ipAddress,
    customData: {
      user_role: userData.role || 'user'
    }
  });
}

module.exports = {
  sendEvent,
  trackIntakeStarted,
  trackIntakeCompleted,
  trackBusinessSignup,
  trackCaseCreated,
  trackUserSignup
};
