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

// Submit new intake form
const submit = async (req, res, next) => {
  try {
    const {
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

    // DEBUG: Log received case_details
    console.log('[INTAKE DEBUG] Received case_details:', {
      length: case_details?.length || 0,
      preview: case_details?.substring(0, 100) || 'EMPTY',
      type: typeof case_details
    });

    // Validate required fields
    if (!email || !full_name || !category || !case_details) {
      logger.warn('Intake validation failed: missing required fields', { email, full_name, category });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'email, full_name, category, and case_details are required'
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
        terms_accepted_at, terms_accepted_ip
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
