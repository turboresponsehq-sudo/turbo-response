const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * POST /api/resources/submit
 * Email-only resource request submission (no database)
 * Avoids React routing conflicts and Supabase initialization issues
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      'resources[]': resources,
      income,
      household,
      description,
      'demographics[]': demographics
    } = req.body;

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
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
    .section-title { font-size: 14px; font-weight: bold; color: #667eea; text-transform: uppercase; margin-bottom: 10px; }
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

    // Return JSON success (for API clients)
    res.status(200).json({
      ok: true,
      message: 'Resource request submitted successfully'
    });

  } catch (error) {
    console.error('[RESOURCES API] Error processing submission:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to process resource request',
      details: error.message
    });
  }
});

module.exports = router;
