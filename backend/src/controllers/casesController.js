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
        message: 'Case not found',
        error: 'No case found with the specified ID'
      });
    }

    res.json({
      success: true,
      data: { case: result.rows[0] }
    });
  } catch (error) {
    logger.error('Failed to get case by ID', {
      error: error.message,
      caseId: req.params.case_id,
      userId: req.user?.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve case',
      error: error.message
    });
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
    logger.error('Failed to get all cases (admin)', {
      error: error.message
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve cases',
      error: error.message
    });
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
      `SELECT 
        id, user_id, case_number, category, status,
        full_name, email, phone, address,
        case_details, amount, deadline, documents,
        created_at, updated_at
      FROM cases 
      WHERE id = $1`,
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
    logger.error('Failed to get admin case by ID', {
      error: error.message,
      caseId: req.params.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve case details',
      error: error.message
    });
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
      message: 'Status updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update case status', {
      error: error.message,
      caseId: req.params.id,
      status: req.body.status
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to update case status',
      error: error.message
    });
  }
};


// ========================================
// AI ANALYSIS & PRICING ENDPOINTS
// ========================================

const { generateComprehensiveAnalysis } = require('../services/aiAnalysis');

/**
 * Run AI analysis with deterministic pricing
 * POST /api/case/:id/analyze
 */
const runAIAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get case details
    const caseResult = await query(
      `SELECT * FROM cases WHERE id = $1`,
      [id]
    );
    
    if (caseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
    
    const caseData = caseResult.rows[0];
    
    // Parse uploaded files if stored as JSON
    let uploadedFiles = [];
    if (caseData.uploaded_files) {
      try {
        uploadedFiles = typeof caseData.uploaded_files === 'string' 
          ? JSON.parse(caseData.uploaded_files) 
          : caseData.uploaded_files;
      } catch (e) {
        console.error('Error parsing uploaded_files:', e);
      }
    }
    
    // Run AI analysis with pricing
    const analysis = await generateComprehensiveAnalysis({
      category: caseData.category,
      caseDescription: caseData.case_details,
      amount: caseData.amount,
      uploadedFiles: uploadedFiles
    });
    
    // Save analysis to database
    await query(
      `INSERT INTO case_analyses 
       (case_id, violations, laws_cited, recommended_actions, urgency_level, 
        estimated_value, success_probability, pricing_suggestion, pricing_tier, summary, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (case_id) 
       DO UPDATE SET
         violations = EXCLUDED.violations,
         laws_cited = EXCLUDED.laws_cited,
         recommended_actions = EXCLUDED.recommended_actions,
         urgency_level = EXCLUDED.urgency_level,
         estimated_value = EXCLUDED.estimated_value,
         success_probability = EXCLUDED.success_probability,
         pricing_suggestion = EXCLUDED.pricing_suggestion,
         pricing_tier = EXCLUDED.pricing_tier,
         summary = EXCLUDED.summary,
         updated_at = NOW()`,
      [
        id,
        JSON.stringify(analysis.violations),
        JSON.stringify(analysis.laws_cited),
        JSON.stringify(analysis.recommended_actions),
        analysis.urgency_level,
        analysis.estimated_value,
        analysis.success_probability,
        analysis.pricing_suggestion,
        analysis.pricing_tier,
        analysis.summary
      ]
    );
    
    // Log AI usage (optional - don't fail if table doesn't exist)
    if (analysis._usage) {
      try {
        await query(
          `INSERT INTO ai_usage_logs 
           (case_id, tokens_used, estimated_cost, model, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [id, analysis._usage.tokens, analysis._usage.cost, analysis._usage.model]
        );
      } catch (usageLogError) {
        console.warn('Failed to log AI usage (non-critical):', usageLogError.message);
        // Continue execution - usage logging is optional
      }
    }
    
    res.json({
      success: true,
      caseId: id,
      analysis: {
        violations: analysis.violations,
        laws_cited: analysis.laws_cited,
        recommended_actions: analysis.recommended_actions,
        urgency_level: analysis.urgency_level,
        estimated_value: analysis.estimated_value,
        success_probability: analysis.success_probability,
        pricing: {
          amount: analysis.pricing_suggestion,
          tier: analysis.pricing_tier,
          breakdown: analysis.pricing_breakdown
        },
        summary: analysis.summary
      }
    });
    
  } catch (error) {
    console.error('AI Analysis Error:', {
      caseId: req.params.id,
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Return user-friendly error instead of crashing
    return res.status(500).json({
      success: false,
      error: 'AI analysis failed. This may be due to missing case data or a database error. Please ensure the case has complete information.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get last saved AI analysis
 * GET /api/case/:id/analysis
 */
const getAIAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT * FROM case_analyses WHERE case_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No analysis found for this case'
      });
    }
    
    const analysis = result.rows[0];
    
    // Parse JSON fields
    const violations = typeof analysis.violations === 'string' 
      ? JSON.parse(analysis.violations) 
      : analysis.violations;
    const laws_cited = typeof analysis.laws_cited === 'string'
      ? JSON.parse(analysis.laws_cited)
      : analysis.laws_cited;
    const recommended_actions = typeof analysis.recommended_actions === 'string'
      ? JSON.parse(analysis.recommended_actions)
      : analysis.recommended_actions;
    
    res.json({
      success: true,
      analysis: {
        violations,
        laws_cited,
        recommended_actions,
        urgency_level: analysis.urgency_level,
        estimated_value: analysis.estimated_value,
        success_probability: analysis.success_probability,
        pricing: {
          amount: analysis.pricing_suggestion,
          tier: analysis.pricing_tier
        },
        summary: analysis.summary,
        created_at: analysis.created_at,
        updated_at: analysis.updated_at
      }
    });
    
  } catch (error) {
    logger.error('Failed to get case analysis', {
      error: error.message,
      caseId: req.params.id
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve case analysis',
      error: error.message
    });
  }
};


// Delete case (admin only)
const deleteCase = async (req, res, next) => {
  try {
    const caseId = parseInt(req.params.id);

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID'
      });
    }

    // Check if case exists
    const checkResult = await query(
      'SELECT id FROM cases WHERE id = $1',
      [caseId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    // Get case data to find uploaded files
    const caseData = await query('SELECT documents FROM cases WHERE id = $1', [caseId]);
    const documents = caseData.rows[0]?.documents;
    
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
    
    // Delete related records first (foreign key constraints)
    // Each deletion is wrapped to prevent failures if tables don't exist
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
    
    // Delete the case (this is the critical operation)
    await query('DELETE FROM cases WHERE id = $1', [caseId]);

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

module.exports = {
  getMyCases,
  getCaseById,
  getAllCases,
  getAdminCaseById,
  updateCaseStatus,
  runAIAnalysis,
  getAIAnalysis,
  deleteCase
};
