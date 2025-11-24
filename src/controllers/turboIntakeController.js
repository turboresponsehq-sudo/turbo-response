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

    // Insert business intake into database
    const result = await query(
      `INSERT INTO business_intakes (
        full_name, email, phone, business_name, website_url, instagram_url,
        tiktok_url, facebook_url, youtube_url, link_in_bio, what_you_sell,
        ideal_customer, biggest_struggle, short_term_goal, long_term_vision,
        documents, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, full_name, email, status, created_at`,
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
        JSON.stringify(documents || []),
        'pending'
      ]
    );

    const newIntake = result.rows[0];

    logger.info('New business intake submitted', {
      intakeId: newIntake.id,
      email: newIntake.email,
      businessName
    });

    // Send email notification to admin (non-blocking)
    sendBusinessIntakeNotification({
      id: newIntake.id,
      full_name: newIntake.full_name,
      email: newIntake.email,
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
      created_at: newIntake.created_at,
    }).catch(err => {
      logger.error('Failed to send business intake notification email', {
        error: err.message,
        intakeId: newIntake.id,
      });
    });

    // Send confirmation email to client (non-blocking)
    sendBusinessIntakeConfirmation({
      id: newIntake.id,
      full_name: newIntake.full_name,
      email: newIntake.email,
      phone: phone || null,
      business_name: businessName || null,
      website_url: websiteUrl || null,
      created_at: newIntake.created_at,
    }).catch(err => {
      logger.error('Failed to send business intake confirmation email', {
        error: err.message,
        intakeId: newIntake.id,
      });
    });

    res.status(200).json({
      success: true,
      message: 'Business intake received successfully',
      intake_id: newIntake.id,
      intake: newIntake
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
