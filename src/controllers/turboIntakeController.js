const { query } = require('../services/database/db');
const logger = require('../utils/logger');
const { sendBusinessIntakeNotification, sendBusinessIntakeConfirmation } = require('../services/emailService');

// Generate unique case number
const generateCaseNumber = () => {
  const prefix = 'TR';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Submit new business intake form (OFFENSE case)
const submit = async (req, res, next) => {
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
      estimatedAmount,
      caseDescription,
      primaryGoal,
      targetAuthority,
      stage,
      deadline,
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

    // Step 1: Create or get client user
    let userId = null;
    try {
      const bcrypt = require('bcrypt');
      
      // Check if user already exists
      const existingUser = await query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
      );

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        logger.info('Using existing user for business intake', { email, userId });
      } else {
        // Create new client portal user
        const tempPassword = Math.random().toString(36).slice(-8);
        const password_hash = await bcrypt.hash(tempPassword, 10);
        
        const newUser = await query(
          `INSERT INTO users (email, password_hash, full_name, phone, role)
           VALUES ($1, $2, $3, $4, 'client')
           RETURNING id`,
          [email, password_hash, fullName, phone || null]
        );
        
        userId = newUser.rows[0].id;
        logger.info('Client portal user created for business intake', { email, userId });
      }
    } catch (userError) {
      logger.error('Failed to create/get portal user for business intake', {
        error: userError.message,
        email
      });
      return res.status(500).json({
        error: 'Failed to create user account',
        message: userError.message
      });
    }

    // Step 2: Create proper case record (OFFENSE + BUSINESS)
    const caseNumber = generateCaseNumber();
    const caseDetails = `
Business: ${businessName || 'N/A'}
Website: ${websiteUrl || 'N/A'}
Primary Goal: ${primaryGoal || 'N/A'}
Target Authority: ${targetAuthority || 'N/A'}
Case Description: ${caseDescription || 'N/A'}
Estimated Amount: ${estimatedAmount || 'N/A'}
Stage: ${stage || 'N/A'}
Deadline: ${deadline || 'N/A'}

Social Media:
- Instagram: ${instagramUrl || 'N/A'}
- TikTok: ${tiktokUrl || 'N/A'}
- Facebook: ${facebookUrl || 'N/A'}
- YouTube: ${youtubeUrl || 'N/A'}
- Link in Bio: ${linkInBio || 'N/A'}

Business Details:
- What You Sell: ${whatYouSell || 'N/A'}
- Ideal Customer: ${idealCustomer || 'N/A'}
- Biggest Struggle: ${biggestStruggle || 'N/A'}
- Short Term Goal: ${shortTermGoal || 'N/A'}
- Long Term Vision: ${longTermVision || 'N/A'}
    `.trim();

    let caseId = null;
    try {
      const caseResult = await query(
        `INSERT INTO cases (
          user_id, case_number, category, email, full_name, phone, 
          case_details, status, payment_status, funnel_stage, portal_enabled
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, case_number`,
        [
          userId,
          caseNumber,
          'business',  // Category: business (part of OFFENSE)
          email,
          fullName,
          phone || null,
          caseDetails,
          'Pending Review',
          'unpaid',
          'Lead Submitted',
          false  // portal_enabled = false until admin approves
        ]
      );

      caseId = caseResult.rows[0].id;
      logger.info('Case record created for business intake', {
        caseId,
        caseNumber,
        email,
        userId
      });
    } catch (caseError) {
      logger.error('Failed to create case record for business intake', {
        error: caseError.message,
        email
      });
      return res.status(500).json({
        error: 'Failed to create case record',
        message: caseError.message
      });
    }

    // Step 3: Create timeline event
    try {
      await query(
        `INSERT INTO case_timeline (case_id, event_type, description, created_at)
         VALUES ($1, 'case_created', 'Business intake submitted (OFFENSE + BUSINESS)', CURRENT_TIMESTAMP)`,
        [caseId]
      );
    } catch (timelineError) {
      logger.warn('Failed to create timeline event', { caseId, error: timelineError.message });
      // Don't fail if timeline fails
    }

    // Step 4: Keep business_intakes record for reference (legacy)
    try {
      const intakeResult = await query(
        `INSERT INTO business_intakes (
          full_name, email, phone, business_name, website_url, instagram_url,
          tiktok_url, facebook_url, youtube_url, link_in_bio, what_you_sell,
          ideal_customer, biggest_struggle, short_term_goal, long_term_vision,
          estimated_amount, case_description, primary_goal, target_authority,
          stage, deadline, documents, status, case_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING id`,
        [
          fullName,
          email,
          phone || null,
          businessName || null,
          websiteUrl || null,
          instagramUrl || null,
          tiktokUrl || null,
          facebookUrl || null,
          youtubeUrl || null,
          linkInBio || null,
          whatYouSell || null,
          idealCustomer || null,
          biggestStruggle || null,
          shortTermGoal || null,
          longTermVision || null,
          estimatedAmount || null,
          caseDescription || null,
          primaryGoal || null,
          targetAuthority || null,
          stage || null,
          deadline || null,
          JSON.stringify(documents || []),
          'pending',
          caseId  // Link to the new case record
        ]
      );

      logger.info('Business intake record created', {
        intakeId: intakeResult.rows[0].id,
        caseId,
        email
      });
    } catch (intakeError) {
      logger.error('Failed to create business intake record', {
        error: intakeError.message,
        caseId,
        email
      });
      // Don't fail if business_intakes insert fails
    }

    // Step 5: Send email notifications (non-blocking)
    sendBusinessIntakeNotification({
      id: caseId,
      case_number: caseNumber,
      full_name: fullName,
      email: email,
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
      estimated_amount: estimatedAmount || null,
      case_description: caseDescription || null,
      primary_goal: primaryGoal || null,
      target_authority: targetAuthority || null,
      stage: stage || null,
      deadline: deadline || null,
      created_at: new Date().toISOString(),
    }).catch(err => {
      logger.error('Failed to send business intake notification email', {
        error: err.message,
        caseId,
      });
    });

    sendBusinessIntakeConfirmation({
      id: caseId,
      case_number: caseNumber,
      full_name: fullName,
      email: email,
      phone: phone || null,
      business_name: businessName || null,
      website_url: websiteUrl || null,
      created_at: new Date().toISOString(),
    }).catch(err => {
      logger.error('Failed to send business intake confirmation email', {
        error: err.message,
        caseId,
      });
    });

    res.status(200).json({
      success: true,
      message: 'Business intake received successfully',
      case_id: caseId,
      case_number: caseNumber,
      user_id: userId,
      note: 'Case created with portal_enabled=false. Admin must approve before client can access portal.'
    });
  } catch (error) {
    logger.error('Error submitting business intake', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Failed to submit business intake',
      message: error.message
    });
  }
};

module.exports = {
  submit
};
