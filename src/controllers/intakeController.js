const { query } = require('../services/database/db');
const logger = require('../utils/logger');
const { sendNewCaseNotification, sendClientCaseConfirmation } = require('../services/emailService');

// Generate unique case number
const generateCaseNumber = () => {
  const prefix = 'TR';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Submit new intake form (MOBILE-HARDENED)
const submit = async (req, res, next) => {
  try {
    // Mobile-safe input extraction with trimming and normalization
    let {
      email,
      full_name,
      phone,
      address,
      category,
      case_details,
      amount,
      deadline,
      documents,
      terms_accepted_at,
      terms_accepted_ip
    } = req.body;

    // MOBILE FIX 1: Trim and normalize all string inputs
    // Mobile keyboards can add invisible characters, spaces, and inconsistent casing
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    full_name = typeof full_name === 'string' ? full_name.trim() : full_name;
    phone = typeof phone === 'string' ? phone.trim() : phone;
    address = typeof address === 'string' ? address.trim() : address;
    category = typeof category === 'string' ? category.trim().toLowerCase() : category;
    case_details = typeof case_details === 'string' ? case_details.trim() : case_details;
    amount = typeof amount === 'string' ? amount.trim() : amount;
    deadline = typeof deadline === 'string' ? deadline.trim() : deadline;

    // MOBILE FIX 2: Safely handle documents array
    // Mobile browsers may send null, undefined, or malformed file data
    if (!documents || !Array.isArray(documents)) {
      documents = [];
    }
    // Filter out null/undefined/empty entries from mobile file uploads
    documents = documents.filter(doc => doc && typeof doc === 'object' && doc.url);

    // DEBUG: Log received case_details
    console.log('[INTAKE DEBUG] Received case_details:', {
      length: case_details?.length || 0,
      preview: case_details?.substring(0, 100) || 'EMPTY',
      type: typeof case_details
    });

    // MOBILE FIX 3: Validate required fields with explicit checks
    if (!email || !full_name || !category || !case_details) {
      logger.warn('Intake validation failed: missing required fields', { email, full_name, category });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'email, full_name, category, and case_details are required'
      });
    }

    // MOBILE FIX 4: Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn('Intake validation failed: invalid email format', { email });
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'Please provide a valid email address'
      });
    }

    // Validate category
    const validCategories = ['eviction', 'debt', 'irs', 'wage', 'medical', 'benefits', 'auto', 'consumer'];
    if (!validCategories.includes(category)) {
      logger.warn('Intake validation failed: invalid category', { category });
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        error: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    // Generate case number
    const case_number = generateCaseNumber();

    // Insert case into database
    const result = await query(
      `INSERT INTO cases (
        user_id, case_number, category, email, full_name, phone, address, 
        case_details, amount, deadline, documents, status, payment_status, funnel_stage,
        portal_enabled, terms_accepted_at, terms_accepted_ip
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, case_number, category, status, created_at`,
      [
        req.user?.id || null,
        case_number,
        category,
        email,
        full_name,
        phone || null,
        address || null,
        case_details,
        amount || null,
        deadline || null,
        JSON.stringify(documents || []),
        'Pending Review',
        'unpaid',
        'Lead Submitted',
        false,  // portal_enabled = false until admin approves
        terms_accepted_at || null,
        terms_accepted_ip || null
      ]
    );

    const newCase = result.rows[0];

    // DEBUG: Log what was inserted into database
    console.log('[INTAKE DEBUG] Inserted into database:', {
      case_id: newCase.id,
      case_number: newCase.case_number,
      category,
      case_details_length: case_details?.length || 0,
      case_details_preview: case_details?.substring(0, 100) || 'EMPTY'
    });

    logger.info('New case submitted', {
      caseId: newCase.id,
      caseNumber: newCase.case_number,
      category: newCase.category
    });

    // Create client portal user (if doesn't exist)
    try {
      const bcrypt = require('bcrypt');
      const tempPassword = Math.random().toString(36).slice(-8);
      const password_hash = await bcrypt.hash(tempPassword, 10);
      
      // Check if user already exists
      const existingUser = await query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
      );

      if (existingUser.rows.length === 0) {
        await query(
          `INSERT INTO users (email, password_hash, full_name, phone, role)
           VALUES ($1, $2, $3, $4, 'client')`,
          [email, password_hash, full_name, phone || null]
        );
        logger.info('Client portal user created for consumer intake', { email, caseId: newCase.id });
      }
    } catch (userError) {
      logger.error('Failed to create portal user for consumer intake', {
        error: userError.message,
        caseId: newCase.id
      });
      // Don't fail the whole intake if user creation fails
    }

    // Send email notification to admin (non-blocking)
    sendNewCaseNotification({
      id: newCase.id,
      case_number: newCase.case_number,
      category,
      email,
      full_name,
      phone,
      address,
      case_details,
      amount,
      deadline,
      documents,
      created_at: newCase.created_at,
    }).catch(err => {
      logger.error('Failed to send new case notification email', { error: err.message });
    });

    // Send confirmation email to client (non-blocking)
    sendClientCaseConfirmation({
      id: newCase.id,
      case_number: newCase.case_number,
      category,
      email,
      full_name,
      created_at: newCase.created_at,
    }).catch(err => {
      logger.error('Failed to send client confirmation email', { error: err.message });
    });

    res.status(201).json({
      success: true,
      message: 'Case submitted successfully',
      data: {
        case_id: newCase.id,
        case_number: newCase.case_number,
        case: newCase
      }
    });
  } catch (error) {
    logger.error('Intake submission failed', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to submit case',
      error: error.message
    });
  }
};

module.exports = {
  submit
};
