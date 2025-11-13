const { query } = require('../services/database/db');
const logger = require('../utils/logger');
const { sendNewCaseNotification } = require('../services/emailService');

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
      documents
    } = req.body;

    // Validate required fields
    if (!email || !full_name || !category || !case_details) {
      return res.status(400).json({
        error: 'Missing required fields: email, full_name, category, case_details'
      });
    }

    // Validate category
    const validCategories = ['eviction', 'debt', 'irs', 'wage', 'medical', 'benefits', 'auto', 'consumer'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Generate case number
    const case_number = generateCaseNumber();

    // Insert case into database
    const result = await query(
      `INSERT INTO cases (
        user_id, case_number, category, email, full_name, phone, address, 
        case_details, amount, deadline, documents, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        'unpaid'
      ]
    );

    const newCase = result.rows[0];

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

    res.status(201).json({
      message: 'Case submitted successfully',
      case_id: newCase.id,
      case_number: newCase.case_number,
      case: newCase
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submit
};
