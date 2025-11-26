const db = require('../services/database/db');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map();

/**
 * Step 1: Client requests login with email + case ID
 * Generate 6-digit code and email it
 */
async function requestLogin(req, res) {
  try {
    const { email, caseId } = req.body;

    if (!email || !caseId) {
      return res.status(400).json({
        success: false,
        message: 'Email and case ID are required'
      });
    }

    // Check if case exists and matches email (both consumer and business cases)
    const emailLower = email.toLowerCase().trim();
    const caseIdNormalized = caseId.trim();
    
    console.log('[CLIENT AUTH] Login attempt:', { 
      caseId: caseIdNormalized, 
      email: emailLower,
      originalCaseId: caseId,
      originalEmail: email
    });
    
    // Try consumer cases first (case-insensitive, trimmed comparison)
    let result = await db.query(
      `SELECT id, case_number, email, portal_enabled, 'consumer' as case_type 
       FROM cases 
       WHERE LOWER(TRIM(case_number)) = LOWER($1) 
       AND LOWER(TRIM(email)) = LOWER($2)`,
      [caseIdNormalized, emailLower]
    );
    
    console.log('[CLIENT AUTH] Consumer cases query result:', { rowCount: result.rows.length });
    
    // If not found, try business intakes (case-insensitive, trimmed comparison)
    if (result.rows.length === 0) {
      result = await db.query(
        `SELECT id, business_name as case_number, email, portal_enabled, 'business' as case_type 
         FROM business_intakes 
         WHERE LOWER(TRIM(business_name)) = LOWER($1) 
         AND LOWER(TRIM(email)) = LOWER($2)`,
        [caseIdNormalized, emailLower]
      );
      console.log('[CLIENT AUTH] Business intakes query result:', { rowCount: result.rows.length });
    }
    
    console.log('[CLIENT AUTH] Final query result:', { 
      rowCount: result.rows.length, 
      foundCase: result.rows.length > 0 ? result.rows[0] : null 
    });

    if (result.rows.length === 0) {
      console.log('[CLIENT AUTH] No case found for:', { caseId, email: emailLower });
      return res.status(404).json({
        success: false,
        message: 'No case found with that email and case ID'
      });
    }

    const caseData = result.rows[0];

    // Check if portal is enabled
    if (!caseData.portal_enabled) {
      return res.status(403).json({
        success: false,
        message: 'Client portal access is disabled for this case'
      });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with 10-minute expiration
    const key = `${email.toLowerCase()}-${caseId}`;
    verificationCodes.set(key, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    });

    // Send verification email
    const emailSent = await emailService.sendEmail({
      to: email,
      subject: `Turbo Response - Verification Code for Case ${caseData.case_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #06b6d4;">Turbo Response - Client Portal Access</h2>
          <p>Your verification code is:</p>
          <div style="background: #0a1628; color: #06b6d4; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>Case Number: <strong>${caseData.case_number}</strong></p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `
    });

    if (!emailSent) {
      console.error('[CLIENT AUTH] Failed to send verification email - email service returned false');
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please contact support.'
      });
    }

    console.log('[CLIENT AUTH] Verification code sent successfully:', { email, caseNumber: caseData.case_number });

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      caseNumber: caseData.case_number
    });

  } catch (error) {
    console.error('❌ Client login request error:', error);
    console.error('[CLIENT AUTH] Full error details:', {
      message: error.message,
      stack: error.stack,
      email,
      caseId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again or contact support.'
    });
  }
}

/**
 * Step 2: Client submits verification code
 * Verify code and issue JWT token
 */
async function verifyCode(req, res) {
  try {
    const { email, caseId, code } = req.body;

    if (!email || !caseId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email, case ID, and verification code are required'
      });
    }

    const key = `${email.toLowerCase()}-${caseId}`;
    const stored = verificationCodes.get(key);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new code.'
      });
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(key);
      return res.status(400).json({
        success: false,
        message: 'Verification code expired. Please request a new code.'
      });
    }

    // Check attempts (max 3)
    if (stored.attempts >= 3) {
      verificationCodes.delete(key);
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new code.'
      });
    }

    // Verify code
    if (stored.code !== code) {
      stored.attempts++;
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
        attemptsRemaining: 3 - stored.attempts
      });
    }

    // Code is valid - delete it and issue JWT
    verificationCodes.delete(key);

    // Get case data (check both consumer and business cases)
    let result = await db.query(
      'SELECT id, case_number, email, full_name, \'consumer\' as case_type FROM cases WHERE case_number = $1',
      [caseId]
    );

    // If not found in consumer cases, check business intakes
    if (result.rows.length === 0) {
      result = await db.query(
        'SELECT id, business_name as case_number, email, full_name, \'business\' as case_type FROM business_intakes WHERE business_name = $1',
        [caseId]
      );
    }

    const caseData = result.rows[0];

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      {
        caseId: caseData.id,
        email: caseData.email,
        type: 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set httpOnly cookie
    res.cookie('client_token', token, {
      httpOnly: true,
      secure: true, // Always use secure in production
      sameSite: 'none', // Allow cross-site cookies (frontend on different domain)
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'Login successful',
      caseId: caseData.id,
      caseNumber: caseData.case_number,
      clientName: caseData.full_name
    });

  } catch (error) {
    console.error('❌ Client verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
}

/**
 * Get client's case data
 * Requires valid client token
 */
async function getClientCase(req, res) {
  try {
    const { id } = req.params;
    const clientCaseId = req.clientAuth.caseId;

    // Ensure client can only access their own case
    if (parseInt(id) !== clientCaseId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get case data (check both consumer and business cases)
    let result = await db.query(`
      SELECT 
        id,
        case_number,
        category,
        status,
        client_status,
        client_notes,
        payment_link,
        payment_verified,
        funnel_stage,
        pricing_tier,
        pricing_tier_amount,
        pricing_tier_name,
        full_name,
        email,
        phone,
        case_details,
        amount,
        deadline,
        documents,
        created_at,
        updated_at,
        'consumer' as case_type
      FROM cases
      WHERE id = $1 AND portal_enabled = TRUE
    `, [id]);

    // If not found in consumer cases, check business intakes
    if (result.rows.length === 0) {
      result = await db.query(`
        SELECT 
          id,
          business_name as case_number,
          NULL as category,
          status,
          NULL as client_status,
          NULL as client_notes,
          NULL as payment_link,
          NULL as payment_verified,
          NULL as funnel_stage,
          NULL as pricing_tier,
          NULL as pricing_tier_amount,
          NULL as pricing_tier_name,
          full_name,
          email,
          phone,
          what_you_sell as case_details,
          NULL as amount,
          NULL as deadline,
          NULL as documents,
          created_at,
          updated_at,
          'business' as case_type
        FROM business_intakes
        WHERE id = $1 AND portal_enabled = TRUE
      `, [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found or portal access disabled'
      });
    }

    const caseData = result.rows[0];

    res.json({
      success: true,
      case: caseData
    });

  } catch (error) {
    console.error('❌ Get client case error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve case data'
    });
  }
}

/**
 * Logout client
 */
function logout(req, res) {
  res.clearCookie('client_token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

module.exports = {
  requestLogin,
  verifyCode,
  getClientCase,
  logout
};
