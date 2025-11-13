const { query } = require('../services/database/db');
const logger = require('../utils/logger');

// Get all cases for current user
const getMyCases = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, case_number, category, status, payment_status, payment_plan,
              blueprint_generated, created_at, updated_at
       FROM cases
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      cases: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    next(error);
  }
};

// Get single case details
const getCaseById = async (req, res, next) => {
  try {
    const { case_id } = req.params;

    const result = await query(
      `SELECT * FROM cases
       WHERE id = $1 AND user_id = $2`,
      [case_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ case: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Get all cases (admin only)
const getAllCases = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        id, 
        case_number, 
        category, 
        email, 
        full_name, 
        phone, 
        address,
        case_details, 
        amount, 
        deadline, 
        documents, 
        status, 
        created_at,
        updated_at
      FROM cases
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      cases: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get case details by ID (admin only)
const getAdminCaseById = async (req, res, next) => {
  try {
    const caseId = parseInt(req.params.id);

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID'
      });
    }

    const result = await query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    res.json({
      success: true,
      case: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update case status (admin only)
const updateCaseStatus = async (req, res, next) => {
  try {
    const caseId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID'
      });
    }

    // Validate status value
    const validStatuses = ['Pending Review', 'In Review', 'Awaiting Client', 'Completed', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Get current status for transition validation
    const currentResult = await query(
      'SELECT status FROM cases WHERE id = $1',
      [caseId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    const currentStatus = currentResult.rows[0].status;

    // If status is not changing, allow it (idempotent)
    if (currentStatus === status) {
      return res.json({
        success: true,
        status,
        message: 'Status unchanged'
      });
    }

    // Validate status transitions
    const allowedTransitions = {
      'Pending Review': ['In Review'],
      'In Review': ['Awaiting Client', 'Rejected'],
      'Awaiting Client': ['Completed', 'Rejected']
    };

    // Check if transition is allowed
    if (allowedTransitions[currentStatus] && 
        !allowedTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid transition from "${currentStatus}" to "${status}". Allowed: ${allowedTransitions[currentStatus].join(', ')}`
      });
    }

    // Terminal states cannot be changed
    if (currentStatus === 'Completed' || currentStatus === 'Rejected') {
      return res.status(400).json({
        success: false,
        error: `Cannot change status from terminal state "${currentStatus}"`
      });
    }

    // Update status
    await query(
      'UPDATE cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, caseId]
    );

    logger.info('Case status updated', {
      caseId,
      oldStatus: currentStatus,
      newStatus: status,
      adminId: req.user.id
    });

    res.json({
      success: true,
      status,
      message: 'Status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCases,
  getCaseById,
  getAllCases,
  getAdminCaseById,
  updateCaseStatus
};
