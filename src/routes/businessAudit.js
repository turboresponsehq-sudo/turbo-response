/**
 * Business Intelligence Audit Route
 * POST /api/business-audit
 *
 * Receives form submission, saves lead to business_intakes table immediately,
 * then asynchronously scrapes website, generates AI report, and emails it.
 */
const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');
const { sendEmail } = require('../services/emailService');
const OpenAI = require('openai');
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Scraper ─────────────────────────────────────────────────────────────────

async function scrapeWebsite(url) {
  try {
    // Normalize URL
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TurboSystems/1.0; +https://turboresponsehq.ai)',
      },
      maxRedirects: 5,
    });
    const $ = cheerio.load(response.data);
    // Remove noise
    $('script, style, nav, footer, header, iframe, noscript').remove();

    const title = $('title').first().text().trim() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 5);
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 8);
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);

    return {
      success: true,
      title,
      metaDesc,
      headings: [...h1s, ...h2s],
      bodyText,
    };
  } catch (err) {
    logger.warn('[BusinessAudit] Website scrape failed', { url, error: err.message });
    return { success: false, error: err.message };
  }
}

// ─── AI Report Generator ─────────────────────────────────────────────────────

async function generateAuditReport(data) {
  const { fullName, businessName, websiteUrl, instagramUrl, industry, biggestChallenge, scraped } = data;

  const websiteContext = scraped && scraped.success
    ? `Website Title: ${scraped.title}\nMeta Description: ${scraped.metaDesc}\nKey Headings: ${scraped.headings.join(' | ')}\nPage Content Excerpt: ${scraped.bodyText}`
    : `Website URL provided: ${websiteUrl || 'None'}. (Could not scrape — use business info only.)`;

  const systemPrompt = `You are a senior business growth strategist and digital marketing expert. 
Your job is to produce a concise, executive-style Business Intelligence Report for a small business owner.
Be specific, actionable, and professional. Avoid generic advice. Reference their actual business details.
Output ONLY valid JSON with the exact keys specified.`;

  const userPrompt = `Analyze this business and produce a Business Intelligence Report.

BUSINESS DETAILS:
- Owner: ${fullName}
- Business Name: ${businessName}
- Industry: ${industry || 'Not specified'}
- Instagram: ${instagramUrl || 'Not provided'}
- Biggest Challenge: ${biggestChallenge || 'Not specified'}

WEBSITE INTELLIGENCE:
${websiteContext}

Return a JSON object with these exact keys:
{
  "executiveSummary": "2-3 sentence overview of the business and its current position",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "quickWins": [
    {"action": "specific action", "impact": "expected result", "timeline": "e.g. 1-2 weeks"},
    {"action": "specific action", "impact": "expected result", "timeline": "e.g. 2-4 weeks"},
    {"action": "specific action", "impact": "expected result", "timeline": "e.g. 1 month"}
  ],
  "digitalPresenceScore": "score out of 10 with one sentence explanation",
  "revenueOpportunities": ["revenue opportunity 1", "revenue opportunity 2"],
  "recommendedNextStep": "single most important next step they should take this week"
}`;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI timeout after 90 seconds')), 90000)
  );

  const apiPromise = openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  const content = response.choices[0].message.content;
  return JSON.parse(content);
}

// ─── HTML Report Builder ──────────────────────────────────────────────────────

function buildReportHtml(report, businessName, fullName) {
  const quickWinsHtml = (report.quickWins || []).map(qw => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e8ecf0;font-weight:600;color:#1a1a2e;">${qw.action}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e8ecf0;color:#4a5568;">${qw.impact}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e8ecf0;color:#4285F4;font-weight:600;white-space:nowrap;">${qw.timeline}</td>
    </tr>`).join('');

  const listItems = (arr) => (arr || []).map(item =>
    `<li style="margin-bottom:8px;padding-left:8px;">${item}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Business Intelligence Report — ${businessName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:680px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%);padding:40px 40px 32px;text-align:center;">
    <div style="font-size:13px;letter-spacing:3px;color:#4285F4;text-transform:uppercase;margin-bottom:8px;font-weight:600;">Turbo Systems</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;line-height:1.2;">Business Intelligence Report</h1>
    <div style="font-size:15px;color:#a0aec0;">Prepared exclusively for ${fullName}</div>
    <div style="margin-top:16px;display:inline-block;background:rgba(66,133,244,0.15);border:1px solid rgba(66,133,244,0.3);border-radius:20px;padding:6px 20px;">
      <span style="color:#4285F4;font-weight:700;font-size:14px;">${businessName}</span>
    </div>
  </div>

  <!-- Body -->
  <div style="padding:36px 40px;">

    <!-- Executive Summary -->
    <div style="background:#f8faff;border-left:4px solid #4285F4;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:32px;">
      <div style="font-size:11px;letter-spacing:2px;color:#4285F4;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Executive Summary</div>
      <p style="margin:0;font-size:15px;color:#2d3748;line-height:1.7;">${report.executiveSummary || ''}</p>
    </div>

    <!-- Strengths & Opportunities -->
    <div style="display:grid;gap:24px;margin-bottom:32px;">
      <div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:20px 24px;">
        <div style="font-size:11px;letter-spacing:2px;color:#38a169;text-transform:uppercase;font-weight:700;margin-bottom:12px;">✓ Strengths Identified</div>
        <ul style="margin:0;padding-left:20px;color:#2d3748;font-size:14px;line-height:1.8;">${listItems(report.strengths)}</ul>
      </div>
      <div style="background:#fffbeb;border:1px solid #fbd38d;border-radius:8px;padding:20px 24px;">
        <div style="font-size:11px;letter-spacing:2px;color:#d69e2e;text-transform:uppercase;font-weight:700;margin-bottom:12px;">◆ Growth Opportunities</div>
        <ul style="margin:0;padding-left:20px;color:#2d3748;font-size:14px;line-height:1.8;">${listItems(report.opportunities)}</ul>
      </div>
    </div>

    <!-- Digital Presence Score -->
    <div style="background:#1a1a2e;border-radius:8px;padding:20px 24px;margin-bottom:32px;text-align:center;">
      <div style="font-size:11px;letter-spacing:2px;color:#4285F4;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Digital Presence Score</div>
      <div style="font-size:36px;font-weight:900;color:#ffffff;margin-bottom:4px;">${report.digitalPresenceScore ? report.digitalPresenceScore.split(' ')[0] : 'N/A'}</div>
      <div style="font-size:13px;color:#a0aec0;">${report.digitalPresenceScore || ''}</div>
    </div>

    <!-- Quick Wins -->
    <div style="margin-bottom:32px;">
      <div style="font-size:11px;letter-spacing:2px;color:#4285F4;text-transform:uppercase;font-weight:700;margin-bottom:16px;">⚡ Quick Wins Action Plan</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e8ecf0;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f7f9fc;">
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Action</th>
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Expected Impact</th>
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Timeline</th>
          </tr>
        </thead>
        <tbody>${quickWinsHtml}</tbody>
      </table>
    </div>

    <!-- Revenue Opportunities -->
    <div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:20px 24px;margin-bottom:32px;">
      <div style="font-size:11px;letter-spacing:2px;color:#e53e3e;text-transform:uppercase;font-weight:700;margin-bottom:12px;">💰 Revenue Opportunities</div>
      <ul style="margin:0;padding-left:20px;color:#2d3748;font-size:14px;line-height:1.8;">${listItems(report.revenueOpportunities)}</ul>
    </div>

    <!-- Recommended Next Step -->
    <div style="background:linear-gradient(135deg,#4285F4,#1a73e8);border-radius:8px;padding:24px;text-align:center;margin-bottom:32px;">
      <div style="font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.7);text-transform:uppercase;font-weight:700;margin-bottom:8px;">Your #1 Priority This Week</div>
      <p style="margin:0;font-size:16px;color:#ffffff;font-weight:600;line-height:1.5;">${report.recommendedNextStep || ''}</p>
    </div>

  </div>

  <!-- Footer -->
  <div style="background:#f7f9fc;border-top:1px solid #e8ecf0;padding:24px 40px;text-align:center;">
    <div style="font-size:13px;color:#718096;margin-bottom:4px;">This report was generated by <strong style="color:#4285F4;">Turbo Systems</strong></div>
    <div style="font-size:12px;color:#a0aec0;">Questions? Reply to this email and our team will follow up.</div>
  </div>

</div>
</body>
</html>`;
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post('/business-audit', async (req, res) => {
  try {
    let { fullName, email, businessName, websiteUrl, instagramUrl, industry, biggestChallenge } = req.body;

    // Normalize
    fullName = (fullName || '').trim();
    email = (email || '').trim().toLowerCase();
    businessName = (businessName || '').trim();
    websiteUrl = (websiteUrl || '').trim();
    instagramUrl = (instagramUrl || '').trim();
    industry = (industry || '').trim();
    biggestChallenge = (biggestChallenge || '').trim();

    if (!fullName || !email || !businessName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fullName, email, businessName',
      });
    }

    // Save lead to business_intakes immediately
    const insertResult = await query(
      `INSERT INTO business_intakes
         (full_name, email, business_name, website_url, instagram_url, what_you_sell, biggest_struggle, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',NOW(),NOW())
       RETURNING id`,
      [fullName, email, businessName, websiteUrl || null, instagramUrl || null, industry || null, biggestChallenge || null]
    );
    const leadId = insertResult.rows[0]?.id;
    logger.info('[BusinessAudit] Lead saved', { leadId, email, businessName });

    // Respond immediately
    res.status(201).json({
      success: true,
      message: 'Your Business Intelligence Report is being generated and will arrive in your inbox within 10 minutes.',
      leadId,
    });

    // ── Async background processing ──────────────────────────────────────────
    (async () => {
      try {
        logger.info(`[BusinessAudit] Starting async processing for lead ${leadId}`);

        // 1. Scrape website
        let scraped = null;
        if (websiteUrl) {
          scraped = await scrapeWebsite(websiteUrl);
          logger.info(`[BusinessAudit] Scrape result`, { success: scraped.success, leadId });
        }

        // 2. Generate AI report
        const report = await generateAuditReport({
          fullName, businessName, websiteUrl, instagramUrl, industry, biggestChallenge, scraped,
        });
        logger.info(`[BusinessAudit] AI report generated for lead ${leadId}`);

        // 3. Build HTML
        const htmlReport = buildReportHtml(report, businessName, fullName);

        // 4. Email report to lead
        const emailSent = await sendEmail({
          to: email,
          subject: 'Your Turbo Systems Business Intelligence Report',
          html: htmlReport,
        });
        logger.info(`[BusinessAudit] Email sent: ${emailSent}`, { leadId, email });

        // 5. Update DB record
        const reportSummary = JSON.stringify({
          executiveSummary: report.executiveSummary,
          recommendedNextStep: report.recommendedNextStep,
          emailSent,
          generatedAt: new Date().toISOString(),
        });
        await query(
          `UPDATE business_intakes SET status='follow_up', short_term_goal=$1, updated_at=NOW() WHERE id=$2`,
          [reportSummary.slice(0, 1000), leadId]
        );
        logger.info(`[BusinessAudit] DB record updated for lead ${leadId}`);

        // 6. Notify owner
        const adminEmail = process.env.ADMIN_EMAIL || 'collinsdemarcus4@gmail.com';
        await sendEmail({
          to: adminEmail,
          subject: `📊 New Business Audit: ${businessName}`,
          html: `<p><strong>${fullName}</strong> (${email}) submitted a business audit for <strong>${businessName}</strong>.</p>
                 <p>Industry: ${industry || 'N/A'}<br>Challenge: ${biggestChallenge || 'N/A'}</p>
                 <p>Report emailed: <strong>${emailSent ? 'YES' : 'FAILED'}</strong></p>`,
        }).catch(() => {});

      } catch (asyncErr) {
        logger.error('[BusinessAudit] Async processing error', { error: asyncErr.message, leadId });
      }
    })();

  } catch (err) {
    logger.error('[BusinessAudit] Route error', { error: err.message });
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

module.exports = router;
