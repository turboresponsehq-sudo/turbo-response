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

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid case ID"
      });
    }

    // Get case + latest AI analysis in single query
    const result = await query(
      `
      SELECT 
        c.*,
        a.violations,
        a.laws_cited,
        a.recommended_actions,
        a.estimated_value,
        a.success_probability,
        a.pricing_suggestion,
        a.pricing_tier,
        a.summary,
        a.created_at AS analysis_created_at
      FROM cases c
      LEFT JOIN case_analyses a ON a.case_id = c.id
      WHERE c.id = $1
      ORDER BY a.created_at DESC NULLS LAST
      LIMIT 1
      `,
      [caseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Case not found"
      });
    }

    const row = result.rows[0];

    // Convert numeric text → real numbers
    const parseNumber = (val) => {
      if (!val) return 0;
      const cleaned = String(val).replace(/[$,]/g, "");
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    res.json({
      success: true,
      case: {
        ...row,

        // JSON fields
        violations: row.violations ? JSON.parse(row.violations) : [],
        laws_cited: row.laws_cited ? JSON.parse(row.laws_cited) : [],
        recommended_actions: row.recommended_actions ? JSON.parse(row.recommended_actions) : [],

        // Numeric fields
        estimated_value: parseNumber(row.estimated_value),
        success_probability: parseFloat(row.success_probability) || 0,
        pricing: {
          amount: parseNumber(row.pricing_suggestion),
          tier: row.pricing_tier || ""
        },

        summary: row.summary || ""
      }
    });

  } catch (error) {
    console.error("ADMIN CASE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve case details",
      error: error.message
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

    // Check monthly spending cap before running analysis
    const capResult = await query(
      "SELECT setting_value FROM admin_settings WHERE setting_key = 'monthly_spending_cap'"
    );
    
    if (capResult.rows.length > 0 && capResult.rows[0].setting_value) {
      const monthlyCap = parseFloat(capResult.rows[0].setting_value);
      
      // Calculate current month spending
      const spendingResult = await query(`
        SELECT COALESCE(SUM(estimated_cost), 0) as total_spent
        FROM ai_usage_logs
        WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
      `);
      
      const currentSpending = parseFloat(spendingResult.rows[0].total_spent);
      
      if (currentSpending >= monthlyCap) {
        return res.status(429).json({
          success: false,
          error: `Monthly spending cap of $${monthlyCap.toFixed(2)} reached. Current spending: $${currentSpending.toFixed(2)}`,
          cap_exceeded: true,
          current_spending: currentSpending,
          monthly_cap: monthlyCap
        });
      }
    }

    // Generate AI analysis
    const analysis = await generateComprehensiveAnalysis({
      category: caseData.category,
      caseDescription: caseData.case_description,
      amount: caseData.amount,
      uploadedFiles: caseData.uploaded_files ? JSON.parse(caseData.uploaded_files) : [],
    });
    
    // Log usage for cost tracking
    if (analysis._usage) {
      await query(
        `INSERT INTO ai_usage_logs (case_id, analysis_type, tokens_used, estimated_cost, model_used)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          caseId,
          'comprehensive',
          analysis._usage.tokens,
          analysis._usage.cost,
          analysis._usage.model
        ]
      );
      
      // Remove usage data from response
      delete analysis._usage;
    }

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

/**
 * GET /api/admin/consumer/usage-stats
 * Get AI usage statistics for current month
 */
router.get('/usage-stats', async (req, res) => {
  try {
    // Get current month usage
    const usageResult = await query(`
      SELECT 
        COUNT(*) as total_runs,
        SUM(tokens_used) as total_tokens,
        SUM(estimated_cost) as total_cost
      FROM ai_usage_logs
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
    `);
    
    // Get monthly spending cap
    const capResult = await query(
      "SELECT setting_value FROM admin_settings WHERE setting_key = 'monthly_spending_cap'"
    );
    
    const monthlyCap = capResult.rows.length > 0 && capResult.rows[0].setting_value
      ? parseFloat(capResult.rows[0].setting_value)
      : null;
    
    const stats = usageResult.rows[0];
    const totalCost = parseFloat(stats.total_cost) || 0;
    const totalRuns = parseInt(stats.total_runs) || 0;
    
    res.json({
      success: true,
      stats: {
        total_runs: totalRuns,
        total_tokens: parseInt(stats.total_tokens) || 0,
        total_cost: totalCost,
        monthly_cap: monthlyCap,
        cap_remaining: monthlyCap ? Math.max(0, monthlyCap - totalCost) : null,
        cap_percentage: monthlyCap ? (totalCost / monthlyCap) * 100 : null,
      }
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage stats',
    });
  }
});

/**
 * PUT /api/admin/consumer/settings/spending-cap
 * Update monthly spending cap
 */
router.put('/settings/spending-cap', async (req, res) => {
  try {
    const { cap } = req.body;
    
    // Validate cap (must be null or positive number)
    if (cap !== null && (isNaN(cap) || cap < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Cap must be null (unlimited) or a positive number',
      });
    }
    
    await query(
      `INSERT INTO admin_settings (setting_key, setting_value, updated_at)
       VALUES ('monthly_spending_cap', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
      [cap]
    );
    
    res.json({
      success: true,
      cap: cap,
    });
  } catch (error) {
    console.error('Error updating spending cap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update spending cap',
    });
  }
});

/**
 * GET /api/admin/consumer/settings/spending-cap
 * Get current monthly spending cap
 */
router.get('/settings/spending-cap', async (req, res) => {
  try {
    const result = await query(
      "SELECT setting_value FROM admin_settings WHERE setting_key = 'monthly_spending_cap'"
    );
    
    const cap = result.rows.length > 0 && result.rows[0].setting_value
      ? parseFloat(result.rows[0].setting_value)
      : null;
    
    res.json({
      success: true,
      cap: cap,
    });
  } catch (error) {
    console.error('Error fetching spending cap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch spending cap',
    });
  }
});

module.exports = router;
