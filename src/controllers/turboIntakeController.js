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

// Submit new business intake form (MOBILE-HARDENED)
const submit = async (req, res, next) => {
  try {
    // Mobile-safe input extraction with trimming and normalization
    let {
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

    // MOBILE FIX 1: Trim and normalize all string inputs
    // Mobile keyboards can add invisible characters, spaces, and inconsistent casing
    fullName = typeof fullName === 'string' ? fullName.trim() : fullName;
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    phone = typeof phone === 'string' ? phone.trim() : phone;
    businessName = typeof businessName === 'string' ? businessName.trim() : businessName;
    entityType = typeof entityType === 'string' ? entityType.trim() : entityType;
    websiteUrl = typeof websiteUrl === 'string' ? websiteUrl.trim() : websiteUrl;
    instagramUrl = typeof instagramUrl === 'string' ? instagramUrl.trim() : instagramUrl;
    tiktokUrl = typeof tiktokUrl === 'string' ? tiktokUrl.trim() : tiktokUrl;
    facebookUrl = typeof facebookUrl === 'string' ? facebookUrl.trim() : facebookUrl;
    youtubeUrl = typeof youtubeUrl === 'string' ? youtubeUrl.trim() : youtubeUrl;
    linkInBio = typeof linkInBio === 'string' ? linkInBio.trim() : linkInBio;
    whatYouSell = typeof whatYouSell === 'string' ? whatYouSell.trim() : whatYouSell;
    idealCustomer = typeof idealCustomer === 'string' ? idealCustomer.trim() : idealCustomer;
    biggestStruggle = typeof biggestStruggle === 'string' ? biggestStruggle.trim() : biggestStruggle;
    shortTermGoal = typeof shortTermGoal === 'string' ? shortTermGoal.trim() : shortTermGoal;
    longTermVision = typeof longTermVision === 'string' ? longTermVision.trim() : longTermVision;
    primaryGoal = typeof primaryGoal === 'string' ? primaryGoal.trim() : primaryGoal;
    targetAuthority = typeof targetAuthority === 'string' ? targetAuthority.trim() : targetAuthority;
    stage = typeof stage === 'string' ? stage.trim() : stage;
    deadline = typeof deadline === 'string' ? deadline.trim() : deadline;
    estimatedAmount = typeof estimatedAmount === 'string' ? estimatedAmount.trim() : estimatedAmount;
    caseDescription = typeof caseDescription === 'string' ? caseDescription.trim() : caseDescription;

    // MOBILE FIX 2: Safely handle documents array
    // Mobile browsers may send null, undefined, or malformed file data
    if (!documents || !Array.isArray(documents)) {
      documents = [];
    }
    // Filter out null/undefined/empty entries from mobile file uploads
    documents = documents.filter(doc => doc && typeof doc === 'object' && doc.url);

    // MOBILE FIX 3: Validate required fields with explicit checks
    if (!fullName || !email) {
      logger.warn('Offense intake validation failed: missing required fields', { fullName, email });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fullName, email'
      });
    }

    // MOBILE FIX 4: Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn('Offense intake validation failed: invalid email format', { email });
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Generate case number
    const case_number = generateCaseNumber();

    // Insert into cases table (not business_intakes)
    // This ensures data appears in admin dashboard
    const result = await query(
      `INSERT INTO cases (
        case_number, category, status, case_details, 
        full_name, email, phone, 
        funnel_stage, portal_enabled, payment_status,
        deadline, title, case_type, description,
        business_name, entity_type, website_url, instagram_url, tiktok_url, 
        facebook_url, youtube_url, link_in_bio, primary_goal, target_authority, 
        stage, estimated_amount, documents,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW())
      RETURNING id, case_number, full_name, email, status, created_at`,
      [
        case_number,                    // case_number
        'offense',                      // category
        'Pending Review',               // status
        caseDescription || `Business: ${businessName}`,  // case_details
        fullName,                       // full_name
        email,                          // email
        phone || null,                  // phone
        'Lead Submitted',               // funnel_stage
        false,                          // portal_enabled
        'unpaid',                       // payment_status
        deadline || null,               // deadline
        businessName || fullName,       // title
        'offense',                      // case_type
        caseDescription || `Business: ${businessName}`,  // description
        businessName || null,           // business_name
        entityType || null,             // entity_type
        websiteUrl || null,             // website_url
        instagramUrl || null,           // instagram_url
        tiktokUrl || null,              // tiktok_url
        facebookUrl || null,            // facebook_url
        youtubeUrl || null,             // youtube_url
        linkInBio || null,              // link_in_bio
        primaryGoal || null,            // primary_goal
        targetAuthority || null,        // target_authority
        stage || null,                  // stage
        estimatedAmount || null,        // estimated_amount
        JSON.stringify(documents)       // documents (JSONB)
      ]
    );

    const newCase = result.rows[0];

    logger.info('New offense case submitted', {
      caseId: newCase.id,
      caseNumber: newCase.case_number,
      email: newCase.email,
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
      case_number: newCase.case_number,
      full_name: newCase.full_name,
      email: newCase.email,
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
      created_at: newCase.created_at,
    }).catch(err => {
      logger.error('Failed to send offense case notification email', {
        error: err.message,
        caseId: newCase.id,
      });
    });

    // Send confirmation email to client (non-blocking)
    sendBusinessIntakeConfirmation({
      id: newCase.id,
      case_number: newCase.case_number,
      full_name: newCase.full_name,
      email: newCase.email,
      phone: phone || null,
      business_name: businessName || null,
      website_url: websiteUrl || null,
      created_at: newCase.created_at,
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
      case_number: newCase.case_number,
      case: newCase
    });
  } catch (error) {
    logger.error('Error submitting offense intake', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit offense intake',
      message: error.message
    });
  }
};

module.exports = {
  submit
};
