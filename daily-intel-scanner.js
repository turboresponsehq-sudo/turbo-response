#!/usr/bin/env node

/**
 * Daily Intel Scanner - Consumer Defense Intelligence
 * 
 * Purpose: Monitor regulatory, policy, and assistance changes affecting consumer defense business
 * Focus: FTC, CFPB, Federal Register, Benefits.gov, Georgia assistance, courts
 * 
 * Source of Truth: /docs/CORE_MONITORING_MAP.md
 * 
 * Stop Rule: If nothing actionable, generate "No actionable updates" report
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const REPORT_DIR = path.join(__dirname, 'docs', 'intel-reports');
const DATA_DIR = path.join(__dirname, 'data', 'scans');

// Ensure directories exist
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Priority levels
const PRIORITY = {
  P0: 'CRITICAL',
  P1: 'HIGH',
  P2: 'MONITOR'
};

// Utility: HTTP GET request
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

// Utility: Parse RSS feed (simple XML parsing)
function parseRSS(xml) {
  const items = [];
  
  try {
    // Extract items from RSS feed
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    for (const itemXml of itemMatches) {
      const title = (itemXml.match(/<title>(.*?)<\/title>/) || [])[1] || '';
      const link = (itemXml.match(/<link>(.*?)<\/link>/) || [])[1] || '';
      const pubDate = (itemXml.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
      const description = (itemXml.match(/<description>(.*?)<\/description>/) || [])[1] || '';
      
      items.push({
        title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        link: link.trim(),
        pubDate: pubDate.trim(),
        description: description.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim()
      });
    }
  } catch (error) {
    console.error('RSS parse error:', error.message);
  }
  
  return items;
}

// Utility: Check if item is from today or yesterday
function isRecent(dateString) {
  try {
    const itemDate = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return itemDate >= yesterday;
  } catch {
    return false;
  }
}

// Scanner: FTC Enforcement Actions (P0)
async function scanFTCEnforcement() {
  console.log('[FTC] Scanning enforcement actions...');
  const updates = [];
  
  try {
    const response = await httpGet('https://www.ftc.gov/news-events/news/press-releases/rss.xml');
    if (response.status !== 200) {
      console.error(`[FTC] HTTP ${response.status}`);
      return updates;
    }
    
    const items = parseRSS(response.data);
    
    for (const item of items) {
      if (!isRecent(item.pubDate)) continue;
      
      const title = item.title.toLowerCase();
      const desc = item.description.toLowerCase();
      
      // Actionable: enforcement against debt collectors, credit bureaus, consumer fraud
      const isActionable = 
        title.includes('enforcement') ||
        title.includes('settlement') ||
        title.includes('complaint') ||
        desc.includes('debt collect') ||
        desc.includes('credit bureau') ||
        desc.includes('credit report') ||
        desc.includes('consumer fraud') ||
        desc.includes('fcra') ||
        desc.includes('fdcpa');
      
      if (isActionable) {
        updates.push({
          source: 'FTC Enforcement',
          priority: PRIORITY.P0,
          title: item.title,
          link: item.link,
          date: item.pubDate,
          why: 'New enforcement action may set precedent for client cases',
          action: 'Review settlement terms and enforcement details for case strategy'
        });
      }
    }
  } catch (error) {
    console.error('[FTC] Error:', error.message);
  }
  
  console.log(`[FTC] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: FTC Consumer Alerts (P0)
async function scanFTCAlerts() {
  console.log('[FTC] Scanning consumer alerts...');
  const updates = [];
  
  try {
    const response = await httpGet('https://consumer.ftc.gov/consumer-alerts.xml');
    if (response.status !== 200) {
      console.error(`[FTC Alerts] HTTP ${response.status}`);
      return updates;
    }
    
    const items = parseRSS(response.data);
    
    for (const item of items) {
      if (!isRecent(item.pubDate)) continue;
      
      const title = item.title.toLowerCase();
      const desc = item.description.toLowerCase();
      
      // Actionable: alerts about debt, credit, scams affecting client base
      const isActionable =
        title.includes('debt') ||
        title.includes('credit') ||
        title.includes('scam') ||
        title.includes('fraud') ||
        desc.includes('debt collect') ||
        desc.includes('credit report');
      
      if (isActionable) {
        updates.push({
          source: 'FTC Consumer Alerts',
          priority: PRIORITY.P0,
          title: item.title,
          link: item.link,
          date: item.pubDate,
          why: 'Alert about scam or practice affecting your client demographic',
          action: 'Share with clients, update intake questions if needed'
        });
      }
    }
  } catch (error) {
    console.error('[FTC Alerts] Error:', error.message);
  }
  
  console.log(`[FTC Alerts] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: CFPB Enforcement (P0)
async function scanCFPBEnforcement() {
  console.log('[CFPB] Scanning enforcement actions...');
  const updates = [];
  
  try {
    // CFPB blog RSS often includes enforcement announcements
    const response = await httpGet('https://www.consumerfinance.gov/about-us/blog/feed/');
    if (response.status !== 200) {
      console.error(`[CFPB] HTTP ${response.status}`);
      return updates;
    }
    
    const items = parseRSS(response.data);
    
    for (const item of items) {
      if (!isRecent(item.pubDate)) continue;
      
      const title = item.title.toLowerCase();
      const desc = item.description.toLowerCase();
      
      // Actionable: enforcement, rules, guidance on debt/credit
      const isActionable =
        title.includes('enforcement') ||
        title.includes('action') ||
        title.includes('rule') ||
        title.includes('guidance') ||
        desc.includes('debt collect') ||
        desc.includes('credit report') ||
        desc.includes('fcra') ||
        desc.includes('fdcpa');
      
      if (isActionable) {
        updates.push({
          source: 'CFPB Enforcement',
          priority: PRIORITY.P0,
          title: item.title,
          link: item.link,
          date: item.pubDate,
          why: 'CFPB action or guidance affecting consumer rights',
          action: 'Review for case strategy and client communications'
        });
      }
    }
  } catch (error) {
    console.error('[CFPB] Error:', error.message);
  }
  
  console.log(`[CFPB] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: Federal Register (FCRA/FDCPA) - Weekly (P0)
// Note: This runs daily but checks for updates from past 7 days
async function scanFederalRegister() {
  console.log('[Federal Register] Scanning FCRA/FDCPA updates...');
  const updates = [];
  
  try {
    // Check FCRA-related documents
    const fcraUrl = 'https://www.federalregister.gov/api/v1/documents.json?conditions[term]=FCRA&per_page=20';
    const fcraResponse = await httpGet(fcraUrl);
    
    if (fcraResponse.status === 200) {
      const fcraData = JSON.parse(fcraResponse.data);
      
      for (const doc of fcraData.results || []) {
        const pubDate = new Date(doc.publication_date);
        const daysAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysAgo <= 7) {
          updates.push({
            source: 'Federal Register (FCRA)',
            priority: PRIORITY.P0,
            title: doc.title,
            link: doc.html_url,
            date: doc.publication_date,
            why: 'Federal rule or notice affecting credit reporting',
            action: 'Review document, submit comments if proposed rule'
          });
        }
      }
    }
    
    // Check FDCPA-related documents
    const fdcpaUrl = 'https://www.federalregister.gov/api/v1/documents.json?conditions[term]=FDCPA&per_page=20';
    const fdcpaResponse = await httpGet(fdcpaUrl);
    
    if (fdcpaResponse.status === 200) {
      const fdcpaData = JSON.parse(fdcpaResponse.data);
      
      for (const doc of fdcpaData.results || []) {
        const pubDate = new Date(doc.publication_date);
        const daysAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysAgo <= 7) {
          updates.push({
            source: 'Federal Register (FDCPA)',
            priority: PRIORITY.P0,
            title: doc.title,
            link: doc.html_url,
            date: doc.publication_date,
            why: 'Federal rule or notice affecting debt collection',
            action: 'Review document, submit comments if proposed rule'
          });
        }
      }
    }
  } catch (error) {
    console.error('[Federal Register] Error:', error.message);
  }
  
  console.log(`[Federal Register] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: Benefits.gov - Weekly (P1)
async function scanBenefitsGov() {
  console.log('[Benefits.gov] Scanning for new programs...');
  const updates = [];
  
  try {
    const response = await httpGet('https://www.benefits.gov/news');
    if (response.status !== 200) {
      console.error(`[Benefits.gov] HTTP ${response.status}`);
      return updates;
    }
    
    const $ = cheerio.load(response.data);
    
    // Look for news items or updates
    $('article, .news-item, .update').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title').text().trim();
      const link = $(elem).find('a').attr('href');
      const date = $(elem).find('.date, time').text().trim();
      
      if (!title) return;
      
      const titleLower = title.toLowerCase();
      
      // Actionable: new benefit programs, eligibility changes, assistance
      const isActionable =
        titleLower.includes('new program') ||
        titleLower.includes('benefit') ||
        titleLower.includes('assistance') ||
        titleLower.includes('eligibility') ||
        titleLower.includes('housing') ||
        titleLower.includes('financial');
      
      if (isActionable) {
        updates.push({
          source: 'Benefits.gov',
          priority: PRIORITY.P1,
          title: title,
          link: link ? `https://www.benefits.gov${link}` : 'https://www.benefits.gov/news',
          date: date || 'Recent',
          why: 'New federal benefit program may help clients access assistance',
          action: 'Review eligibility criteria and share with qualifying clients'
        });
      }
    });
  } catch (error) {
    console.error('[Benefits.gov] Error:', error.message);
  }
  
  console.log(`[Benefits.gov] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: Georgia Housing Assistance - Weekly (P1)
async function scanGeorgiaHousing() {
  console.log('[GA Housing] Scanning for assistance programs...');
  const updates = [];
  
  try {
    const response = await httpGet('https://www.dca.ga.gov/safe-affordable-housing');
    if (response.status !== 200) {
      console.error(`[GA Housing] HTTP ${response.status}`);
      return updates;
    }
    
    const $ = cheerio.load(response.data);
    
    // Look for news, updates, or program announcements
    $('article, .news, .program, .update').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title').text().trim();
      const link = $(elem).find('a').attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!title) return;
      
      // Actionable: housing assistance, rent relief, eviction prevention
      const isActionable =
        text.includes('assistance') ||
        text.includes('rent') ||
        text.includes('housing') ||
        text.includes('eviction') ||
        text.includes('funding') ||
        text.includes('program');
      
      if (isActionable) {
        updates.push({
          source: 'Georgia Housing (DCA)',
          priority: PRIORITY.P1,
          title: title,
          link: link ? (link.startsWith('http') ? link : `https://www.dca.ga.gov${link}`) : 'https://www.dca.ga.gov/safe-affordable-housing',
          date: 'Recent',
          why: 'Georgia housing assistance program may help eviction defense clients',
          action: 'Review program details, check client eligibility, share application info'
        });
      }
    });
  } catch (error) {
    console.error('[GA Housing] Error:', error.message);
  }
  
  console.log(`[GA Housing] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: Georgia DHS/DFCS - Weekly (P1)
async function scanGeorgiaDHS() {
  console.log('[GA DHS] Scanning for benefits updates...');
  const updates = [];
  
  try {
    const response = await httpGet('https://dhs.georgia.gov/');
    if (response.status !== 200) {
      console.error(`[GA DHS] HTTP ${response.status}`);
      return updates;
    }
    
    const $ = cheerio.load(response.data);
    
    // Look for news or announcements
    $('.news, .announcement, article').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title').text().trim();
      const link = $(elem).find('a').attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!title) return;
      
      // Actionable: SNAP, TANF, benefits, assistance
      const isActionable =
        text.includes('snap') ||
        text.includes('tanf') ||
        text.includes('benefit') ||
        text.includes('assistance') ||
        text.includes('emergency') ||
        text.includes('eligibility');
      
      if (isActionable) {
        updates.push({
          source: 'Georgia DHS/DFCS',
          priority: PRIORITY.P1,
          title: title,
          link: link ? (link.startsWith('http') ? link : `https://dhs.georgia.gov${link}`) : 'https://dhs.georgia.gov/',
          date: 'Recent',
          why: 'Georgia benefits update may help clients access food/cash assistance',
          action: 'Review changes, update client guidance on benefits applications'
        });
      }
    });
  } catch (error) {
    console.error('[GA DHS] Error:', error.message);
  }
  
  console.log(`[GA DHS] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: DeKalb County Assistance Programs (P1)
async function scanDeKalbCounty() {
  console.log('[DeKalb County] Scanning for assistance programs...');
  const updates = [];
  
  try {
    const response = await httpGet('https://www.dekalbcountyga.gov/human-services');
    if (response.status !== 200) {
      console.error(`[DeKalb County] HTTP ${response.status}`);
      return updates;
    }
    
    const $ = cheerio.load(response.data);
    
    // Look for assistance programs
    $('article, .news, .program, .update, .alert').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title, a').first().text().trim();
      const link = $(elem).find('a').attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!title) return;
      
      // Actionable: assistance, rent relief, emergency funds, benefits
      const isActionable =
        text.includes('assistance') ||
        text.includes('rent') ||
        text.includes('emergency') ||
        text.includes('benefit') ||
        text.includes('relief') ||
        text.includes('program') ||
        text.includes('funding');
      
      if (isActionable) {
        updates.push({
          source: 'DeKalb County Assistance',
          priority: PRIORITY.P1,
          title: title,
          link: link ? (link.startsWith('http') ? link : `https://www.dekalbcountyga.gov${link}`) : 'https://www.dekalbcountyga.gov/human-services',
          date: 'Recent',
          why: 'DeKalb County assistance program may help your clients',
          action: 'Review eligibility, share application link with qualifying clients'
        });
      }
    });
  } catch (error) {
    console.error('[DeKalb County] Error:', error.message);
  }
  
  console.log(`[DeKalb County] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: Fulton County Assistance Programs (P1)
async function scanFultonCounty() {
  console.log('[Fulton County] Scanning for assistance programs...');
  const updates = [];
  
  try {
    const response = await httpGet('https://www.fultoncountyga.gov/human-services');
    if (response.status !== 200) {
      console.error(`[Fulton County] HTTP ${response.status}`);
      return updates;
    }
    
    const $ = cheerio.load(response.data);
    
    // Look for assistance programs
    $('article, .news, .program, .update, .alert').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title, a').first().text().trim();
      const link = $(elem).find('a').attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!title) return;
      
      // Actionable: assistance, rent relief, emergency funds, benefits
      const isActionable =
        text.includes('assistance') ||
        text.includes('rent') ||
        text.includes('emergency') ||
        text.includes('benefit') ||
        text.includes('relief') ||
        text.includes('program') ||
        text.includes('funding');
      
      if (isActionable) {
        updates.push({
          source: 'Fulton County Assistance',
          priority: PRIORITY.P1,
          title: title,
          link: link ? (link.startsWith('http') ? link : `https://www.fultoncountyga.gov${link}`) : 'https://www.fultoncountyga.gov/human-services',
          date: 'Recent',
          why: 'Fulton County assistance program may help your clients',
          action: 'Review eligibility, share application link with qualifying clients'
        });
      }
    });
  } catch (error) {
    console.error('[Fulton County] Error:', error.message);
  }
  
  console.log(`[Fulton County] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: Clayton County Assistance Programs (P1)
async function scanClaytonCounty() {
  console.log('[Clayton County] Scanning for assistance programs...');
  const updates = [];
  
  try {
    const response = await httpGet('https://www.claytoncountyga.gov/human-services');
    if (response.status !== 200) {
      console.error(`[Clayton County] HTTP ${response.status}`);
      return updates;
    }
    
    const $ = cheerio.load(response.data);
    
    // Look for assistance programs
    $('article, .news, .program, .update, .alert').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title, a').first().text().trim();
      const link = $(elem).find('a').attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!title) return;
      
      // Actionable: assistance, rent relief, emergency funds, benefits
      const isActionable =
        text.includes('assistance') ||
        text.includes('rent') ||
        text.includes('emergency') ||
        text.includes('benefit') ||
        text.includes('relief') ||
        text.includes('program') ||
        text.includes('funding');
      
      if (isActionable) {
        updates.push({
          source: 'Clayton County Assistance',
          priority: PRIORITY.P1,
          title: title,
          link: link ? (link.startsWith('http') ? link : `https://www.claytoncountyga.gov${link}`) : 'https://www.claytoncountyga.gov/human-services',
          date: 'Recent',
          why: 'Clayton County assistance program may help your clients',
          action: 'Review eligibility, share application link with qualifying clients'
        });
      }
    });
  } catch (error) {
    console.error('[Clayton County] Error:', error.message);
  }
  
  console.log(`[Clayton County] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: City of Atlanta Assistance Programs (P1)
async function scanCityOfAtlanta() {
  console.log('[City of Atlanta] Scanning for assistance programs...');
  const updates = [];
  
  try {
    const response = await httpGet('https://www.atlantaga.gov/government/departments/human-services');
    if (response.status !== 200) {
      console.error(`[City of Atlanta] HTTP ${response.status}`);
      return updates;
    }
    
    const $ = cheerio.load(response.data);
    
    // Look for assistance programs
    $('article, .news, .program, .update, .alert').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title, a').first().text().trim();
      const link = $(elem).find('a').attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!title) return;
      
      // Actionable: assistance, rent relief, emergency funds, benefits
      const isActionable =
        text.includes('assistance') ||
        text.includes('rent') ||
        text.includes('emergency') ||
        text.includes('benefit') ||
        text.includes('relief') ||
        text.includes('program') ||
        text.includes('funding');
      
      if (isActionable) {
        updates.push({
          source: 'City of Atlanta Assistance',
          priority: PRIORITY.P1,
          title: title,
          link: link ? (link.startsWith('http') ? link : `https://www.atlantaga.gov${link}`) : 'https://www.atlantaga.gov/government/departments/human-services',
          date: 'Recent',
          why: 'City of Atlanta assistance program may help your clients',
          action: 'Review eligibility, share application link with qualifying clients'
        });
      }
    });
  } catch (error) {
    console.error('[City of Atlanta] Error:', error.message);
  }
  
  console.log(`[City of Atlanta] Found ${updates.length} actionable items`);
  return updates;
}

// Scanner: Georgia Courts - Eviction & Debt Filings (P1)
async function scanGeorgiaCourts() {
  console.log('[GA Courts] Scanning for eviction policy changes...');
  const updates = [];
  
  try {
    const response = await httpGet('https://www.gasupreme.us/court-orders/');
    if (response.status !== 200) {
      console.error(`[GA Courts] HTTP ${response.status}`);
      return updates;
    }
    
    const $ = cheerio.load(response.data);
    
    // Look for recent court orders
    $('.order, .ruling, article, .content-item').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title, a').first().text().trim();
      const link = $(elem).find('a').attr('href');
      const text = $(elem).text().toLowerCase();
      
      if (!title) return;
      
      // Actionable: eviction, housing, magistrate court, procedure changes
      const isActionable =
        text.includes('eviction') ||
        text.includes('magistrate') ||
        text.includes('housing') ||
        text.includes('procedure') ||
        text.includes('filing') ||
        text.includes('deadline');
      
      if (isActionable) {
        updates.push({
          source: 'Georgia Courts',
          priority: PRIORITY.P1,
          title: title,
          link: link ? (link.startsWith('http') ? link : `https://www.gasupreme.us${link}`) : 'https://www.gasupreme.us/court-orders/',
          date: 'Recent',
          why: 'Court rule change may affect eviction defense procedures',
          action: 'Review order, update case strategy and filing procedures'
        });
      }
    });
  } catch (error) {
    console.error('[GA Courts] Error:', error.message);
  }
  
  console.log(`[GA Courts] Found ${updates.length} actionable items`);
  return updates;
}

// Generate report
function generateReport(allUpdates) {
  const date = new Date().toISOString().split('T')[0];
  const reportPath = path.join(REPORT_DIR, `intel-${date}.md`);
  
  // Group by priority
  const p0Items = allUpdates.filter(u => u.priority === PRIORITY.P0);
  const p1Items = allUpdates.filter(u => u.priority === PRIORITY.P1);
  const p2Items = allUpdates.filter(u => u.priority === PRIORITY.P2);
  
  // Apply Stop Rule
  if (allUpdates.length === 0) {
    const report = `# Daily Intel Report - ${date}

**Status:** No actionable updates today

Daily scan completed. No regulatory, enforcement, or assistance updates requiring action today.

---

**Sources Scanned (Phase 1):**
- FTC Enforcement Actions
- FTC Consumer Alerts
- CFPB Enforcement
- Federal Register (FCRA/FDCPA)

**Sources Scanned (Phase 1.1 - Tier 1):**
- Benefits.gov
- Georgia Housing Assistance (DCA)
- Georgia DHS/DFCS
- Georgia Courts

**Sources Scanned (Phase 1.2 - Metro Atlanta):**
- DeKalb County Assistance Programs
- Fulton County Assistance Programs
- Clayton County Assistance Programs
- City of Atlanta Assistance Programs

**Next Scan:** Tomorrow at 6:00am ET
`;
    
    fs.writeFileSync(reportPath, report);
    console.log(`\n[Report] No actionable updates - report saved to ${reportPath}`);
    return reportPath;
  }
  
  // Generate full report
  let report = `# Daily Intel Report - ${date}

**Total Actionable Items:** ${allUpdates.length}

---

`;
  
  // P0 - Critical
  if (p0Items.length > 0) {
    report += `## 🚨 CRITICAL (P0)\n\n`;
    for (const item of p0Items) {
      report += `### ${item.title}\n\n`;
      report += `**Source:** ${item.source}  \n`;
      report += `**Date:** ${item.date}  \n`;
      report += `**Why it matters:** ${item.why}  \n`;
      report += `**Action:** ${item.action}  \n`;
      report += `**Link:** ${item.link}  \n\n`;
      report += `---\n\n`;
    }
  }
  
  // P1 - High Priority
  if (p1Items.length > 0) {
    report += `## ⚠️ HIGH PRIORITY (P1)\n\n`;
    for (const item of p1Items) {
      report += `### ${item.title}\n\n`;
      report += `**Source:** ${item.source}  \n`;
      report += `**Date:** ${item.date}  \n`;
      report += `**Why it matters:** ${item.why}  \n`;
      report += `**Action:** ${item.action}  \n`;
      report += `**Link:** ${item.link}  \n\n`;
      report += `---\n\n`;
    }
  }
  
  // P2 - Monitor
  if (p2Items.length > 0) {
    report += `## 📊 MONITORING (P2)\n\n`;
    for (const item of p2Items) {
      report += `### ${item.title}\n\n`;
      report += `**Source:** ${item.source}  \n`;
      report += `**Date:** ${item.date}  \n`;
      report += `**Why it matters:** ${item.why}  \n`;
      report += `**Action:** ${item.action}  \n`;
      report += `**Link:** ${item.link}  \n\n`;
      report += `---\n\n`;
    }
  }
  
  // Quick Links
  report += `## 🔗 QUICK LINKS\n\n`;
  report += `### Federal Sources\n`;
  report += `- [FTC Enforcement Actions](https://www.ftc.gov/news-events/news/press-releases)\n`;
  report += `- [CFPB Enforcement](https://www.consumerfinance.gov/enforcement/actions/)\n`;
  report += `- [Federal Register](https://www.federalregister.gov/)\n\n`;
  report += `### Georgia Assistance (Tier 1)\n`;
  report += `- [Benefits.gov](https://www.benefits.gov/)\n`;
  report += `- [Georgia Housing Assistance (DCA)](https://www.dca.ga.gov/safe-affordable-housing)\n`;
  report += `- [Georgia DHS/DFCS](https://dhs.georgia.gov/)\n`;
  report += `- [Georgia Courts](https://www.gasupreme.us/)\n\n`;
  report += `### Metro Atlanta Counties (Tier 1)\n`;
  report += `- [DeKalb County Human Services](https://www.dekalbcountyga.gov/human-services)\n`;
  report += `- [Fulton County Human Services](https://www.fultoncountyga.gov/human-services)\n`;
  report += `- [Clayton County Human Services](https://www.claytoncountyga.gov/human-services)\n`;
  report += `- [City of Atlanta Human Services](https://www.atlantaga.gov/government/departments/human-services)\n\n`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`\n[Report] Generated report with ${allUpdates.length} items: ${reportPath}`);
  return reportPath;
}

// Main execution
async function main() {
  console.log('=== Daily Intel Scanner - Consumer Defense Intelligence ===');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('');
  
  const allUpdates = [];
  
  // Run all scanners
  // Phase 1: Federal sources only (FTC, CFPB, Federal Register)
  const ftcEnforcement = await scanFTCEnforcement();
  const ftcAlerts = await scanFTCAlerts();
  const cfpbEnforcement = await scanCFPBEnforcement();
  const federalRegister = await scanFederalRegister();
  
  // Phase 1.1: Georgia Tier 1 sources (NOW ACTIVE)
  const benefitsGov = await scanBenefitsGov();
  const gaHousing = await scanGeorgiaHousing();
  const gaDHS = await scanGeorgiaDHS();
  const gaCourts = await scanGeorgiaCourts();
  
  // Phase 1.2: Metro Atlanta County sources (NOW ACTIVE)
  const deKalb = await scanDeKalbCounty();
  const fulton = await scanFultonCounty();
  const clayton = await scanClaytonCounty();
  const atlanta = await scanCityOfAtlanta();
  
  // Combine all updates
  allUpdates.push(...ftcEnforcement);
  allUpdates.push(...ftcAlerts);
  allUpdates.push(...cfpbEnforcement);
  allUpdates.push(...federalRegister);
  // Phase 1.1: Georgia sources
  allUpdates.push(...benefitsGov);
  allUpdates.push(...gaHousing);
  allUpdates.push(...gaDHS);
  allUpdates.push(...gaCourts);
  // Phase 1.2: Metro Atlanta counties
  allUpdates.push(...deKalb);
  allUpdates.push(...fulton);
  allUpdates.push(...clayton);
  allUpdates.push(...atlanta);
  
  // Generate report
  const reportPath = generateReport(allUpdates);
  
  console.log('');
  console.log('=== Scan Complete ===');
  console.log(`Total actionable items: ${allUpdates.length}`);
  console.log(`Report: ${reportPath}`);
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
