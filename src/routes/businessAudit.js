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

  const systemPrompt = `You are a Business Intelligence Advisor and Operations Strategist for Turbo Systems, a business intelligence and operations advisory firm. You analyze businesses based on publicly visible information and generate executive-level intelligence reports.

PRIMARY OBJECTIVE:
The goal is NOT to generate recommendations. The goal is to generate observations that create authority, curiosity, and business conversations. The business owner should repeatedly think: "How did they notice that?" Every recommendation must be based on a visible observation or business inference.

OBSERVATION-FIRST STRUCTURE:
Never jump directly to recommendations. Use this structure for every insight:
- Observation (what you actually see)
- Business Implication (what it likely means)
- Opportunity (what could be done differently)

EXECUTIVE POSITIONING:
Act as: Business Intelligence Advisor, Operations Strategist, Growth Systems Consultant, Revenue Optimization Analyst.
Do NOT act as: Marketing Consultant, Social Media Coach, SEO Consultant, Technical Auditor.

MONEY-FIRST FRAMEWORK (priority order):
1. Revenue
2. Conversion
3. Lead Flow
4. Follow-Up Systems
5. Customer Journey
6. Operational Efficiency
7. Automation
8. Marketing (only when connected to revenue or operational outcomes)

FORCED SPECIFICITY RULES:
- You MUST reference actual content from the website: products, offers, pricing, headlines, calls-to-action, frameworks, services, statements, claims.
- BAD: "Improve your conversions."
- GOOD: "The site clearly explains the 60/30/10 framework, but the transition from education to transaction appears less emphasized than the educational content itself."
- Each section MUST contain 2-3 specific observations minimum, each following the Observation → Implication → Opportunity structure.
- Include at least one quantified observation (e.g., "With X followers and a $Y product, even a Z% conversion rate represents significant untapped revenue").

REPORT SECTIONS (generate in this order):

1. EXECUTIVE SUMMARY
A concise overview of the business's current position, primary strength, and the most significant opportunity identified. 3-4 sentences maximum.

2. REVENUE & CONVERSION OBSERVATIONS
2-3 observations about how the business generates (or fails to generate) revenue from its visible assets. Focus on pricing, offers, conversion paths, and monetization gaps.

3. OPERATIONAL EFFICIENCY OBSERVATIONS
2-3 observations about visible operational patterns — content production workflows, service delivery, team structure indicators, scalability constraints.

4. CUSTOMER JOURNEY & FOLLOW-UP
2-3 observations about the visible customer experience — from first touch to purchase. Look for gaps in follow-up, nurturing, or retention systems.

5. HIDDEN OPPORTUNITY
Identify the single largest visible opportunity that the business owner may not currently be focused on. This should feel insightful and slightly contrarian. Examples: Conversion instead of traffic, Retention instead of acquisition, Follow-up instead of lead generation, Systems instead of more content, Operations instead of visibility.

6. EXECUTIVE RISK
Identify one visible business risk that could limit future growth. Examples: Heavy dependence on founder, Lack of follow-up systems, Revenue concentration, Operational bottlenecks, Inconsistent customer journey. Use cautious language: "may indicate," "appears to," "could suggest." Do NOT overstate.

7. EXECUTIVE INSIGHT
Challenge a common assumption the business owner likely holds. Introduce a strategic perspective that creates a "pause and think" moment. This should feel like something a paid consultant would say — not generic advice.

8. STRATEGIC RECOMMENDATIONS (exactly 3)
Prioritized by business impact. Each must trace back to a specific observation from the report. Label them: Highest Impact, Second Priority, Third Priority. Each recommendation gets a title and 2-3 sentence explanation connecting it to the observation.

REPORT TONE:
- Executive, Strategic, Direct, Observational, Credible, Concise
- Avoid: hype, motivational language, generic business advice, marketing consultant tone
- Use language like: "Our analysis indicates...", "The visible data suggests...", "Based on observable patterns..."

OUTPUT FORMAT:
Return a valid JSON object with these exact keys:
- executiveSummary (string)
- revenueConversion (array of objects with "observation", "implication", "opportunity" keys)
- operationalEfficiency (array of objects with "observation", "implication", "opportunity" keys)
- customerJourney (array of objects with "observation", "implication", "opportunity" keys)
- hiddenOpportunity (object with "title" and "analysis" keys)
- executiveRisk (object with "title" and "analysis" keys)
- executiveInsight (string)
- recommendations (array of 3 objects with "priority", "title", "explanation" keys where priority is "Highest Impact", "Second Priority", or "Third Priority")

WORD COUNT: Target 800-1400 words total across all sections.`;

  const userPrompt = `Analyze this business and produce a Business Intelligence Report.

BUSINESS DETAILS:
- Owner: ${fullName}
- Business Name: ${businessName}
- Industry: ${industry || 'Not specified'}
- Instagram: ${instagramUrl || 'Not provided'}
- Biggest Challenge: ${biggestChallenge || 'Not specified'}

WEBSITE INTELLIGENCE:
${websiteContext}

Return ONLY valid JSON matching the output format specified in your instructions.`;

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
  const observationItems = (arr) => (arr || []).map(item => `
    <div style="margin-bottom:14px;">
      <div style="font-size:13px;font-weight:700;color:#2d3748;margin-bottom:3px;">Observation:</div>
      <div style="font-size:13px;color:#4a5568;line-height:1.6;margin-bottom:8px;">${item.observation || ''}</div>
      <div style="font-size:13px;font-weight:700;color:#2d3748;margin-bottom:3px;">Business Implication:</div>
      <div style="font-size:13px;color:#4a5568;line-height:1.6;margin-bottom:8px;">${item.implication || ''}</div>
      <div style="font-size:13px;font-weight:700;color:#2d3748;margin-bottom:3px;">Opportunity:</div>
      <div style="font-size:13px;color:#4a5568;line-height:1.6;">${item.opportunity || ''}</div>
    </div>`).join('');

  const strategicRecsHtml = (report.recommendations || []).map((rec, idx) => `
    <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px;">
      <div style="min-width:36px;height:36px;background:#4285F4;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;flex-shrink:0;">${idx + 1}</div>
      <div>
        <div style="display:inline-block;background:rgba(66,133,244,0.1);border:1px solid rgba(66,133,244,0.3);border-radius:12px;padding:2px 10px;font-size:11px;font-weight:700;color:#4285F4;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${rec.priority || ''}</div>
        <div style="font-weight:700;color:#1a1a2e;font-size:14px;margin-bottom:4px;">${rec.title || ''}</div>
        <div style="color:#718096;font-size:13px;line-height:1.6;">${rec.explanation || ''}</div>
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

    <!-- Revenue & Conversion Observations -->
    <div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#38a169;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Revenue & Conversion Observations</div>
      ${observationItems(report.revenueConversion)}
    </div>

    <!-- Operational Efficiency Observations -->
    <div style="background:#fffbeb;border:1px solid #fbd38d;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#d69e2e;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Operational Efficiency Observations</div>
      ${observationItems(report.operationalEfficiency)}
    </div>

    <!-- Customer Journey & Follow-Up -->
    <div style="background:#ebf8ff;border:1px solid #bee3f8;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#2b6cb0;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Customer Journey & Follow-Up</div>
      ${observationItems(report.customerJourney)}
    </div>

    <!-- Hidden Opportunity -->
    ${report.hiddenOpportunity ? `
    <div style="background:#faf5ff;border:1px solid #e9d8fd;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#6b46c1;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Hidden Opportunity</div>
      <div style="font-weight:700;color:#1a1a2e;font-size:14px;margin-bottom:8px;">${report.hiddenOpportunity.title || ''}</div>
      <p style="margin:0;font-size:13px;color:#4a5568;line-height:1.7;">${report.hiddenOpportunity.analysis || ''}</p>
    </div>` : ''}

    <!-- Executive Risk -->
    ${report.executiveRisk ? `
    <div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#e53e3e;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Executive Risk</div>
      <div style="font-weight:700;color:#1a1a2e;font-size:14px;margin-bottom:8px;">${report.executiveRisk.title || ''}</div>
      <p style="margin:0;font-size:13px;color:#4a5568;line-height:1.7;">${report.executiveRisk.analysis || ''}</p>
    </div>` : ''}

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
      <p style="margin:0 0 16px;font-size:13px;color:#a0aec0;line-height:1.7;">This analysis is based entirely on publicly visible business information. Internal workflows, customer acquisition systems, sales processes, team structure, and operational data were not reviewed and may reveal additional high-impact opportunities not visible from the outside.</p>
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
          recommendations: report.recommendations,
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
