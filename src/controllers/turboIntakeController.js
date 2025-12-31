const { query } = require('../services/database/db');
const logger = require('../utils/logger');
const { sendBusinessIntakeNotification, sendBusinessIntakeConfirmation } = require('../services/emailService');

// Submit new business intake form
const submit = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      businessName,
      entityType,
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
      primaryGoal,
      targetAuthority,
      stage,
      deadline,
      estimatedAmount,
      caseDescription,
      documents
    } = req.body;

    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({
        error: 'Missing required fields: fullName, email'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Insert into cases table (not business_intakes)
    // This ensures data appears in admin dashboard
    const result = await query(
      `INSERT INTO cases (
        title, category, caseType, status, description, clientName, clientEmail, clientPhone,
        businessName, entityType, websiteUrl, instagramUrl, tiktokUrl, facebookUrl, youtubeUrl,
        linkInBio, primaryGoal, targetAuthority, stage, deadline, estimatedAmount, createdAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW())
      RETURNING id, clientName, clientEmail, status, createdAt`,
      [
        businessName || fullName,  // title
        'Offense',                  // category
        'offense',                  // caseType
        'open',                     // status
        caseDescription || `Business: ${businessName}`,  // description
        fullName,                   // clientName
        email,                      // clientEmail
        phone || null,              // clientPhone
        businessName || null,       // businessName
        entityType || null,         // entityType
        websiteUrl || null,         // websiteUrl
        instagramUrl || null,       // instagramUrl
        tiktokUrl || null,          // tiktokUrl
        facebookUrl || null,        // facebookUrl
        youtubeUrl || null,         // youtubeUrl
        linkInBio || null,          // linkInBio
        primaryGoal || null,        // primaryGoal
        targetAuthority || null,    // targetAuthority
        stage || null,              // stage
        deadline || null,           // deadline
        estimatedAmount || null     // estimatedAmount
      ]
    );

    const newCase = result.rows[0];

    logger.info('New offense case submitted', {
      caseId: newCase.id,
      email: newCase.clientEmail,
      businessName
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
          [email, password_hash, fullName, phone || null]
        );
        logger.info('Client portal user created for offense case', { email, caseId: newCase.id });
      }
    } catch (userError) {
      logger.error('Failed to create portal user for offense case', {
        error: userError.message,
        caseId: newCase.id
      });
      // Don't fail the whole intake if user creation fails
    }

    // Send email notification to admin (non-blocking)
    sendBusinessIntakeNotification({
      id: newCase.id,
      full_name: newCase.clientName,
      email: newCase.clientEmail,
      phone: phone || null,
      business_name: businessName || null,
      website_url: websiteUrl || null,
      instagram_url: instagramUrl || null,
      tiktok_url: tiktokUrl || null,
      facebook_url: facebookUrl || null,
      youtube_url: youtubeUrl || null,
      link_in_bio: linkInBio || null,
      what_you_sell: whatYouSell || null,
      ideal_customer: idealCustomer || null,
      biggest_struggle: biggestStruggle || null,
      short_term_goal: shortTermGoal || null,
      long_term_vision: longTermVision || null,
      created_at: newCase.createdAt,
    }).catch(err => {
      logger.error('Failed to send offense case notification email', {
        error: err.message,
        caseId: newCase.id,
      });
    });

    // Send confirmation email to client (non-blocking)
    sendBusinessIntakeConfirmation({
      id: newCase.id,
      full_name: newCase.clientName,
      email: newCase.clientEmail,
      phone: phone || null,
      business_name: businessName || null,
      website_url: websiteUrl || null,
      created_at: newCase.createdAt,
    }).catch(err => {
      logger.error('Failed to send offense case confirmation email', {
        error: err.message,
        caseId: newCase.id,
      });
    });

    res.status(200).json({
      success: true,
      message: 'Offense intake received successfully',
      case_id: newCase.id,
      case: newCase
    });
  } catch (error) {
    logger.error('Error submitting offense intake', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Failed to submit offense intake',
      message: error.message
    });
  }
};

module.exports = {
  submit
};
