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
// Strips quotes, whitespace, newlines, carriage returns, and "Bearer " prefix
const rawKey = (process.env.SENDGRID_API_KEY || "").trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();

// Safe debug logging (NO secrets exposed)
console.log('[SENDGRID INIT] Key present:', !!rawKey);
console.log('[SENDGRID INIT] Key length:', rawKey.length);
console.log('[SENDGRID INIT] Key starts with SG.:', rawKey.startsWith('SG.'));
console.log('[SENDGRID INIT] Has whitespace:', /\s/.test(rawKey));
console.log('[SENDGRID INIT] Has newline:', /[\r\n]/.test(rawKey));

if (rawKey && !(/\s/.test(rawKey))) {
  sgMail.setApiKey(rawKey);
  console.log('[SENDGRID INIT] API key set successfully (clean)');
} else if (rawKey) {
  // Key exists but has whitespace - still try after aggressive clean
  const aggressiveClean = rawKey.replace(/\s+/g, '');
  sgMail.setApiKey(aggressiveClean);
  console.log('[SENDGRID INIT] WARNING: Key had whitespace, used aggressive clean. Length after:', aggressiveClean.length);
} else {
  console.error('[SENDGRID INIT] ERROR: No SENDGRID_API_KEY found in environment');
}

/**
 * POST /api/resources/submit
 * Resource request submission with email + database storage
 */
router.post('/submit', async (req, res) => {
  try {
    // Get client IP for rate limiting and audit
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';

    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      console.warn(`[RESOURCES API] Rate limit exceeded for IP: ${clientIp}`);
      return res.status(429).json({
        ok: false,
        error: 'Too many submissions. Please try again in 15 minutes.'
      });
    }

    // Check if SendGrid is configured before attempting to send
    if (!rawKey) {
      console.error('[RESOURCES API] SendGrid API key is missing');
      return res.status(500).json({
        ok: false,
        error: 'Email service not configured. Please contact support.'
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

    // Honeypot check - if this hidden field has a value, it's a bot
    const honeypotTriggered = !!honeypotField;
    if (honeypotTriggered) {
      console.warn(`[RESOURCES API] Honeypot triggered from IP: ${clientIp}`);
      // Still store in DB for tracking but skip email
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS resource_requests (
            id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
            phone TEXT NOT NULL, location TEXT NOT NULL, resources TEXT,
            income_level TEXT, household_size TEXT, description TEXT NOT NULL,
            demographics TEXT, status TEXT DEFAULT 'spam', ip_address TEXT,
            honeypot_triggered BOOLEAN DEFAULT FALSE, deleted_at TIMESTAMP WITH TIME ZONE,
            deleted_by TEXT, delete_reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
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

    // Validate required fields
    if (!name || !email || !phone || !location || !description) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: name, email, phone, location, description'
      });
    }

    // Ensure arrays
    const resourcesArray = Array.isArray(resources) ? resources : (resources ? [resources] : []);
    const demographicsArray = Array.isArray(demographics) ? demographics : (demographics ? [demographics] : []);

    // Format data for email
    const resourcesList = resourcesArray.length > 0
      ? resourcesArray.map(r => `✓ ${r.replace(/_/g, ' ')}`).join('\n')
      : 'None selected';
    
    const demographicsList = demographicsArray.length > 0 
      ? demographicsArray.map(d => `✓ ${d.replace(/_/g, ' ')}`).join('\n')
      : 'None specified';

    // Send email notification to admin
    const emailContent = {
      to: process.env.ADMIN_EMAIL || 'turboresponsehq@gmail.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'turboresponsehq@gmail.com',
      subject: `🎯 New Grant Resource Request - ${name}`,
      text: `
New Grant & Resource Request Submitted

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

Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
Status: Pending Review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
1. Review the request details above
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎯 New Grant Resource Request</h1>
      <p style="margin: 10px 0 0 0;">Turbo Response Grant & Resource Matching System</p>
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
      <div class="field"><span class="field-label">Submitted:</span><span class="field-value">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</span></div>
      <div class="field"><span class="field-label">Status:</span><span class="field-value">Pending Review</span></div>
    </div>

    <div class="footer">
      <p><strong>Next Steps:</strong></p>
      <p>1. Review the request details above<br>
      2. Determine which grants/resources match their needs<br>
      3. Contact them via email or phone to discuss options</p>
      <p style="margin-top: 20px; color: #999;">This is an automated notification from Turbo Response.</p>
    </div>
  </div>
</body>
</html>
      `
    };

    // Send email
    await sgMail.send(emailContent);
    console.log('[RESOURCES API] Email sent successfully to:', emailContent.to);

    // Insert into database (source of truth) using raw SQL
    try {
      // Auto-create table if it doesn't exist yet
      await query(`
        CREATE TABLE IF NOT EXISTS resource_requests (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          location TEXT NOT NULL,
          resources TEXT,
          income_level TEXT,
          household_size TEXT,
          description TEXT NOT NULL,
          demographics TEXT,
          status TEXT DEFAULT 'new',
          ip_address TEXT,
          honeypot_triggered BOOLEAN DEFAULT FALSE,
          deleted_at TIMESTAMP WITH TIME ZONE,
          deleted_by TEXT,
          delete_reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Add columns if they don't exist (for existing tables)
      const alterQueries = [
        `ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS ip_address TEXT`,
        `ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS honeypot_triggered BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE`,
        `ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS deleted_by TEXT`,
        `ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS delete_reason TEXT`
      ];
      for (const q of alterQueries) {
        try { await query(q); } catch (e) { /* column may already exist */ }
      }

      await query(
        `INSERT INTO resource_requests (name, email, phone, location, resources, income_level, household_size, demographics, description, status, ip_address, honeypot_triggered, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, NOW())`,
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
      console.log('[RESOURCES API] Submission stored in database successfully');
    } catch (dbError) {
      console.error('[RESOURCES API] Failed to store submission in database:', dbError.message);
      // Continue anyway - email was sent successfully
    }

    // Redirect to branded success page instead of returning JSON
    res.redirect(303, '/resources/success');

  } catch (error) {
    console.error('[RESOURCES API] Error processing submission:', error.message);
    
    // Provide clear error without exposing secrets
    let userMessage = 'Failed to process resource request';
    if (error.message && error.message.includes('Invalid character in header')) {
      userMessage = 'Email service configuration error. The API key contains invalid characters. Please contact admin to re-paste the SendGrid key in Render (raw key only, no quotes/spaces/newlines).';
    } else if (error.code === 401 || error.message.includes('Unauthorized')) {
      userMessage = 'Email service authentication failed. Please verify the SendGrid API key.';
    }

    res.status(500).json({
      ok: false,
      error: userMessage
    });
  }
});

module.exports = router;
