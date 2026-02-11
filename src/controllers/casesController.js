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
      success: true,
      data: {
        cases: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    logger.error('Failed to get user cases', {
      error: error.message,
      userId: req.user?.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve cases',
      error: error.message
    });
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
      logger.warn('Case not found', { caseId, userId: req.user?.id });
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    const caseData = result.rows[0];

    res.json({
      success: true,
      data: caseData
    });
  } catch (error) {
    logger.error('Failed to get case details', {
      error: error.message,
      caseId: req.params.case_id,
      userId: req.user?.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve case details',
      error: error.message
    });
  }
};

// Get all cases (admin only)
const getAllCases = async (req, res, next) => {
  try {
    // Query cases table (production data)
    const result = await query(
      `SELECT id, case_number, category, status, 
              full_name as first_name, 
              NULL as last_name,
              email, phone,
              created_at, updated_at, 
              'consumer' as case_type
       FROM cases
       ORDER BY created_at DESC`
    );

    const allCases = result.rows || [];

    logger.info('Retrieved all cases', {
      totalCount: allCases.length
    });

    res.json({
      success: true,
      cases: allCases,
      total: allCases.length
    });
  } catch (error) {
    logger.error('Failed to get all cases', {
      error: error.message
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve cases',
      error: error.message
    });
  }
};

// Get admin case by ID (from either table)
const getAdminCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First try cases table
    let result = await query(
      `SELECT * FROM cases WHERE id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      return res.json({
        success: true,
        case: result.rows[0],
        case_type: 'consumer'
      });
    }

    // Fall back to business_intakes table
    result = await query(
      `SELECT * FROM business_intakes WHERE id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      return res.json({
        success: true,
        case: result.rows[0],
        case_type: 'business'
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Case not found'
    });
  } catch (error) {
    logger.error('Failed to get admin case', {
      error: error.message,
      caseId: req.params.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve case',
      error: error.message
    });
  }
};

// Update case status (admin only)
const updateCaseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // Build dynamic SET clause from allowed fields
    const allowedFields = [
      'status', 'portal_enabled', 'client_status', 'client_notes',
      'payment_link', 'pricing_tier', 'pricing_tier_amount', 'pricing_tier_name'
    ];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['open', 'in_progress', 'completed', 'closed', 'pending_review', 'pending', 'processing', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    setClauses.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE cases SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.json({
      success: true,
      case: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to update case', {
      error: error.message,
      caseId: req.params.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to update case',
      error: error.message
    });
  }
};

// Delete case (admin only) - handles both cases and business_intakes tables
const deleteCase = async (req, res, next) => {
  try {
    const caseId = parseInt(req.params.id);

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID'
      });
    }

    // Check if case exists in cases table (consumer/offense)
    let caseTable = 'cases';
    let checkResult = await query(
      'SELECT id FROM cases WHERE id = $1',
      [caseId]
    );

    // If not found in cases, check business_intakes (old business audit cases)
    if (checkResult.rows.length === 0) {
      checkResult = await query(
        'SELECT id FROM business_intakes WHERE id = $1',
        [caseId]
      );
      if (checkResult.rows.length > 0) {
        caseTable = 'business_intakes';
      } else {
        return res.status(404).json({
          success: false,
          error: 'Case not found'
        });
      }
    }

    // Get case data to find uploaded files (only for cases table)
    let documents = null;
    if (caseTable === 'cases') {
      const caseData = await query('SELECT documents FROM cases WHERE id = $1', [caseId]);
      documents = caseData.rows[0]?.documents;
    }
    
    // Delete uploaded files (optional - don't fail if files missing)
    if (documents && Array.isArray(documents)) {
      const fs = require('fs');
      const path = require('path');
      
      for (const docUrl of documents) {
        try {
          // Extract filename from URL (e.g., /uploads/file.pdf -> file.pdf)
          const filename = docUrl.split('/').pop();
          const filePath = path.join(__dirname, '../../uploads', filename);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        } catch (fileError) {
          console.warn(`Failed to delete file (non-critical): ${fileError.message}`);
        }
      }
    }
    
    // Delete related records first (foreign key constraints) - only for cases table
    if (caseTable === 'cases') {
      try {
        await query('DELETE FROM case_analyses WHERE case_id = $1', [caseId]);
      } catch (e) {
        console.warn('Failed to delete case_analyses (non-critical):', e.message);
      }
      
      try {
        await query('DELETE FROM draft_letters WHERE case_id = $1', [caseId]);
      } catch (e) {
        console.warn('Failed to delete draft_letters (non-critical):', e.message);
      }
      
      try {
        await query('DELETE FROM ai_usage_logs WHERE case_id = $1', [caseId]);
      } catch (e) {
        console.warn('Failed to delete ai_usage_logs (non-critical):', e.message);
      }
    }
    
    // Delete the case from the correct table
    await query(`DELETE FROM ${caseTable} WHERE id = $1`, [caseId]);

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete case', {
      error: error.message,
      caseId: req.params.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete case',
      error: error.message
    });
  }
};

// Update case documents (client only)
const updateCaseDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { documents } = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        message: 'Documents must be an array'
      });
    }

    // Check if case exists in cases table first
    let caseTable = 'cases';
    let checkResult = await query(
      'SELECT id FROM cases WHERE id = $1',
      [id]
    );

    // If not found, check business_intakes
    if (checkResult.rows.length === 0) {
      checkResult = await query(
        'SELECT id FROM business_intakes WHERE id = $1',
        [id]
      );
      if (checkResult.rows.length > 0) {
        caseTable = 'business_intakes';
      } else {
        return res.status(404).json({
          success: false,
          message: 'Case not found'
        });
      }
    }

    // Update the correct table
    const result = await query(
      `UPDATE ${caseTable} SET documents = $1 WHERE id = $2 RETURNING *`,
      [JSON.stringify(documents), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    logger.info('Case documents updated', {
      caseId: id,
      caseTable,
      documentCount: documents.length
    });

    res.json({
      success: true,
      case: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to update case documents', {
      error: error.message,
      caseId: req.params.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to update case documents',
      error: error.message
    });
  }
};

module.exports = {
  getMyCases,
  getCaseById,
  getAllCases,
  getAdminCaseById,
  updateCaseStatus,
  deleteCase,
  updateCaseDocuments
};
