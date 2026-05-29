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

  const systemPrompt = `ROLE

You are Turbo Systems Business Intelligence — an executive business strategist specializing in operations, revenue systems, customer acquisition infrastructure, automation, and business growth.

Your job is to identify visible business opportunities, operational bottlenecks, positioning weaknesses, revenue gaps, and automation opportunities based on publicly available business information.

You are NOT performing a technical audit. You are performing a strategic business observation.

CRITICAL INSTRUCTIONS

1. You MUST reference at least 3 specific details from the business's actual website content, social presence, or stated challenge. Generic observations that could apply to any business are unacceptable.

2. You MUST address the business owner's stated challenge by name in the Executive Summary and tie at least one recommendation directly to solving it.

3. Prioritize observations in this order:
   - Operations first (how the business runs, processes, systems)
   - Revenue second (how money is made, conversion, monetization)
   - Marketing third (visibility, positioning, audience)

4. Create at least 2-3 "how did they notice that?" moments — observations that feel specific and insightful enough that the business owner feels genuinely analyzed, not generically assessed.

5. Do NOT use generic recommendations like "improve conversions" or "use automation" or "increase visibility" without explaining the SPECIFIC gap you observed and WHY it matters for THIS business.

6. When making observations, be specific. Instead of "improve calls to action," say something like: "Your public-facing content strongly communicates [specific thing], but there appears to be a gap between [specific observation] and [specific outcome]. A visitor can quickly understand [X], but it is less clear what the next purchasing step should be."

7. Mix confident observations with hedging language. Use hedging ("may indicate," "appears to," "suggests") for uncertain inferences, but use confident language for things that are clearly visible.

Rule 1: Observation Before Recommendation

Every recommendation must be preceded by an observation, an indicator, and a business inference. Never just say "Do X." Instead: "We observed Y, which may indicate Z. Therefore, consider X."

Rule 2: Force One Contrarian Insight

The Executive Insight section MUST contain a contrarian or non-obvious observation. Something the business owner has NOT already thought of. Example pattern: "Businesses at this stage often believe their next challenge is [common assumption]. Based on the public signals reviewed, the larger opportunity may be [unexpected insight] rather than [what they expect]."

Rule 3: Money Language

The report should frequently reference: revenue, conversion, lead flow, customer journey, response speed, follow-up, retention, monetization. Avoid centering observations around: engagement, followers, content consistency — UNLESS those directly connect to a revenue outcome.

Rule 4: Prioritize Opportunities

In the Strategic Recommendations section, frame recommendations as prioritized impact areas. Label them clearly (e.g., "Highest Impact," "Second Priority," "Third Priority"). Business owners respond to clear prioritization. Use these labels as the priority field values in the JSON.

Rule 5: End With a Gap

The closing CTA must create curiosity about what ELSE might be found. Use the exact closing text specified in the CALL TO ACTION section below.

TONE

Executive. Strategic. Consultative. Professional. Clear. Confident. Specific.

Write like a senior strategist who has analyzed hundreds of businesses and can immediately see patterns and opportunities.

LENGTH

700-1200 words maximum.

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

REPORT SECTIONS — return a JSON object with these exact keys:
{
  "executiveSummary": "Short overview of the business, its visible strengths, and the most important opportunities observed. MUST reference the owner's stated challenge directly.",
  "customerAcquisition": ["specific observation about lead generation, messaging, trust building, social presence, calls to action, or conversion — reference actual content from their website or social presence"],
  "operationalEfficiency": ["specific observation about manual process indicators, follow-up weaknesses, communication bottlenecks, workflow inefficiencies, or scalability constraints — focus on HOW the business appears to operate"],
  "automationOpportunities": ["specific area where automation could improve lead handling, customer communication, intake, scheduling, reporting, or follow-up — state WHAT should be automated and WHY based on what you observed"],
  "revenueOpportunities": ["specific opportunity to increase conversion, improve retention, improve response speed, strengthen monetization systems, or improve the customer journey — focus on the gap between audience/traffic and actual revenue generation"],
  "executiveInsight": "One powerful paragraph synthesizing the most important strategic observation about this business. Identify WHERE the business is in its growth journey and what the NEXT constraint is. This is the 'how did they know that?' moment. Write directly to the owner.",
  "strategicRecommendations": [
    {"priority": "Highest Impact", "action": "specific highest-impact action tied to an observed gap", "rationale": "observation + indicator + business inference for THIS business"},
    {"priority": "Second Priority", "action": "specific second highest-impact action", "rationale": "observation + indicator + business inference for THIS business"},
    {"priority": "Third Priority", "action": "specific third highest-impact action", "rationale": "observation + indicator + business inference for THIS business"}
  ]
}

CALL TO ACTION

Close the report with exactly this text (do not include it in the JSON — it will be appended by the system):

"These observations are based entirely on publicly visible business information. Internal workflows, customer acquisition data, sales processes, and operational systems were not reviewed and may reveal additional high-impact opportunities not visible from the outside.

If you would like a deeper business intelligence review, workflow assessment, or automation strategy session, Turbo Systems can provide a customized implementation roadmap."`;

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
  const listItems = (arr) => (arr || []).map(item =>
    `<li style="margin-bottom:10px;padding-left:4px;color:#2d3748;font-size:14px;line-height:1.7;">${item}</li>`).join('');

  const strategicRecsHtml = (report.strategicRecommendations || []).map(rec => `
    <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px;">
      <div style="min-width:32px;height:32px;background:#4285F4;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;flex-shrink:0;line-height:32px;text-align:center;">${rec.priority}</div>
      <div>
        <div style="font-weight:700;color:#1a1a2e;font-size:14px;margin-bottom:4px;">${rec.action}</div>
        <div style="color:#718096;font-size:13px;line-height:1.6;">${rec.rationale}</div>
      </div>
    </div>`).join('');

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

    <!-- Customer Acquisition -->
    <div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#38a169;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Customer Acquisition Observations</div>
      <ul style="margin:0;padding-left:20px;">${listItems(report.customerAcquisition)}</ul>
    </div>

    <!-- Operational Efficiency -->
    <div style="background:#fffbeb;border:1px solid #fbd38d;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#d69e2e;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Operational Efficiency Opportunities</div>
      <ul style="margin:0;padding-left:20px;">${listItems(report.operationalEfficiency)}</ul>
    </div>

    <!-- Automation Opportunities -->
    <div style="background:#ebf8ff;border:1px solid #bee3f8;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#2b6cb0;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Automation Opportunities</div>
      <ul style="margin:0;padding-left:20px;">${listItems(report.automationOpportunities)}</ul>
    </div>

    <!-- Revenue Opportunities -->
    <div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#e53e3e;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Revenue Opportunity Areas</div>
      <ul style="margin:0;padding-left:20px;">${listItems(report.revenueOpportunities)}</ul>
    </div>

    <!-- Executive Insight -->
    ${report.executiveInsight ? `
    <div style="background:#1a1a2e;border-radius:8px;padding:24px 28px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#4285F4;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Executive Insight</div>
      <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.8;font-style:italic;">${report.executiveInsight}</p>
    </div>` : ''}

    <!-- Strategic Recommendations -->
    <div style="margin-bottom:32px;">
      <div style="font-size:11px;letter-spacing:2px;color:#4285F4;text-transform:uppercase;font-weight:700;margin-bottom:16px;">Strategic Recommendations</div>
      ${strategicRecsHtml}
    </div>

    <!-- Call to Action -->
    <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);border-radius:8px;padding:28px 32px;margin-bottom:8px;">
      <p style="margin:0 0 16px;font-size:13px;color:#a0aec0;line-height:1.7;">These observations are based entirely on publicly visible business information. Internal workflows, customer acquisition data, sales processes, and operational systems were not reviewed and may reveal additional high-impact opportunities not visible from the outside.</p>
      <p style="margin:0;font-size:14px;color:#ffffff;line-height:1.7;">If you would like a deeper business intelligence review, workflow assessment, or automation strategy session, <strong style="color:#4285F4;">Turbo Systems</strong> can provide a customized implementation roadmap.</p>
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

        // 5. Update DB record — store full HTML report in long_term_vision (TEXT, no length limit)
        const reportSummary = JSON.stringify({
          executiveSummary: report.executiveSummary,
          recommendedNextStep: report.recommendedNextStep,
          emailSent,
          generatedAt: new Date().toISOString(),
        });
        await query(
          `UPDATE business_intakes SET status='follow_up', short_term_goal=$1, long_term_vision=$2, updated_at=NOW() WHERE id=$3`,
          [reportSummary.slice(0, 1000), htmlReport, leadId]
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

// ─── GET /api/business-audit/list ───────────────────────────────────────────
// Returns JSON array of all business audit submissions for the owner dashboard.
// Must be registered BEFORE /:id to avoid 'list' being treated as an ID.

router.get('/business-audit/list', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, business_name, email, status, created_at
       FROM business_intakes
       ORDER BY created_at DESC
       LIMIT 200`
    );
    res.json({
      success: true,
      total: result.rows.length,
      leads: result.rows.map(r => ({
        id: r.id,
        fullName: r.full_name,
        businessName: r.business_name,
        email: r.email,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    logger.error('[BusinessAudit] List error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/business-audit/:id ─────────────────────────────────────────────
// Serves the branded HTML report for a given business audit ID.

router.get('/business-audit/:id', async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).send('<h2>Invalid ID</h2>');
  }
  try {
    const result = await query(
      `SELECT id, full_name, business_name, email, status, long_term_vision, created_at
       FROM business_intakes WHERE id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send(`<!DOCTYPE html><html><head><title>Not Found</title></head><body style="font-family:sans-serif;max-width:600px;margin:80px auto;text-align:center;"><h2 style="color:#e53e3e;">Report Not Found</h2><p>No business audit with ID <strong>${id}</strong> exists.</p></body></html>`);
    }
    const row = result.rows[0];
    // Report stored in long_term_vision column
    if (row.long_term_vision && row.long_term_vision.trim().startsWith('<!DOCTYPE')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(row.long_term_vision);
    }
    // Report not yet generated
    const pendingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="refresh" content="30">
<title>Report Generating — Turbo Systems</title>
<style>
  body{margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}
  .card{background:#fff;border-radius:12px;padding:48px 40px;max-width:480px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.10);}
  .spinner{width:48px;height:48px;border:4px solid #e8ecf0;border-top-color:#4285F4;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px;}
  @keyframes spin{to{transform:rotate(360deg)}}
  h2{margin:0 0 12px;color:#1a1a2e;font-size:22px;}
  p{color:#718096;font-size:15px;line-height:1.6;margin:0 0 16px;}
  .badge{display:inline-block;background:#ebf4ff;color:#4285F4;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:600;}
</style>
</head>
<body>
<div class="card">
  <div class="spinner"></div>
  <h2>Your Report is Being Generated</h2>
  <p>Our AI is analyzing <strong>${row.business_name || 'your business'}</strong> and building your Business Intelligence Report.</p>
  <p>This page will refresh automatically. You'll also receive the report by email.</p>
  <div class="badge">⏱ Check back in a few minutes</div>
</div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(pendingHtml);
  } catch (err) {
    logger.error('[BusinessAudit] GET /:id error', { error: err.message, id });
    res.status(500).send('<h2>Server error. Please try again.</h2>');
  }
});

module.exports = router;
