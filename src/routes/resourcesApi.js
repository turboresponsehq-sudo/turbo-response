const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const { query } = require('../services/database/db');

// ─── Rate Limiting (in-memory, per IP) ──────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max 5 submissions per window per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true; // allowed
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return false; // blocked
  }
  return true;
}

// Clean up stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, 30 * 60 * 1000);

// ─── Permanent SendGrid key sanitizing ───────────────────────────────
const rawKey = (process.env.SENDGRID_API_KEY || "").trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();

console.log('[SENDGRID INIT] Key present:', !!rawKey);
console.log('[SENDGRID INIT] Key length:', rawKey.length);
console.log('[SENDGRID INIT] Key starts with SG.:', rawKey.startsWith('SG.'));

if (rawKey && !(/\s/.test(rawKey))) {
  sgMail.setApiKey(rawKey);
  console.log('[SENDGRID INIT] API key set successfully (clean)');
} else if (rawKey) {
  const aggressiveClean = rawKey.replace(/\s+/g, '');
  sgMail.setApiKey(aggressiveClean);
  console.log('[SENDGRID INIT] WARNING: Key had whitespace, used aggressive clean.');
} else {
  console.error('[SENDGRID INIT] ERROR: No SENDGRID_API_KEY found in environment');
}

// NOTE: resource_requests table is created in schema.sql on app startup.
// No inline table creation needed here.

/**
 * POST /api/resources/submit
 * 
 * PRIORITY ORDER:
 *   1. Validate input + guardrails (rate limit, honeypot)
 *   2. INSERT into database (source of truth)
 *   3. Send email notification (secondary, non-blocking)
 *   4. Redirect to success page
 * 
 * If DB fails → return error (submission not recorded = not accepted)
 * If email fails → still redirect to success (submission is in DB)
 */
router.post('/submit', async (req, res) => {
  try {
    // Get client IP for rate limiting and audit
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';

    // ── GUARDRAIL 1: Rate limiting ──
    if (!checkRateLimit(clientIp)) {
      console.warn(`[RESOURCES API] Rate limit exceeded for IP: ${clientIp}`);
      return res.status(429).json({
        ok: false,
        error: 'Too many submissions. Please try again in 15 minutes.'
      });
    }

    const {
      name,
      email,
      phone,
      location,
      'resources[]': resources,
      income,
      household,
      description,
      'demographics[]': demographics,
      website_url: honeypotField // Honeypot field - should be empty
    } = req.body;

    // ── GUARDRAIL 2: Honeypot check ──
    const honeypotTriggered = !!honeypotField;
    if (honeypotTriggered) {
      console.warn(`[RESOURCES API] Honeypot triggered from IP: ${clientIp}`);
      // Store in DB as spam for tracking, skip email
      try {
        await query(
          `INSERT INTO resource_requests (name, email, phone, location, resources, income_level, household_size, demographics, description, status, ip_address, honeypot_triggered)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'spam', $10, true)`,
          [name||'', email||'', phone||'', location||'', '[]', income||null, household||null, '[]', description||'', clientIp]
        );
      } catch (dbErr) {
        console.error('[RESOURCES API] Failed to store honeypot submission:', dbErr.message);
      }
      // Return success to fool the bot
      return res.redirect(303, '/resources/success');
    }

    // ── GUARDRAIL 3: Validate required fields ──
    if (!name || !email || !phone || !location || !description) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: name, email, phone, location, description'
      });
    }

    // ── GUARDRAIL 4: Stronger validation (email format, phone format, description length) ──
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        ok: false,
        error: 'Please provide a valid email address.'
      });
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return res.status(400).json({
        ok: false,
        error: 'Please provide a valid phone number (at least 10 digits).'
      });
    }

    if (description.trim().length < 20) {
      return res.status(400).json({
        ok: false,
        error: 'Please provide a more detailed description (at least 20 characters).'
      });
    }

    // ── GUARDRAIL 5: Duplicate detection (same email + similar timeframe) ──
    try {
      const dupeCheck = await query(
        `SELECT id, created_at FROM resource_requests 
         WHERE LOWER(email) = LOWER($1) 
           AND deleted_at IS NULL 
           AND created_at > NOW() - INTERVAL '24 hours'
         ORDER BY created_at DESC LIMIT 1`,
        [email.trim()]
      );
      if (dupeCheck.rows.length > 0) {
        console.warn(`[RESOURCES API] Duplicate detected: ${email} submitted within 24h (existing #${dupeCheck.rows[0].id})`);
        // Still allow but flag — redirect to success so user isn't confused
        // The admin will see the duplicate in the dashboard
      }
    } catch (dupeErr) {
      console.error('[RESOURCES API] Duplicate check failed (non-blocking):', dupeErr.message);
    }

    // Ensure arrays
    const resourcesArray = Array.isArray(resources) ? resources : (resources ? [resources] : []);
    const demographicsArray = Array.isArray(demographics) ? demographics : (demographics ? [demographics] : []);

    // ══════════════════════════════════════════════════════════════
    // STEP 1: INSERT INTO DATABASE (SOURCE OF TRUTH)
    // If this fails, the submission is NOT accepted.
    // ══════════════════════════════════════════════════════════════
    let dbRecord;
    try {
      const insertResult = await query(
        `INSERT INTO resource_requests (name, email, phone, location, resources, income_level, household_size, demographics, description, status, ip_address, honeypot_triggered, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, NOW())
         RETURNING id, created_at`,
        [
          name,
          email,
          phone,
          location,
          JSON.stringify(resourcesArray),
          income || null,
          household || null,
          JSON.stringify(demographicsArray),
          description,
          'new',
          clientIp
        ]
      );
      dbRecord = insertResult.rows[0];
      console.log(`[RESOURCES API] Submission #${dbRecord.id} stored in database (source of truth)`);
    } catch (dbError) {
      console.error('[RESOURCES API] DATABASE INSERT FAILED — submission NOT accepted:', dbError.message);
      return res.status(500).json({
        ok: false,
        error: 'Failed to save your submission. Please try again later.'
      });
    }

    // ══════════════════════════════════════════════════════════════
    // STEP 2: SEND EMAIL NOTIFICATION (SECONDARY, NON-BLOCKING)
    // If this fails, the submission is still saved in DB.
    // ══════════════════════════════════════════════════════════════
    try {
      if (!rawKey) {
        console.warn('[RESOURCES API] SendGrid API key missing — skipping email notification');
      } else {
        const resourcesList = resourcesArray.length > 0
          ? resourcesArray.map(r => `✓ ${r.replace(/_/g, ' ')}`).join('\n')
          : 'None selected';
        
        const demographicsList = demographicsArray.length > 0 
          ? demographicsArray.map(d => `✓ ${d.replace(/_/g, ' ')}`).join('\n')
          : 'None specified';

        const emailContent = {
          to: process.env.ADMIN_EMAIL || 'turboresponsehq@gmail.com',
          from: process.env.SENDGRID_FROM_EMAIL || 'turboresponsehq@gmail.com',
          subject: `🎯 New Grant Resource Request #${dbRecord.id} - ${name}`,
          text: `
New Grant & Resource Request Submitted (DB Record #${dbRecord.id})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESOURCES REQUESTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${resourcesList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOUSEHOLD INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Income Level: ${income || 'Not specified'}
Household Size: ${household || 'Not specified'}

Demographics:
${demographicsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SITUATION DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUBMISSION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Record ID: #${dbRecord.id}
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
Status: New (Pending Review)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
1. Review the request in Admin Dashboard → Resources
2. Determine which grants/resources match their needs
3. Contact them via email or phone to discuss options

This is an automated notification from Turbo Response Grant & Resource Matching System.
          `,
          html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #06b6d4; }
    .section-title { font-size: 14px; font-weight: bold; color: #06b6d4; text-transform: uppercase; margin-bottom: 10px; }
    .field { margin: 10px 0; }
    .field-label { font-weight: bold; color: #555; }
    .field-value { color: #333; margin-left: 10px; }
    .list-item { padding: 5px 0; padding-left: 20px; }
    .description { background: white; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .record-id { background: #06b6d4; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; display: inline-block; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎯 New Grant Resource Request</h1>
      <p style="margin: 10px 0 0 0;">Turbo Response Grant & Resource Matching System</p>
      <span class="record-id">Record #${dbRecord.id}</span>
    </div>

    <div class="section">
      <div class="section-title">Contact Information</div>
      <div class="field"><span class="field-label">Name:</span><span class="field-value">${name}</span></div>
      <div class="field"><span class="field-label">Email:</span><span class="field-value">${email}</span></div>
      <div class="field"><span class="field-label">Phone:</span><span class="field-value">${phone}</span></div>
      <div class="field"><span class="field-label">Location:</span><span class="field-value">${location}</span></div>
    </div>

    <div class="section">
      <div class="section-title">Resources Requested</div>
      ${resourcesArray.length > 0 ? resourcesArray.map(r => `<div class="list-item">✓ ${r.replace(/_/g, ' ')}</div>`).join('') : '<div>None selected</div>'}
    </div>

    <div class="section">
      <div class="section-title">Household Information</div>
      <div class="field"><span class="field-label">Income Level:</span><span class="field-value">${income || 'Not specified'}</span></div>
      <div class="field"><span class="field-label">Household Size:</span><span class="field-value">${household || 'Not specified'}</span></div>
      <div class="field"><span class="field-label">Demographics:</span></div>
      ${demographicsArray.length > 0 ? demographicsArray.map(d => `<div class="list-item">✓ ${d.replace(/_/g, ' ')}</div>`).join('') : '<div class="list-item">None specified</div>'}
    </div>

    <div class="section">
      <div class="section-title">Situation Description</div>
      <div class="description">${description}</div>
    </div>

    <div class="section">
      <div class="section-title">Submission Details</div>
      <div class="field"><span class="field-label">Record ID:</span><span class="field-value">#${dbRecord.id}</span></div>
      <div class="field"><span class="field-label">Submitted:</span><span class="field-value">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</span></div>
      <div class="field"><span class="field-label">Status:</span><span class="field-value">New (Pending Review)</span></div>
    </div>

    <div class="footer">
      <p><strong>Next Steps:</strong></p>
      <p>1. Review in Admin Dashboard → Resources<br>
      2. Determine which grants/resources match their needs<br>
      3. Contact them via email or phone to discuss options</p>
      <p style="margin-top: 20px; color: #999;">This is an automated notification from Turbo Response.</p>
    </div>
  </div>
</body>
</html>
          `
        };

        await sgMail.send(emailContent);
        console.log(`[RESOURCES API] Email notification sent for submission #${dbRecord.id}`);
      }
    } catch (emailError) {
      // Email failed but submission is already in DB — log and continue
      console.error(`[RESOURCES API] Email notification FAILED for submission #${dbRecord.id}:`, emailError.message);
      // Do NOT return error — the submission is saved, that's what matters
    }

    // ══════════════════════════════════════════════════════════════
    // STEP 3: REDIRECT TO SUCCESS PAGE
    // ══════════════════════════════════════════════════════════════
    res.redirect(303, '/resources/success');

  } catch (error) {
    console.error('[RESOURCES API] Unexpected error:', error.message);
    res.status(500).json({
      ok: false,
      error: 'Failed to process resource request. Please try again.'
    });
  }
});

module.exports = router;
