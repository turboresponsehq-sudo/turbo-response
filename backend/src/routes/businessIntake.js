/**
 * Business Intake Routes
 * Handles business intake form submissions and blueprint generation
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../services/database/db');
const { generateBlueprint } = require('../services/blueprintGenerator');
const logger = require('../utils/logger');

/**
 * POST /api/business-intake/submit
 * Submit a new business intake form
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      businessName,
      websiteUrl,
      instagramUrl,
      tiktokUrl,
      facebookUrl,
      youtubeUrl,
      linkInBio,
      whatYouSell,
      idealCustomer,
      biggestStruggle,
      shortTermGoal,
      longTermVision,
      consent
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !businessName || !websiteUrl || 
        !whatYouSell || !idealCustomer || !biggestStruggle || !shortTermGoal || 
        !longTermVision || !consent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO business_submissions (
        full_name, email, phone, business_name,
        website_url, instagram_url, tiktok_url, facebook_url, youtube_url, link_in_bio,
        what_you_sell, ideal_customer, biggest_struggle, short_term_goal, long_term_vision,
        consent_given, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, created_at`,
      [
        fullName, email, phone, businessName,
        websiteUrl, instagramUrl, tiktokUrl, facebookUrl, youtubeUrl, linkInBio,
        whatYouSell, idealCustomer, biggestStruggle, shortTermGoal, longTermVision,
        consent, 'pending'
      ]
    );

    const submission = result.rows[0];

    logger.info(`Business intake submitted: ${submission.id} - ${businessName}`);

    res.status(201).json({
      success: true,
      message: 'Business intake submitted successfully',
      submission_id: submission.id,
      created_at: submission.created_at
    });

  } catch (error) {
    logger.error(`Error submitting business intake: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to submit business intake'
    });
  }
});

/**
 * GET /api/admin/business-intake/submissions
 * Get all business intake submissions (admin only)
 */
router.get('/admin/submissions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, full_name, email, phone, business_name, website_url,
        status, blueprint_generated, created_at, updated_at
      FROM business_submissions
      ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      submissions: result.rows
    });

  } catch (error) {
    logger.error(`Error retrieving business submissions: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submissions'
    });
  }
});

/**
 * GET /api/admin/business-intake/submission/:id
 * Get a single business submission by ID (admin only)
 */
router.get('/admin/submission/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM business_submissions WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    res.json({
      success: true,
      submission: result.rows[0]
    });

  } catch (error) {
    logger.error(`Error retrieving submission: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submission'
    });
  }
});

/**
 * POST /api/admin/business-intake/generate-blueprint/:id
 * Generate AI blueprint for a submission (admin only)
 */
router.post('/admin/generate-blueprint/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get submission data
    const submissionResult = await pool.query(
      `SELECT * FROM business_submissions WHERE id = $1`,
      [id]
    );

    if (submissionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const submission = submissionResult.rows[0];

    // Check if blueprint already exists
    if (submission.blueprint_generated) {
      return res.status(400).json({
        success: false,
        error: 'Blueprint already generated for this submission',
        blueprint: submission.blueprint_data
      });
    }

    logger.info(`Generating blueprint for submission ${id}...`);

    // Generate blueprint using AI
    const blueprintResult = await generateBlueprint(submission);

    // Save blueprint to database
    await pool.query(
      `UPDATE business_submissions 
       SET blueprint_data = $1, 
           blueprint_generated = TRUE, 
           blueprint_generated_at = CURRENT_TIMESTAMP,
           status = 'blueprint_generated'
       WHERE id = $2`,
      [JSON.stringify(blueprintResult.blueprint), id]
    );

    logger.info(`Blueprint generated successfully for submission ${id}`);

    res.json({
      success: true,
      message: 'Blueprint generated successfully',
      blueprint: blueprintResult.blueprint,
      generated_at: blueprintResult.generated_at
    });

  } catch (error) {
    logger.error(`Error generating blueprint: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to generate blueprint',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/business-intake/blueprint/:id
 * Get the generated blueprint for a submission (admin only)
 */
router.get('/admin/blueprint/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT blueprint_data, blueprint_generated_at, business_name, full_name
       FROM business_submissions 
       WHERE id = $1 AND blueprint_generated = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Blueprint not found or not yet generated'
      });
    }

    const row = result.rows[0];

    res.json({
      success: true,
      blueprint: row.blueprint_data,
      generated_at: row.blueprint_generated_at,
      business_name: row.business_name,
      owner_name: row.full_name
    });

  } catch (error) {
    logger.error(`Error retrieving blueprint: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve blueprint'
    });
  }
});

module.exports = router;
