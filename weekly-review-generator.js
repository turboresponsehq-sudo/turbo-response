#!/usr/bin/env node

/**
 * Weekly Review Generator
 * 
 * Generates weekly review report with wins, issues, trends, and next week priorities
 * 
 * Runs: Sunday 8:00pm ET via GitHub Actions
 * Input: Daily intel reports from past week
 * Output: /docs/weekly-reviews/review-YYYY-MM-DD.md + Email
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  github: {
    owner: 'turboresponsehq-sudo',
    repo: 'turbo-response',
    token: process.env.GITHUB_TOKEN || '',
  },
  email: {
    to: 'Turboresponsehq@gmail.com',
    from: 'intel@turboresponsehq.ai',
    apiKey: process.env.SENDGRID_API_KEY || '',
  },
  reportDir: './docs/intel-reports',
  outputDir: './docs/weekly-reviews',
  timezone: 'America/New_York',
};

// Utility: Get date range for past week
function getWeekDateRange() {
  const now = new Date();
  const etOffset = -5 * 60;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const etTime = new Date(utc + (etOffset * 60000));
  
  // End date is today
  const endDate = etTime.toISOString().split('T')[0];
  
  // Start date is 7 days ago
  const startTime = new Date(etTime.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startDate = startTime.toISOString().split('T')[0];
  
  return { startDate, endDate };
}

// Utility: Format date for display
function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Utility: Make HTTPS request
function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Aggregator: Load and parse daily reports from past week
function loadWeeklyReports() {
  const { startDate, endDate } = getWeekDateRange();
  const reports = [];
  
  console.log(`[Aggregator] Loading reports from ${startDate} to ${endDate}...`);
  
  // Generate date list for past 7 days
  const dates = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  // Load each report
  dates.forEach(date => {
    const reportPath = path.join(CONFIG.reportDir, `intel-${date}.md`);
    if (fs.existsSync(reportPath)) {
      const content = fs.readFileSync(reportPath, 'utf8');
      reports.push({
        date,
        content,
        parsed: parseReport(content),
      });
      console.log(`  ✅ Loaded: ${date}`);
    } else {
      console.log(`  ⚠️ Missing: ${date}`);
    }
  });
  
  return { reports, startDate, endDate };
}

// Parser: Extract key info from daily report
function parseReport(markdown) {
  const parsed = {
    productionStatus: 'unknown',
    actionItems: [],
    p0Count: 0,
    p1Count: 0,
    p2Count: 0,
  };

  // Extract production status
  const statusMatch = markdown.match(/\*\*Production Status:\*\* (.+)/);
  if (statusMatch) {
    parsed.productionStatus = statusMatch[1];
  }

  // Extract action items
  const itemMatches = markdown.matchAll(/#### \d+\. (.+?)\n\n\*\*Category:\*\* (.+?)\n\n\*\*Description:\*\* (.+?)\n\n\*\*Action Required:\*\* (.+?)(?:\n\n|\n$)/gs);
  
  for (const match of itemMatches) {
    const [, title, category, description, action] = match;
    
    let priority = 'P2';
    if (title.includes('🚨')) priority = 'P0';
    else if (title.includes('⚠️') || title.includes('🐛')) priority = 'P1';
    
    parsed.actionItems.push({
      priority,
      title: title.trim(),
      category: category.trim(),
    });

    if (priority === 'P0') parsed.p0Count++;
    else if (priority === 'P1') parsed.p1Count++;
    else parsed.p2Count++;
  }

  return parsed;
}

// Analyzer: Aggregate metrics from weekly reports
function analyzeWeeklyMetrics(reports) {
  console.log('[Analyzer] Analyzing weekly metrics...');
  
  const metrics = {
    totalReports: reports.length,
    totalActionItems: 0,
    totalP0: 0,
    totalP1: 0,
    totalP2: 0,
    productionUptime: 0,
    productionDowntime: 0,
    productionDegraded: 0,
  };

  reports.forEach(report => {
    metrics.totalActionItems += report.parsed.actionItems.length;
    metrics.totalP0 += report.parsed.p0Count;
    metrics.totalP1 += report.parsed.p1Count;
    metrics.totalP2 += report.parsed.p2Count;
    
    if (report.parsed.productionStatus.includes('Healthy')) {
      metrics.productionUptime++;
    } else if (report.parsed.productionStatus.includes('Down')) {
      metrics.productionDowntime++;
    } else if (report.parsed.productionStatus.includes('Degraded')) {
      metrics.productionDegraded++;
    }
  });

  // Calculate percentages
  if (metrics.totalReports > 0) {
    metrics.uptimePercentage = ((metrics.productionUptime / metrics.totalReports) * 100).toFixed(1);
  }

  return metrics;
}

// Analyzer: Identify wins from the week
function identifyWins(reports) {
  console.log('[Analyzer] Identifying wins...');
  
  const wins = [];

  // Win: No P0 issues
  const totalP0 = reports.reduce((sum, r) => sum + r.parsed.p0Count, 0);
  if (totalP0 === 0) {
    wins.push('Zero critical (P0) issues this week');
  }

  // Win: High uptime
  const uptimeDays = reports.filter(r => r.parsed.productionStatus.includes('Healthy')).length;
  if (uptimeDays === reports.length) {
    wins.push('100% production uptime (all days healthy)');
  } else if (uptimeDays >= reports.length * 0.9) {
    wins.push(`${uptimeDays}/${reports.length} days with healthy production status`);
  }

  // Win: Decreasing issue count (compare first half vs second half)
  const midpoint = Math.floor(reports.length / 2);
  const firstHalf = reports.slice(0, midpoint);
  const secondHalf = reports.slice(midpoint);
  
  const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.parsed.actionItems.length, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.parsed.actionItems.length, 0) / secondHalf.length;
  
  if (secondHalfAvg < firstHalfAvg) {
    const decrease = ((1 - secondHalfAvg / firstHalfAvg) * 100).toFixed(0);
    wins.push(`Action items decreased ${decrease}% (week-over-week trend)`);
  }

  // Default win if none found
  if (wins.length === 0) {
    wins.push('System remained operational throughout the week');
  }

  return wins;
}

// Analyzer: Identify issues from the week
function identifyIssues(reports) {
  console.log('[Analyzer] Identifying issues...');
  
  const issues = [];

  // Issue: Any P0 items
  const p0Items = [];
  reports.forEach(report => {
    const p0 = report.parsed.actionItems.filter(i => i.priority === 'P0');
    p0Items.push(...p0.map(i => ({ date: report.date, ...i })));
  });
  
  if (p0Items.length > 0) {
    issues.push(`${p0Items.length} critical (P0) issue(s) occurred: ${p0Items.map(i => i.title).join('; ')}`);
  }

  // Issue: Production downtime
  const downtimeDays = reports.filter(r => r.parsed.productionStatus.includes('Down'));
  if (downtimeDays.length > 0) {
    issues.push(`Production downtime on ${downtimeDays.length} day(s): ${downtimeDays.map(r => r.date).join(', ')}`);
  }

  // Issue: Production degraded
  const degradedDays = reports.filter(r => r.parsed.productionStatus.includes('Degraded'));
  if (degradedDays.length > 0) {
    issues.push(`Production degraded on ${degradedDays.length} day(s): ${degradedDays.map(r => r.date).join(', ')}`);
  }

  // Issue: High P1 count
  const totalP1 = reports.reduce((sum, r) => sum + r.parsed.p1Count, 0);
  if (totalP1 > 10) {
    issues.push(`High volume of P1 issues (${totalP1} total) may indicate systemic problems`);
  }

  // Default if no issues
  if (issues.length === 0) {
    issues.push('No major issues detected this week');
  }

  return issues;
}

// Analyzer: Identify trends
function identifyTrends(reports) {
  console.log('[Analyzer] Identifying trends...');
  
  const trends = [];

  // Trend: Most common categories
  const categories = {};
  reports.forEach(report => {
    report.parsed.actionItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
  });

  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (sortedCategories.length > 0) {
    trends.push(`Most common categories: ${sortedCategories.map(([cat, count]) => `${cat} (${count})`).join(', ')}`);
  }

  // Trend: Action item volume over time
  if (reports.length >= 3) {
    const early = reports.slice(0, 2);
    const late = reports.slice(-2);
    
    const earlyAvg = early.reduce((sum, r) => sum + r.parsed.actionItems.length, 0) / early.length;
    const lateAvg = late.reduce((sum, r) => sum + r.parsed.actionItems.length, 0) / late.length;
    
    if (lateAvg > earlyAvg * 1.2) {
      trends.push('Action items increasing (may need attention)');
    } else if (lateAvg < earlyAvg * 0.8) {
      trends.push('Action items decreasing (positive trend)');
    } else {
      trends.push('Action item volume stable');
    }
  }

  return trends;
}

// Analyzer: Generate next week priorities
function generateNextWeekPriorities(reports) {
  console.log('[Analyzer] Generating next week priorities...');
  
  const priorities = [];

  // Priority 1: Address any unresolved P0/P1 items
  const recentReport = reports[reports.length - 1];
  if (recentReport) {
    const highPriority = recentReport.parsed.actionItems.filter(i => 
      i.priority === 'P0' || i.priority === 'P1'
    );
    
    if (highPriority.length > 0) {
      priorities.push(`Resolve ${highPriority.length} high-priority item(s) from latest report`);
    }
  }

  // Priority 2: Focus on most common category
  const categories = {};
  reports.forEach(report => {
    report.parsed.actionItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
  });

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && topCategory[1] > 3) {
    priorities.push(`Focus on ${topCategory[0]} issues (${topCategory[1]} occurrences this week)`);
  }

  // Priority 3: Maintain uptime
  priorities.push('Maintain production uptime and system health');

  // Priority 4: Monitor trends
  priorities.push('Monitor action item trends and adjust as needed');

  return priorities.slice(0, 5); // Max 5 priorities
}

// Generator: Create markdown review
function generateReview(reports, startDate, endDate, metrics, wins, issues, trends, priorities) {
  console.log('[Generator] Creating weekly review...');
  
  let review = `# Weekly Review - ${formatDate(startDate)} to ${formatDate(endDate)}\n\n`;
  review += `**Generated:** ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n`;
  review += `**Period:** ${startDate} to ${endDate} (${reports.length} days)\n\n`;
  review += `---\n\n`;
  
  // Executive Summary
  review += `## 📊 Executive Summary\n\n`;
  review += `This week saw **${metrics.totalActionItems} total action items** across ${reports.length} daily reports. `;
  review += `Production uptime was **${metrics.uptimePercentage}%** with ${metrics.productionUptime} healthy days. `;
  
  if (metrics.totalP0 > 0) {
    review += `**${metrics.totalP0} critical (P0) issue(s)** required immediate attention.\n\n`;
  } else {
    review += `**No critical issues** this week.\n\n`;
  }
  
  review += `---\n\n`;
  
  // Metrics
  review += `## 📈 Weekly Metrics\n\n`;
  review += `| Metric | Value |\n`;
  review += `|--------|-------|\n`;
  review += `| Total Reports | ${metrics.totalReports} |\n`;
  review += `| Total Action Items | ${metrics.totalActionItems} |\n`;
  review += `| Critical (P0) | ${metrics.totalP0} |\n`;
  review += `| High Priority (P1) | ${metrics.totalP1} |\n`;
  review += `| Medium Priority (P2) | ${metrics.totalP2} |\n`;
  review += `| Production Uptime | ${metrics.uptimePercentage}% (${metrics.productionUptime}/${metrics.totalReports} days) |\n`;
  review += `| Production Downtime | ${metrics.productionDowntime} day(s) |\n`;
  review += `| Production Degraded | ${metrics.productionDegraded} day(s) |\n`;
  review += `\n`;
  
  review += `---\n\n`;
  
  // Wins
  review += `## ✅ Wins This Week\n\n`;
  wins.forEach((win, index) => {
    review += `${index + 1}. ${win}\n`;
  });
  review += `\n`;
  
  review += `---\n\n`;
  
  // Issues
  review += `## ⚠️ Issues This Week\n\n`;
  issues.forEach((issue, index) => {
    review += `${index + 1}. ${issue}\n`;
  });
  review += `\n`;
  
  review += `---\n\n`;
  
  // Trends
  review += `## 📊 Trends & Patterns\n\n`;
  trends.forEach((trend, index) => {
    review += `${index + 1}. ${trend}\n`;
  });
  review += `\n`;
  
  review += `---\n\n`;
  
  // Next Week Priorities
  review += `## 🎯 Next Week Priorities\n\n`;
  priorities.forEach((priority, index) => {
    review += `${index + 1}. ${priority}\n`;
  });
  review += `\n`;
  
  review += `---\n\n`;
  
  // Quick Links
  review += `## 🔗 Quick Links\n\n`;
  review += `- [Production Site](https://turboresponsehq.ai)\n`;
  review += `- [GitHub Repository](https://github.com/${CONFIG.github.owner}/${CONFIG.github.repo})\n`;
  review += `- [Open Issues](https://github.com/${CONFIG.github.owner}/${CONFIG.github.repo}/issues)\n`;
  review += `- [Daily Intel Reports](../intel-reports/)\n`;
  review += `\n`;
  
  review += `---\n\n`;
  review += `**Next Review:** Next Sunday at 8:00pm ET\n`;
  
  return review;
}

// Email: Send weekly review
async function sendWeeklyReviewEmail(reviewMarkdown, startDate, endDate) {
  console.log('[Email] Sending weekly review...');
  
  // Convert markdown to simple HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #0066cc; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #0066cc; margin-top: 30px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f2f2f2; }
    .summary { background-color: #f0f7ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <pre>${reviewMarkdown}</pre>
</body>
</html>
`;

  const body = JSON.stringify({
    personalizations: [{ to: [{ email: CONFIG.email.to }] }],
    from: { email: CONFIG.email.from, name: 'Turbo Response Intel' },
    subject: `Weekly Review - ${formatDate(startDate)} to ${formatDate(endDate)}`,
    content: [{ type: 'text/html', value: html }],
  });

  const options = {
    hostname: 'api.sendgrid.com',
    path: '/v3/mail/send',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.email.apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const res = await httpsRequest(options, body);
    
    if (res.status === 202) {
      console.log('✅ Weekly review email sent');
      return { success: true };
    } else {
      console.error('❌ Email failed:', res.status, res.body);
      return { success: false, error: res.body };
    }
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('=== Weekly Review Generator ===');
  console.log(`Starting at ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n`);

  // Load weekly reports
  const { reports, startDate, endDate } = loadWeeklyReports();
  
  if (reports.length === 0) {
    console.error('❌ No reports found for the past week');
    process.exit(1);
  }

  console.log(`\nLoaded ${reports.length} reports\n`);

  // Analyze
  const metrics = analyzeWeeklyMetrics(reports);
  const wins = identifyWins(reports);
  const issues = identifyIssues(reports);
  const trends = identifyTrends(reports);
  const priorities = generateNextWeekPriorities(reports);

  // Generate review
  const review = generateReview(reports, startDate, endDate, metrics, wins, issues, trends, priorities);

  // Save review
  const outputPath = path.join(CONFIG.outputDir, `review-${endDate}.md`);
  
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, review);
  console.log(`\n✅ Review saved: ${outputPath}`);

  // Send email
  const emailResult = await sendWeeklyReviewEmail(review, startDate, endDate);

  // Summary
  console.log('\n=== Weekly Review Summary ===');
  console.log(`Period: ${startDate} to ${endDate}`);
  console.log(`Reports analyzed: ${reports.length}`);
  console.log(`Total action items: ${metrics.totalActionItems}`);
  console.log(`Wins: ${wins.length}`);
  console.log(`Issues: ${issues.length}`);
  console.log(`Email: ${emailResult.success ? '✅ Sent' : '❌ Failed'}`);

  return {
    review,
    outputPath,
    metrics,
    emailResult,
  };
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Weekly review complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Weekly review failed:', error);
      process.exit(1);
    });
}

module.exports = { main, loadWeeklyReports, analyzeWeeklyMetrics, identifyWins, identifyIssues, identifyTrends };
