/**
 * Business Intelligence Audit Route
 * POST /api/business-audit
 *
 * Receives form submission, saves lead to business_intakes table immediately,
 * then asynchronously scrapes website, generates AI report, and emails it.
 *
 * Scraper Fallback Chain (v3.4):
 *   Level 1: Jina.ai reader (most reliable — renders JS, returns markdown)
 *   Level 2: Direct HTML fetch + cheerio extraction
 *   Level 3: Meta/OG tag extraction only
 *   Level 4: Form-provided business details as evidence base
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

// ─── Scraper Level 1: Jina.ai Reader (PRIMARY) ──────────────────────────────

async function scrapeLevel1_Jina(url) {
  console.log(`[BusinessAudit] L1 (jina.ai): attempting ${url}`);
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    console.log(`[BusinessAudit] L1: fetching ${jinaUrl}`);
    const response = await axios.get(jinaUrl, {
      timeout: 45000,
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (compatible; TurboSystems/1.0)',
      },
    });

    const markdown = (typeof response.data === 'string') ? response.data : '';
    console.log(`[BusinessAudit] L1 (jina.ai): received ${markdown.length} chars`);

    if (markdown.length < 100) {
      console.log(`[BusinessAudit] L1 (jina.ai): INSUFFICIENT content (${markdown.length} chars < 100 threshold)`);
      return { success: false, level: 1, error: 'Jina returned insufficient content', contentLength: 0 };
    }

    // Parse the markdown response to extract structured data
    const lines = markdown.split('\n');
    const titleMatch = markdown.match(/^Title:\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract headings from markdown (## heading format)
    const headings = lines
      .filter(l => /^#{1,3}\s/.test(l))
      .map(l => l.replace(/^#+\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 20);

    // Extract pricing from markdown text
    const priceMatches = (markdown.match(/\$\d+[\d,.]*|\d+\s*(?:\/mo|\/month|\/year|per month)/gi) || []).slice(0, 10);

    // Extract meaningful paragraphs (lines with 30+ chars that aren't headings or metadata)
    const paragraphs = lines
      .filter(l => l.length > 30 && !l.startsWith('#') && !l.startsWith('Title:') && !l.startsWith('URL Source:') && !l.startsWith('Markdown Content:') && !l.startsWith('!['))
      .map(l => l.trim())
      .slice(0, 25);

    // Extract CTA-like text
    const ctas = lines
      .filter(l => l.length > 2 && l.length < 80 && /buy|start|get|join|sign|book|schedule|enroll|download|free|try|order|subscribe|apply|register|claim|access|unlock|copy|checkout/i.test(l))
      .map(l => l.replace(/^\[|\].*$/g, '').replace(/[*_`]/g, '').trim())
      .filter(Boolean)
      .slice(0, 10);

    // Extract list items (markdown bullet points)
    const listItems = lines
      .filter(l => /^[-*]\s/.test(l) && l.length > 5 && l.length < 200)
      .map(l => l.replace(/^[-*]\s*/, '').trim())
      .slice(0, 20);

    const contentLength = markdown.length;

    console.log(`[BusinessAudit] L1 (jina.ai): SUCCESS — ${contentLength} chars, ${headings.length} headings, ${paragraphs.length} paragraphs, ${priceMatches.length} prices, ${ctas.length} CTAs`);

    return {
      success: true,
      level: 1,
      title,
      metaDesc: '',
      ogTitle: '',
      ogImage: '',
      headings,
      paragraphs,
      ctas,
      pricing: [...new Set(priceMatches)],
      listItems,
      bodyText: markdown.slice(0, 6000),
      contentLength,
    };
  } catch (err) {
    console.log(`[BusinessAudit] L1 (jina.ai): FAILED — ${err.message}`);
    return { success: false, level: 1, error: err.message, contentLength: 0 };
  }
}

// ─── Scraper Level 2: Direct HTML Fetch + Cheerio (FALLBACK) ─────────────────

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

async function scrapeLevel2_DirectFetch(url) {
  console.log(`[BusinessAudit] L2 (direct fetch): attempting ${url}`);
  try {
    let response;
    try {
      response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 400,
      });
    } catch (httpsErr) {
      // Try HTTP fallback if HTTPS fails
      if (url.startsWith('https://')) {
        const httpUrl = url.replace('https://', 'http://');
        console.log(`[BusinessAudit] L2: HTTPS failed, trying HTTP: ${httpUrl}`);
        response = await axios.get(httpUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': USER_AGENTS[0],
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          maxRedirects: 5,
          validateStatus: (status) => status < 400,
        });
      } else {
        throw httpsErr;
      }
    }

    const html = (typeof response.data === 'string') ? response.data : '';
    console.log(`[BusinessAudit] L2: received ${html.length} chars of HTML`);

    if (html.length < 200) {
      console.log(`[BusinessAudit] L2: INSUFFICIENT HTML (${html.length} chars)`);
      return { success: false, level: 2, error: 'HTML response too short', contentLength: 0 };
    }

    const extracted = extractFromHtml(html);
    const meaningfulText = extracted.bodyText.length;

    console.log(`[BusinessAudit] L2 (direct fetch): bodyText=${meaningfulText} chars, headings=${extracted.headings.length}, paragraphs=${extracted.paragraphs.length}, pricing=${extracted.pricing.length}, ctas=${extracted.ctas.length}`);

    if (meaningfulText < 200) {
      console.log(`[BusinessAudit] L2: THIN content after extraction (${meaningfulText} chars)`);
      return { ...extracted, success: false, level: 2, error: 'Thin content after extraction', contentLength: meaningfulText };
    }

    console.log(`[BusinessAudit] L2 (direct fetch): SUCCESS — ${meaningfulText} chars meaningful text`);
    return { ...extracted, success: true, level: 2, contentLength: meaningfulText };
  } catch (err) {
    console.log(`[BusinessAudit] L2 (direct fetch): FAILED — ${err.message}`);
    return { success: false, level: 2, error: err.message, contentLength: 0 };
  }
}

function extractFromHtml(html) {
  const $ = cheerio.load(html);

  // Remove noise elements
  $('script, style, nav, footer, iframe, noscript, svg, [aria-hidden="true"]').remove();

  const title = $('title').first().text().trim() || '';
  const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  // Get all headings (h1-h3)
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 8);
  const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 12);
  const h3s = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 10);

  // Extract pricing indicators
  const priceElements = $('[class*="price"], [class*="Price"], [data-price], .pricing, .cost, .amount').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 10);
  const priceMatches = (html.match(/\$\d+[\d,.]*|\d+\s*(?:\/mo|\/month|\/year|per month)/gi) || []).slice(0, 10);

  // Extract CTAs
  const ctas = $('a, button').map((_, el) => $(el).text().trim()).get()
    .filter(t => t.length > 2 && t.length < 80 && /buy|start|get|join|sign|book|schedule|enroll|download|free|try|order|subscribe|apply|register|claim|access|unlock|copy|checkout/i.test(t))
    .slice(0, 10);

  // Extract paragraphs and meaningful text blocks
  const paragraphs = $('p, [class*="description"], [class*="about"], [class*="hero"], [class*="tagline"], [class*="subtitle"], blockquote, .lead, [class*="intro"]')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(t => t.length > 30 && t.length < 1000)
    .slice(0, 25);

  // Extract list items
  const listItems = $('li').map((_, el) => $(el).text().trim()).get()
    .filter(t => t.length > 5 && t.length < 200)
    .slice(0, 20);

  // Get full body text (5000 chars)
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

  return {
    title,
    metaDesc,
    ogTitle,
    ogImage,
    headings: [...h1s, ...h2s, ...h3s],
    paragraphs,
    ctas,
    pricing: [...new Set([...priceElements, ...priceMatches])],
    listItems,
    bodyText,
  };
}

// ─── Scraper Level 3: Meta/OG Tag Extraction Only ────────────────────────────

async function scrapeLevel3_Meta(url) {
  console.log(`[BusinessAudit] L3 (meta/OG): attempting ${url}`);
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': USER_AGENTS[0],
        'Accept': 'text/html',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    const $ = cheerio.load(response.data);
    const title = $('title').first().text().trim() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const ogSiteName = $('meta[property="og:site_name"]').attr('content') || '';
    const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
    const twitterDesc = $('meta[name="twitter:description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    const socialLinks = $('a[href*="instagram.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="facebook.com"], a[href*="tiktok.com"], a[href*="youtube.com"]')
      .map((_, el) => $(el).attr('href'))
      .get()
      .slice(0, 10);

    const metaContent = [title, metaDesc, ogTitle, ogDesc, ogSiteName, twitterTitle, twitterDesc, keywords].filter(Boolean).join(' ');

    console.log(`[BusinessAudit] L3 (meta/OG): title="${title}", ogTitle="${ogTitle}", metaDesc="${metaDesc ? metaDesc.slice(0, 60) + '...' : ''}", totalLength=${metaContent.length}`);

    if (metaContent.length <= 20) {
      console.log(`[BusinessAudit] L3: INSUFFICIENT meta content (${metaContent.length} chars)`);
      return { success: false, level: 3, error: 'Insufficient meta content', contentLength: 0 };
    }

    console.log(`[BusinessAudit] L3 (meta/OG): SUCCESS — ${metaContent.length} chars from meta tags`);
    return {
      success: true,
      level: 3,
      title: title || ogTitle || twitterTitle,
      metaDesc: metaDesc || ogDesc || twitterDesc,
      ogTitle,
      ogImage,
      ogSiteName,
      headings: [title, ogTitle].filter(Boolean),
      paragraphs: [metaDesc, ogDesc, twitterDesc].filter(Boolean),
      ctas: [],
      pricing: [],
      listItems: [],
      bodyText: metaContent,
      keywords,
      socialLinks,
      contentLength: metaContent.length,
    };
  } catch (err) {
    console.log(`[BusinessAudit] L3 (meta/OG): FAILED — ${err.message}`);
    return { success: false, level: 3, error: err.message, contentLength: 0 };
  }
}

// ─── Scraper Orchestrator ────────────────────────────────────────────────────

async function scrapeWebsite(url) {
  // Normalize URL
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  console.log(`[BusinessAudit] ═══ SCRAPER START ═══ URL: ${url}`);

  // Level 1: Jina.ai reader (PRIMARY — most reliable, renders JS)
  const jinaResult = await scrapeLevel1_Jina(url);
  if (jinaResult.success && jinaResult.contentLength >= 300) {
    console.log(`[BusinessAudit] ✓ Using L1 (jina.ai) — ${jinaResult.contentLength} chars`);
    return jinaResult;
  }

  // Level 2: Direct HTML fetch + cheerio
  console.log(`[BusinessAudit] L1 insufficient (${jinaResult.contentLength || 0} chars), falling back to L2 (direct fetch)...`);
  const fetchResult = await scrapeLevel2_DirectFetch(url);
  if (fetchResult.success && fetchResult.contentLength >= 300) {
    console.log(`[BusinessAudit] ✓ Using L2 (direct fetch) — ${fetchResult.contentLength} chars`);
    return fetchResult;
  }

  // Level 3: Meta/OG tags only
  console.log(`[BusinessAudit] L2 insufficient (${fetchResult.contentLength || 0} chars), falling back to L3 (meta/OG)...`);
  const metaResult = await scrapeLevel3_Meta(url);
  if (metaResult.success) {
    console.log(`[BusinessAudit] ✓ Using L3 (meta/OG) — ${metaResult.contentLength} chars`);
    return metaResult;
  }

  // Return best available result even if thin
  console.log(`[BusinessAudit] ✗ ALL LEVELS FAILED or thin content`);
  if (jinaResult.contentLength > 0) {
    console.log(`[BusinessAudit] Returning best available: L1 jina with ${jinaResult.contentLength} chars`);
    return { ...jinaResult, success: true };
  }
  if (fetchResult.contentLength > 0) {
    console.log(`[BusinessAudit] Returning best available: L2 fetch with ${fetchResult.contentLength} chars`);
    return { ...fetchResult, success: true };
  }

  console.log(`[BusinessAudit] ═══ SCRAPER END ═══ TOTAL FAILURE — no content retrieved`);
  return { success: false, level: 0, error: 'All scraper levels failed', contentLength: 0 };
}

// ─── Evidence Scoring ────────────────────────────────────────────────────────

function calculateEvidenceScore(scraped, formData) {
  let score = 0;
  const details = [];

  if (scraped && scraped.success) {
    // Headlines: +2 each
    const headingCount = Math.min((scraped.headings || []).length, 10);
    score += headingCount * 2;
    if (headingCount > 0) details.push(`headings:+${headingCount * 2}`);

    // Paragraphs with 50+ chars: +1 each
    const paraCount = (scraped.paragraphs || []).filter(p => p.length >= 50).length;
    score += Math.min(paraCount, 10);
    if (paraCount > 0) details.push(`paragraphs:+${Math.min(paraCount, 10)}`);

    // Pricing found: +3
    if ((scraped.pricing || []).length > 0) {
      score += 3;
      details.push('pricing:+3');
    }

    // CTAs found: +2 each
    const ctaCount = Math.min((scraped.ctas || []).length, 5);
    score += ctaCount * 2;
    if (ctaCount > 0) details.push(`ctas:+${ctaCount * 2}`);

    // Bonus: if bodyText is substantial, add points
    if ((scraped.bodyText || '').length >= 1000) {
      score += 3;
      details.push('bodyText:+3');
    }
  }

  // Form-provided details: +2 each
  if (formData.mainOffer) { score += 2; details.push('mainOffer:+2'); }
  if (formData.priceRange) { score += 2; details.push('priceRange:+2'); }
  if (formData.mainCTA) { score += 2; details.push('mainCTA:+2'); }

  console.log(`[BusinessAudit] Evidence score: ${score} (${details.join(', ')})`);
  return { score, details };
}

// ─── AI Report Generator ─────────────────────────────────────────────────────

async function generateAuditReport(data, reportMode) {
  const { fullName, businessName, websiteUrl, instagramUrl, industry, biggestChallenge, scraped, mainOffer, priceRange, mainCTA } = data;

  // Build rich website context from scraped data
  let websiteContext = '';
  if (scraped && scraped.success) {
    const parts = [];
    if (scraped.title) parts.push(`Page Title: ${scraped.title}`);
    if (scraped.metaDesc) parts.push(`Meta Description: ${scraped.metaDesc}`);
    if (scraped.headings && scraped.headings.length > 0) parts.push(`Headlines & Headings:\n${scraped.headings.map(h => `  - ${h}`).join('\n')}`);
    if (scraped.paragraphs && scraped.paragraphs.length > 0) parts.push(`Key Content Blocks:\n${scraped.paragraphs.join('\n\n')}`);
    if (scraped.pricing && scraped.pricing.length > 0) parts.push(`Pricing/Offers Found: ${scraped.pricing.join(' | ')}`);
    if (scraped.ctas && scraped.ctas.length > 0) parts.push(`Calls-to-Action: ${scraped.ctas.join(' | ')}`);
    if (scraped.listItems && scraped.listItems.length > 0) parts.push(`Features/Benefits/Services Listed:\n${scraped.listItems.map(li => `  - ${li}`).join('\n')}`);
    if (scraped.bodyText && parts.length < 3) parts.push(`Full Page Text:\n${scraped.bodyText}`);
    websiteContext = parts.join('\n\n');
  } else {
    websiteContext = `Website URL provided: ${websiteUrl || 'None'}. (Could not scrape — website content unavailable.)`;
  }

  console.log(`[BusinessAudit] Website context for OpenAI — length: ${websiteContext.length}, first 300 chars: ${websiteContext.substring(0, 300)}`);
  console.log(`[BusinessAudit] Scraped data check — success: ${scraped ? scraped.success : 'null'}, level: ${scraped ? scraped.level : 'null'}, headings: ${scraped ? (scraped.headings || []).length : 0}, paragraphs: ${scraped ? (scraped.paragraphs || []).length : 0}`);

  // Form-provided business details
  const formContext = `BUSINESS OWNER PROVIDED DETAILS:
- Main Offer: ${mainOffer || 'Not provided'}
- Price Range: ${priceRange || 'Not provided'}
- Main CTA: ${mainCTA || 'Not provided'}`;

  if (reportMode === 'limited') {
    return generateLimitedReport(data, websiteContext, formContext);
  }

  return generateFullReport(data, websiteContext, formContext);
}

async function generateFullReport(data, websiteContext, formContext) {
  const { fullName, businessName, websiteUrl, instagramUrl, industry, biggestChallenge } = data;

  const systemPrompt = `You are a Business Intelligence Advisor and Operations Strategist for Turbo Systems, a business intelligence and operations advisory firm. You analyze businesses based on publicly visible information and generate executive-level intelligence reports.

PRIMARY OBJECTIVE:
The goal is NOT to generate recommendations. The goal is to generate observations that create authority, curiosity, and business conversations. The business owner should repeatedly think: "How did they notice that?" Every recommendation must be based on a visible observation or business inference.

WEBSITE EVIDENCE REQUIREMENT:
Before generating any observations, you MUST first extract and identify the most important visible business signals from the website content provided. These include:
- Headlines and taglines
- Products and services offered
- Pricing and offers
- Frameworks, methodologies, or systems mentioned
- Calls-to-action
- Unique claims or positioning statements
- Content themes and patterns

VISIBLE BUSINESS SIGNALS RULE:
- Every observation in the report MUST reference a visible signal, offer, framework, CTA, or product from the actual website content.
- If no evidence exists for an observation, do NOT make that observation.
- MINIMUM 3 direct references to actual website content must appear in every report.
- Do NOT use generic industry language like "Businesses in this industry often..." or "Content creation businesses typically..."
- Instead use evidence-based language: "The website emphasizes...", "The offer appears to...", "The framework suggests...", "The messaging indicates...", "The headline states..."
- The report should feel like it reviewed THIS business, not THIS industry.
- Success test: If you remove the business name and paste the report into another similar business, it should feel obviously wrong. If it feels transferable, the report has failed.

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
- Each section MUST contain 2-3 specific observations minimum, each following the Observation \u2192 Implication \u2192 Opportunity structure.
- Include at least one quantified observation (e.g., "With X followers and a $Y product, even a Z% conversion rate represents significant untapped revenue").

EVIDENCE-BASED OBSERVATION RULES:
- Only make observations that are: directly observed, clearly implied, or reasonably inferred from the website content provided.
- Do NOT invent missing systems, missing teams, missing pricing, missing automation, or missing processes unless evidence supports the statement.
- Do NOT say "there is no visible X" or "the website lacks X" \u2014 this sounds like an AI generating a generic audit.
- Instead of searching for problems, identify business CONSTRAINTS based on what IS visible.
- The business owner should read the report and say "That's interesting" \u2014 NOT "That's not accurate."

CONSTRAINT-BASED FRAMEWORK:
Instead of pointing out what's missing, frame observations as constraints:
- BAD: "No automation," "Weak CTA," "No team," "No pricing strategy," "No follow-up system"
- GOOD: "Conversion constraint," "Revenue capture constraint," "Customer journey constraint," "Follow-up constraint," "Visibility constraint," "Operational leverage constraint," "Scalability constraint"

Use this structure: Observation \u2192 Implication \u2192 Constraint \u2192 Opportunity

Example:
- Observation: The business has invested heavily in audience growth and content production.
- Implication: This may indicate that visibility is no longer the primary growth constraint.
- Constraint: Revenue capture \u2014 the transition from engaged audience to paying customer appears less emphasized than content delivery.
- Opportunity: Improving conversion systems and customer journeys may produce a higher return than increasing traffic.

WHAT TO REFERENCE (prioritize these):
- Actual products, services, or offers visible on the site
- Specific pricing, frameworks, or methodologies mentioned
- Headlines, taglines, or positioning statements
- Content themes and patterns
- Visible customer touchpoints
- Business model indicators

WHAT TO AVOID:
- Stating that something is "missing" or "absent" without evidence
- Assuming the business doesn't have systems just because they aren't visible on the website
- Generic observations that could apply to any business
- Inventing problems to solve

REPORT SECTIONS (generate in this order):

1. EXECUTIVE SUMMARY
A concise overview of the business's current position, primary strength, and the most significant opportunity identified. 3-4 sentences maximum.

2. REVENUE & CONVERSION OBSERVATIONS
2-3 observations about how the business generates revenue from its visible assets. Focus on what IS visible \u2014 pricing, offers, conversion paths, content-to-revenue transitions \u2014 and identify constraints in the revenue capture process.

3. OPERATIONAL EFFICIENCY OBSERVATIONS
2-3 observations about visible operational patterns \u2014 content production workflows, service delivery indicators, business model structure. Identify operational leverage constraints based on what you can see, not what you can't.

4. CUSTOMER JOURNEY & FOLLOW-UP
2-3 observations about the visible customer experience \u2014 from first touch to purchase. Identify journey constraints based on observable touchpoints, not assumed missing systems.

5. HIDDEN OPPORTUNITY
Identify the single largest visible opportunity that the business owner may not currently be focused on. This should feel insightful and slightly contrarian. Examples: Conversion instead of traffic, Retention instead of acquisition, Follow-up instead of lead generation, Systems instead of more content, Operations instead of visibility.

6. EXECUTIVE RISK
Identify one visible business risk that could limit future growth. Examples: Heavy dependence on founder, Lack of follow-up systems, Revenue concentration, Operational bottlenecks, Inconsistent customer journey. Use cautious language: "may indicate," "appears to," "could suggest." Do NOT overstate.

7. EXECUTIVE INSIGHT
Challenge a common assumption the business owner likely holds. Introduce a strategic perspective that creates a "pause and think" moment. This should feel like something a paid consultant would say \u2014 not generic advice.

8. STRATEGIC RECOMMENDATIONS (exactly 3)
Prioritized by business impact. Each must trace back to a specific observation from the report. Label them: Highest Impact, Second Priority, Third Priority. Each recommendation gets a title and 2-3 sentence explanation connecting it to the observation.

REPORT TONE:
- Executive, Strategic, Direct, Observational, Credible, Concise
- Avoid: hype, motivational language, generic business advice, marketing consultant tone
- Use language like: "Our analysis indicates...", "The visible data suggests...", "Based on observable patterns..."

OUTPUT FORMAT:
Return a valid JSON object with these exact keys:
- visibleSignals (array of strings \u2014 list the top 5-8 specific items found on the website before analysis: exact headlines, product names, pricing, frameworks, CTAs, claims)
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

${formContext}

HERE IS THE WEBSITE CONTENT TO ANALYZE:
---
${websiteContext}
---

You MUST reference specific elements from this content in your report. Every observation must tie back to something visible in the website content above.

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

async function generateLimitedReport(data, websiteContext, formContext) {
  const { fullName, businessName, websiteUrl, instagramUrl, industry, biggestChallenge } = data;

  const systemPrompt = `You are a Business Intelligence Advisor for Turbo Systems. You have been asked to analyze a business, but LIMITED publicly visible information is available.

IMPORTANT: Do NOT generate generic observations. Do NOT pretend to have analyzed content you haven't seen. Be honest about what you can and cannot observe.

Based on whatever limited information IS available (business name, industry, stated challenge, any partial website data), generate a brief, honest assessment.

OUTPUT FORMAT:
Return a valid JSON object with these exact keys:
- visibleSignals (array of strings \u2014 list whatever specific items you CAN identify, even if only 1-2 items. If nothing specific is available, use an empty array)
- executiveSummary (string \u2014 acknowledge limited visibility, note what IS known, identify the most likely opportunity based on available information)
- limitedObservations (array of 1-2 objects with "observation", "implication", "opportunity" keys \u2014 ONLY include observations you can actually support with evidence)
- recommendedNextStep (string \u2014 what additional information would enable a full analysis)

TONE: Honest, professional, consultative. Do NOT pad with generic advice.`;

  const userPrompt = `Generate a Limited Visibility Business Intelligence Report.

BUSINESS DETAILS:
- Owner: ${fullName}
- Business Name: ${businessName}
- Industry: ${industry || 'Not specified'}
- Instagram: ${instagramUrl || 'Not provided'}
- Biggest Challenge: ${biggestChallenge || 'Not specified'}

${formContext}

AVAILABLE WEBSITE CONTENT (limited):
---
${websiteContext}
---

Be honest about what you can and cannot observe. Only make observations supported by the available evidence.

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

function buildReportHtml(report, businessName, fullName, reportMode) {
  if (reportMode === 'limited') {
    return buildLimitedReportHtml(report, businessName, fullName);
  }
  return buildFullReportHtml(report, businessName, fullName);
}

function buildFullReportHtml(report, businessName, fullName) {
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

  const visibleSignalsHtml = (report.visibleSignals && report.visibleSignals.length > 0)
    ? `
    <!-- Visible Business Signals -->
    <div style="margin-bottom:24px;padding:16px 20px;background:#f7f9fc;border-radius:8px;border:1px solid #e8ecf0;">
      <div style="font-size:10px;letter-spacing:2px;color:#718096;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Visible Business Signals</div>
      <div style="font-size:12px;color:#4a5568;line-height:1.8;">${report.visibleSignals.map(s => `<span style="display:inline-block;background:#edf2f7;border-radius:4px;padding:2px 8px;margin:2px 4px 2px 0;font-size:12px;">${s}</span>`).join('')}</div>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Business Intelligence Report \u2014 ${businessName}</title>
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

    ${visibleSignalsHtml}

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

function buildLimitedReportHtml(report, businessName, fullName) {
  const limitedObsHtml = (report.limitedObservations || []).map(item => `
    <div style="margin-bottom:14px;">
      <div style="font-size:13px;font-weight:700;color:#2d3748;margin-bottom:3px;">Observation:</div>
      <div style="font-size:13px;color:#4a5568;line-height:1.6;margin-bottom:8px;">${item.observation || ''}</div>
      <div style="font-size:13px;font-weight:700;color:#2d3748;margin-bottom:3px;">Business Implication:</div>
      <div style="font-size:13px;color:#4a5568;line-height:1.6;margin-bottom:8px;">${item.implication || ''}</div>
      <div style="font-size:13px;font-weight:700;color:#2d3748;margin-bottom:3px;">Opportunity:</div>
      <div style="font-size:13px;color:#4a5568;line-height:1.6;">${item.opportunity || ''}</div>
    </div>`).join('');

  const visibleSignalsHtml = (report.visibleSignals && report.visibleSignals.length > 0)
    ? `
    <div style="margin-bottom:24px;padding:16px 20px;background:#f7f9fc;border-radius:8px;border:1px solid #e8ecf0;">
      <div style="font-size:10px;letter-spacing:2px;color:#718096;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Visible Business Signals</div>
      <div style="font-size:12px;color:#4a5568;line-height:1.8;">${report.visibleSignals.map(s => `<span style="display:inline-block;background:#edf2f7;border-radius:4px;padding:2px 8px;margin:2px 4px 2px 0;font-size:12px;">${s}</span>`).join('')}</div>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Limited Visibility Report \u2014 ${businessName}</title>
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

    <!-- Limited Visibility Banner -->
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 20px;margin-bottom:24px;text-align:center;">
      <div style="font-size:12px;font-weight:700;color:#856404;">LIMITED VISIBILITY REPORT</div>
      <div style="font-size:12px;color:#856404;margin-top:4px;">This analysis is based on limited publicly available information. A deeper review with additional business details would produce more actionable insights.</div>
    </div>

    <!-- Executive Summary -->
    <div style="background:#f8faff;border-left:4px solid #4285F4;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:32px;">
      <div style="font-size:11px;letter-spacing:2px;color:#4285F4;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Executive Summary</div>
      <p style="margin:0;font-size:15px;color:#2d3748;line-height:1.7;">${report.executiveSummary || ''}</p>
    </div>

    ${visibleSignalsHtml}

    <!-- Limited Observations -->
    ${(report.limitedObservations && report.limitedObservations.length > 0) ? `
    <div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#38a169;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Initial Observations</div>
      ${limitedObsHtml}
    </div>` : ''}

    <!-- Recommended Next Step -->
    ${report.recommendedNextStep ? `
    <div style="background:#ebf8ff;border:1px solid #bee3f8;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#2b6cb0;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Recommended Next Step</div>
      <p style="margin:0;font-size:13px;color:#4a5568;line-height:1.7;">${report.recommendedNextStep}</p>
    </div>` : ''}

    <!-- Call to Action -->
    <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);border-radius:8px;padding:28px 32px;margin-bottom:8px;">
      <p style="margin:0 0 16px;font-size:13px;color:#a0aec0;line-height:1.7;">This report was generated with limited publicly available information. To produce a full Business Intelligence Report with specific, actionable observations, we would need access to additional business details including your website content, service offerings, pricing structure, and customer journey.</p>
      <p style="margin:0;font-size:14px;color:#ffffff;line-height:1.7;">Reply to this email with your website URL or additional business details, and <strong style="color:#4285F4;">Turbo Systems</strong> will generate a complete analysis with specific revenue, operations, and growth observations.</p>
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
    let { fullName, email, businessName, websiteUrl, instagramUrl, industry, biggestChallenge, mainOffer, priceRange, mainCTA } = req.body;

    // Normalize
    fullName = (fullName || '').trim();
    email = (email || '').trim().toLowerCase();
    businessName = (businessName || '').trim();
    websiteUrl = (websiteUrl || '').trim();
    instagramUrl = (instagramUrl || '').trim();
    industry = (industry || '').trim();
    biggestChallenge = (biggestChallenge || '').trim();
    mainOffer = (mainOffer || '').trim();
    priceRange = (priceRange || '').trim();
    mainCTA = (mainCTA || '').trim();

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
    console.log(`[BusinessAudit] Lead saved: id=${leadId}, email=${email}, business=${businessName}`);

    // Respond immediately — report mode will be determined during async processing
    res.status(201).json({
      success: true,
      message: 'Your Business Intelligence Report is being generated and will arrive in your inbox within 10 minutes.',
      leadId,
    });

    // ── Async background processing ──────────────────────────────────────────
    (async () => {
      try {
        console.log(`[BusinessAudit] ═══ ASYNC START ═══ Lead ${leadId}, URL: ${websiteUrl || 'NONE'}`);

        // 1. Scrape website (4-level fallback chain)
        let scraped = null;
        if (websiteUrl) {
          scraped = await scrapeWebsite(websiteUrl);
          console.log(`[BusinessAudit] Scrape complete for lead ${leadId}: success=${scraped.success}, level=${scraped.level}, content=${scraped.contentLength || 0} chars`);
        } else {
          console.log(`[BusinessAudit] No website URL provided for lead ${leadId}`);
        }

        // 2. Calculate evidence score
        const formData = { mainOffer, priceRange, mainCTA };
        const { score: evidenceScore, details: evidenceDetails } = calculateEvidenceScore(scraped, formData);
        const reportMode = evidenceScore >= 5 ? 'full' : 'limited';

        console.log(`[BusinessAudit] Lead ${leadId}: evidenceScore=${evidenceScore}, mode=${reportMode}, details=[${evidenceDetails.join(', ')}]`);

        // 3. Generate AI report (mode-dependent)
        console.log(`[BusinessAudit] Generating ${reportMode} report for lead ${leadId}...`);
        const report = await generateAuditReport(
          { fullName, businessName, websiteUrl, instagramUrl, industry, biggestChallenge, scraped, mainOffer, priceRange, mainCTA },
          reportMode
        );
        console.log(`[BusinessAudit] AI report generated for lead ${leadId}: mode=${reportMode}, signals=${(report.visibleSignals || []).length}`);

        // 4. Build HTML
        const htmlReport = buildReportHtml(report, businessName, fullName, reportMode);

        // 5. Email report to lead
        const emailSubject = reportMode === 'limited'
          ? 'Your Turbo Systems Limited Visibility Report'
          : 'Your Turbo Systems Business Intelligence Report';
        const emailSent = await sendEmail({
          to: email,
          subject: emailSubject,
          html: htmlReport,
        });
        console.log(`[BusinessAudit] Email sent for lead ${leadId}: ${emailSent ? 'SUCCESS' : 'FAILED'}`);

        // 6. Update DB record
        const reportSummary = JSON.stringify({
          executiveSummary: report.executiveSummary,
          visibleSignals: report.visibleSignals,
          recommendations: report.recommendations,
          reportMode,
          evidenceScore,
          scrapeLevel: scraped ? scraped.level : null,
          emailSent,
          generatedAt: new Date().toISOString(),
        });
        await query(
          `UPDATE business_intakes SET status='follow_up', short_term_goal=$1, long_term_vision=$2, updated_at=NOW() WHERE id=$3`,
          [reportSummary.slice(0, 1000), htmlReport, leadId]
        );
        console.log(`[BusinessAudit] DB updated for lead ${leadId}`);

        // 7. Notify owner
        const adminEmail = process.env.ADMIN_EMAIL || 'collinsdemarcus4@gmail.com';
        await sendEmail({
          to: adminEmail,
          subject: `\ud83d\udcca New Business Audit: ${businessName} [${reportMode.toUpperCase()}]`,
          html: `<p><strong>${fullName}</strong> (${email}) submitted a business audit for <strong>${businessName}</strong>.</p>
                 <p>Industry: ${industry || 'N/A'}<br>Challenge: ${biggestChallenge || 'N/A'}</p>
                 <p>Scrape: Level ${scraped ? scraped.level : 'N/A'} | Success: ${scraped ? scraped.success : 'No URL'} | Content: ${scraped ? scraped.contentLength || 0 : 0} chars</p>
                 <p>Evidence Score: <strong>${evidenceScore}</strong> (${evidenceDetails.join(', ')})</p>
                 <p>Report Mode: <strong>${reportMode.toUpperCase()}</strong></p>
                 <p>Email sent: <strong>${emailSent ? 'YES' : 'FAILED'}</strong></p>`,
        }).catch(() => {});

        console.log(`[BusinessAudit] ═══ ASYNC COMPLETE ═══ Lead ${leadId}`);

      } catch (asyncErr) {
        console.error(`[BusinessAudit] ASYNC ERROR for lead ${leadId}: ${asyncErr.message}`, asyncErr.stack);
        logger.error('[BusinessAudit] Async processing error', { error: asyncErr.message, leadId });
      }
    })();

  } catch (err) {
    console.error(`[BusinessAudit] ROUTE ERROR: ${err.message}`, err.stack);
    logger.error('[BusinessAudit] Route error', { error: err.message });
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

// ─── GET /api/business-audit/debug-scrape ────────────────────────────────────
// Temporary debug endpoint to test scraper from Render's environment.
// Usage: GET /api/business-audit/debug-scrape?url=https://www.yammifr.com

router.get('/business-audit/debug-scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing ?url= parameter' });
  }

  console.log(`[BusinessAudit] ═══ DEBUG SCRAPE ═══ URL: ${url}`);
  const results = {};

  // Test Level 1: Jina.ai
  try {
    const jinaStart = Date.now();
    const jinaResult = await scrapeLevel1_Jina(url);
    results.jinaAttempt = {
      success: jinaResult.success,
      contentLength: jinaResult.contentLength || 0,
      error: jinaResult.error || null,
      durationMs: Date.now() - jinaStart,
      headingsCount: (jinaResult.headings || []).length,
      paragraphsCount: (jinaResult.paragraphs || []).length,
      pricingCount: (jinaResult.pricing || []).length,
      ctasCount: (jinaResult.ctas || []).length,
      firstChars: (jinaResult.bodyText || '').substring(0, 500),
    };
  } catch (err) {
    results.jinaAttempt = { success: false, error: err.message, contentLength: 0 };
  }

  // Test Level 2: Direct fetch
  try {
    const fetchStart = Date.now();
    const fetchResult = await scrapeLevel2_DirectFetch(url);
    results.directFetchAttempt = {
      success: fetchResult.success,
      contentLength: fetchResult.contentLength || 0,
      error: fetchResult.error || null,
      durationMs: Date.now() - fetchStart,
      headingsCount: (fetchResult.headings || []).length,
      paragraphsCount: (fetchResult.paragraphs || []).length,
      pricingCount: (fetchResult.pricing || []).length,
      ctasCount: (fetchResult.ctas || []).length,
      firstChars: (fetchResult.bodyText || '').substring(0, 500),
    };
  } catch (err) {
    results.directFetchAttempt = { success: false, error: err.message, contentLength: 0 };
  }

  // Determine which level would be used
  const scraped = (results.jinaAttempt.success && results.jinaAttempt.contentLength >= 300)
    ? { success: true, level: 1, headings: [], paragraphs: [], pricing: [], ctas: [], bodyText: results.jinaAttempt.firstChars, contentLength: results.jinaAttempt.contentLength }
    : (results.directFetchAttempt.success && results.directFetchAttempt.contentLength >= 300)
      ? { success: true, level: 2, headings: [], paragraphs: [], pricing: [], ctas: [], bodyText: results.directFetchAttempt.firstChars, contentLength: results.directFetchAttempt.contentLength }
      : { success: false, level: 0, contentLength: 0 };

  // Calculate evidence score (simplified — just using the winning scrape)
  let winningResult = null;
  if (results.jinaAttempt.success && results.jinaAttempt.contentLength >= 300) {
    winningResult = results.jinaAttempt;
  } else if (results.directFetchAttempt.success && results.directFetchAttempt.contentLength >= 300) {
    winningResult = results.directFetchAttempt;
  }

  let evidenceScore = 0;
  if (winningResult) {
    evidenceScore += Math.min(winningResult.headingsCount, 10) * 2;
    evidenceScore += Math.min(winningResult.paragraphsCount, 10);
    if (winningResult.pricingCount > 0) evidenceScore += 3;
    evidenceScore += Math.min(winningResult.ctasCount, 5) * 2;
    if (winningResult.contentLength >= 1000) evidenceScore += 3;
  }

  results.summary = {
    scrapeLevel: scraped.level,
    wouldUseMode: evidenceScore >= 5 ? 'full' : 'limited',
    evidenceScore,
    url,
    timestamp: new Date().toISOString(),
  };

  console.log(`[BusinessAudit] ═══ DEBUG SCRAPE COMPLETE ═══`, JSON.stringify(results.summary));
  res.json(results);
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
<title>Report Generating \u2014 Turbo Systems</title>
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
  <div class="badge">\u23f1 Check back in a few minutes</div>
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
