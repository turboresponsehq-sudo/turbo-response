/**
 * Report Generator - Create personalized benefits reports
 * 
 * PURPOSE: Generate markdown reports for matched programs
 * OUTPUT: Saved to /docs/people-benefits-reports/ for founder review
 * APPROVAL: Founder reviews before sending to users
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a personalized benefits report
 */
export function generateBenefitsReport(profile, matches) {
  const reportDate = new Date().toISOString().split('T')[0];
  
  let report = `# Benefits Matching Report\n\n`;
  report += `**Generated:** ${reportDate}\n`;
  report += `**Profile ID:** ${profile.id}\n`;
  report += `**User Email:** ${profile.userEmail}\n`;
  report += `**Overall Match Score:** ${profile.matchingScore || 'N/A'}/100\n\n`;
  
  report += `---\n\n`;
  
  report += `## Your Eligibility Profile\n\n`;
  report += `- **Location:** ZIP ${profile.zipCode}\n`;
  report += `- **Household Size:** ${profile.householdSize} ${profile.householdSize === 1 ? 'person' : 'people'}\n`;
  report += `- **Monthly Income:** ${profile.monthlyIncomeRange}\n`;
  report += `- **Housing Status:** ${formatHousingStatus(profile.housingStatus)}\n`;
  report += `- **Employment:** ${formatEmploymentStatus(profile.employmentStatus)}\n`;
  
  if (profile.specialCircumstances) {
    const circumstances = JSON.parse(profile.specialCircumstances);
    if (circumstances.length > 0) {
      report += `- **Special Circumstances:** ${circumstances.map(formatSpecialCircumstance).join(', ')}\n`;
    }
  }
  
  report += `\n---\n\n`;
  
  report += `## Matched Programs (${matches.length} found)\n\n`;
  
  if (matches.length === 0) {
    report += `No programs matched your profile at this time. This may be because:\n`;
    report += `- Your income is above program limits\n`;
    report += `- Programs in your area have specific requirements\n`;
    report += `- Our database is still being expanded\n\n`;
    report += `**Next Steps:** Contact Turbo Response for a manual review of additional programs.\n`;
  } else {
    matches.forEach((match, index) => {
      const { program, score, eligibilityNotes } = match;
      
      report += `### ${index + 1}. ${program.name}\n\n`;
      report += `**Category:** ${program.category}\n`;
      report += `**Match Score:** ${score}/100\n`;
      report += `**Estimated Value:** ${program.estimatedValue}\n`;
      report += `**Deadline:** ${program.deadline}\n\n`;
      
      report += `**Description:**\n${program.description}\n\n`;
      
      report += `**Eligibility Assessment:**\n${eligibilityNotes}\n\n`;
      
      report += `**Documents Needed:**\n`;
      program.documentsNeeded.forEach(doc => {
        report += `- ${doc}\n`;
      });
      report += `\n`;
      
      report += `**Next Steps:**\n`;
      report += `1. Gather required documents listed above\n`;
      report += `2. Visit application portal: ${program.applicationUrl}\n`;
      report += `3. Complete application before deadline: ${program.deadline}\n`;
      report += `4. Contact Turbo Response if you need help with the application\n\n`;
      
      report += `---\n\n`;
    });
  }
  
  report += `## Important Notes\n\n`;
  report += `- **This is a preliminary assessment** - final eligibility is determined by each program\n`;
  report += `- **Apply as soon as possible** - many programs have limited funding or waitlists\n`;
  report += `- **Keep copies of all documents** submitted with applications\n`;
  report += `- **Contact Turbo Response** if you need assistance with any application\n\n`;
  
  report += `---\n\n`;
  report += `**Turbo Response - AI-Powered Consumer Defense**\n`;
  report += `*Helping everyday people access the resources they deserve*\n`;
  
  return report;
}

/**
 * Save report to file system
 */
export function saveReportToFile(profile, report) {
  const reportsDir = path.join(__dirname, '../../docs/people-benefits-reports');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportDate = new Date().toISOString().split('T')[0];
  const filename = `profile-${profile.id}-${reportDate}.md`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, report, 'utf8');
  
  return filepath;
}

/**
 * Generate daily summary report for founder
 */
export function generateDailySummary(results) {
  const reportDate = new Date().toISOString().split('T')[0];
  
  let summary = `# Daily Benefits Matching Summary\n\n`;
  summary += `**Date:** ${reportDate}\n`;
  summary += `**Total Profiles Processed:** ${results.length}\n\n`;
  
  const successful = results.filter(r => r.status === 'draft');
  const errors = results.filter(r => r.status === 'error');
  
  summary += `**Status Breakdown:**\n`;
  summary += `- ✅ Successfully matched: ${successful.length}\n`;
  summary += `- ❌ Errors: ${errors.length}\n\n`;
  
  summary += `---\n\n`;
  
  if (successful.length > 0) {
    summary += `## Successful Matches (Pending Your Review)\n\n`;
    
    successful.forEach(result => {
      summary += `### Profile ${result.profileId}\n`;
      summary += `- **Email:** ${result.userEmail}\n`;
      summary += `- **Programs Found:** ${result.matchCount}\n`;
      summary += `- **Average Score:** ${result.avgScore}/100\n`;
      summary += `- **Status:** DRAFT (awaiting approval)\n\n`;
    });
  }
  
  if (errors.length > 0) {
    summary += `## Errors\n\n`;
    
    errors.forEach(result => {
      summary += `### Profile ${result.profileId}\n`;
      summary += `- **Email:** ${result.userEmail}\n`;
      summary += `- **Error:** ${result.error}\n\n`;
    });
  }
  
  summary += `---\n\n`;
  summary += `**Next Steps:**\n`;
  summary += `1. Review individual reports in /docs/people-benefits-reports/\n`;
  summary += `2. Approve high-quality matches\n`;
  summary += `3. Reject or refine low-quality matches\n`;
  summary += `4. Send approved reports to users\n\n`;
  
  return summary;
}

/**
 * Save daily summary to file
 */
export function saveDailySummary(summary) {
  const reportsDir = path.join(__dirname, '../../docs/people-benefits-reports');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportDate = new Date().toISOString().split('T')[0];
  const filename = `daily-summary-${reportDate}.md`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, summary, 'utf8');
  
  return filepath;
}

// Helper formatting functions
function formatHousingStatus(status) {
  const labels = {
    'rent': 'Renting',
    'own': 'Homeowner',
    'homeless': 'Homeless',
    'at-risk': 'At risk of homelessness',
    'with-family': 'Living with family',
    'temporary': 'Temporary housing',
  };
  return labels[status] || status;
}

function formatEmploymentStatus(status) {
  const labels = {
    'employed-full': 'Employed full-time',
    'employed-part': 'Employed part-time',
    'self-employed': 'Self-employed',
    'unemployed': 'Unemployed',
    'disabled': 'Disabled',
    'retired': 'Retired',
    'student': 'Student',
  };
  return labels[status] || status;
}

function formatSpecialCircumstance(circumstance) {
  const labels = {
    'veteran': 'Veteran',
    'disability': 'Disability',
    'student': 'Student',
    'senior': 'Senior (65+)',
    'single-parent': 'Single parent',
    'pregnant': 'Pregnant',
  };
  return labels[circumstance] || circumstance;
}
