/**
 * Admin Consumer Defense Routes
 * Ported from Python admin_workflow.py (commit 4f611d3)
 */

const express = require('express');
const { query } = require('../services/database/db');
const { generateComprehensiveAnalysis, generateLetter } = require('../services/aiAnalysis');

const router = express.Router();

/**
 * GET /api/admin/consumer/cases
 * Get all consumer defense cases
 */
router.get('/cases', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        c.*,
        ca.violations,
        ca.laws_cited,
        ca.recommended_actions,
        ca.urgency_level,
        ca.estimated_value,
        ca.success_probability,
        ca.pricing_suggestion,
        ca.summary,
        ca.created_at as analysis_created_at
      FROM cases c
      LEFT JOIN case_analyses ca ON c.id = ca.case_id
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      cases: result.rows,
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cases',
    });
  }
});

/**
 * GET /api/admin/consumer/case/:id
 * Get detailed case information
 */
router.get('/case/:id', async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);

    const caseResult = await query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found',
      });
    }

    const analysisResult = await query(
      'SELECT * FROM case_analyses WHERE case_id = $1',
      [caseId]
    );

    const lettersResult = await query(
      'SELECT * FROM draft_letters WHERE case_id = $1 ORDER BY created_at DESC',
      [caseId]
    );

    res.json({
      success: true,
      case: caseResult.rows[0],
      analysis: analysisResult.rows[0] || null,
      letters: lettersResult.rows,
    });
  } catch (error) {
    console.error('Error fetching case details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case details',
    });
  }
});

/**
 * POST /api/admin/consumer/analyze-case/:id
 * Generate comprehensive AI analysis of a case
 * 
 * This is the endpoint for the "Run AI Analysis" button
 */
router.post('/analyze-case/:id', async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);

    // Get case data
    const caseResult = await query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found',
      });
    }

    const caseData = caseResult.rows[0];

    // Generate AI analysis
    const analysis = await generateComprehensiveAnalysis({
      category: caseData.category,
      caseDescription: caseData.case_description,
      amount: caseData.amount,
      uploadedFiles: caseData.uploaded_files ? JSON.parse(caseData.uploaded_files) : [],
    });

    // Check if analysis already exists
    const existingAnalysis = await query(
      'SELECT id FROM case_analyses WHERE case_id = $1',
      [caseId]
    );

    if (existingAnalysis.rows.length > 0) {
      // Update existing analysis
      await query(
        `UPDATE case_analyses SET
          violations = $1,
          laws_cited = $2,
          recommended_actions = $3,
          urgency_level = $4,
          estimated_value = $5,
          success_probability = $6,
          pricing_suggestion = $7,
          summary = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE case_id = $9`,
        [
          JSON.stringify(analysis.violations),
          JSON.stringify(analysis.laws_cited),
          JSON.stringify(analysis.recommended_actions),
          analysis.urgency_level,
          analysis.estimated_value,
          analysis.success_probability,
          analysis.pricing_suggestion,
          analysis.summary,
          caseId,
        ]
      );
    } else {
      // Insert new analysis
      await query(
        `INSERT INTO case_analyses (
          case_id, violations, laws_cited, recommended_actions,
          urgency_level, estimated_value, success_probability,
          pricing_suggestion, summary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          caseId,
          JSON.stringify(analysis.violations),
          JSON.stringify(analysis.laws_cited),
          JSON.stringify(analysis.recommended_actions),
          analysis.urgency_level,
          analysis.estimated_value,
          analysis.success_probability,
          analysis.pricing_suggestion,
          analysis.summary,
        ]
      );

      // Create admin notification
      await query(
        `INSERT INTO admin_notifications (
          case_id, notification_type, title, message, priority
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          caseId,
          'analysis_complete',
          'AI Analysis Complete',
          `Case analysis completed for ${caseData.full_name}. ${analysis.violations.length} violations found.`,
          analysis.urgency_level === 'critical' || analysis.urgency_level === 'high' ? 'high' : 'normal',
        ]
      );
    }

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error analyzing case:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze case',
    });
  }
});

/**
 * POST /api/admin/consumer/generate-letter/:id
 * Generate a draft letter for a case
 */
router.post('/generate-letter/:id', async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);
    const { letterType } = req.body;

    if (!letterType) {
      return res.status(400).json({
        success: false,
        error: 'Letter type required',
      });
    }

    // Get case data
    const caseResult = await query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found',
      });
    }

    const caseData = caseResult.rows[0];

    // Get analysis
    const analysisResult = await query(
      'SELECT * FROM case_analyses WHERE case_id = $1',
      [caseId]
    );

    const violations = analysisResult.rows[0]
      ? JSON.parse(analysisResult.rows[0].violations)
      : [];

    // Generate letter
    const letterResult = await generateLetter({
      letterType,
      category: caseData.category,
      clientInfo: {
        name: caseData.full_name,
        email: caseData.email,
        phone: caseData.phone,
      },
      caseDetails: caseData.case_description,
      violations,
    });

    if (!letterResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate letter',
      });
    }

    // Save draft letter
    const draftResult = await query(
      `INSERT INTO draft_letters (
        case_id, letter_type, content, status, ai_analysis
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        caseId,
        letterType,
        letterResult.content,
        'draft',
        analysisResult.rows[0] ? JSON.stringify(analysisResult.rows[0]) : null,
      ]
    );

    // Create notification
    await query(
      `INSERT INTO admin_notifications (
        case_id, notification_type, title, message, priority
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        caseId,
        'review_needed',
        `New Draft Letter: ${letterType}`,
        `Draft ${letterType} letter generated for ${caseData.full_name}. Review required.`,
        'normal',
      ]
    );

    res.json({
      success: true,
      letterId: draftResult.rows[0].id,
      content: letterResult.content,
    });
  } catch (error) {
    console.error('Error generating letter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate letter',
    });
  }
});

/**
 * GET /api/admin/consumer/notifications
 * Get admin notifications
 */
router.get('/notifications', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM admin_notifications
       ORDER BY created_at DESC
       LIMIT 50`
    );

    res.json({
      success: true,
      notifications: result.rows,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
});

/**
 * POST /api/admin/consumer/notification/:id/mark-read
 * Mark notification as read
 */
router.post('/notification/:id/mark-read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);

    await query(
      'UPDATE admin_notifications SET read = TRUE WHERE id = $1',
      [notificationId]
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
});

module.exports = router;
