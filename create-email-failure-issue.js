#!/usr/bin/env node

/**
 * Failsafe Alert - Create GitHub Issue When Daily Email Fails
 * 
 * Purpose: Automatically create a GitHub issue when daily email delivery fails
 * Trigger: Called by daily-intel-delivery.js when SendGrid fails
 * 
 * Requirements:
 * - GITHUB_TOKEN environment variable (provided by GitHub Actions)
 * - gh CLI tool (pre-installed in GitHub Actions)
 */

const { execSync } = require('child_process');

async function createFailureIssue(errorMessage, timestamp) {
  console.log('[FAILSAFE] Creating GitHub issue for email failure...');
  
  const issueTitle = `[CRITICAL] Daily Email Failed - ${timestamp}`;
  
  const issueBody = `## 🚨 Daily Email Delivery Failure

**Timestamp:** ${timestamp}
**Status:** FAILED
**Error:** ${errorMessage}

---

## What Happened

The daily intel email delivery script failed to send the email via SendGrid.

**Expected:** Email sent successfully with 202 status code
**Actual:** SendGrid API call failed

---

## Investigation Required

1. Check SendGrid API key validity
2. Check SendGrid account status (quota, suspension)
3. Check network connectivity
4. Review full workflow logs: [View Run](https://github.com/turboresponsehq-sudo/turbo-response/actions)

---

## Impact

⚠️ **Owner did NOT receive daily email**

This breaks the daily email reliability guarantee.

---

## Next Steps

1. Investigate root cause
2. Fix issue
3. Run manual test
4. Verify email received
5. Close this issue with proof

---

**Labels:** critical, email-delivery, automation
**Assignee:** @turboresponsehq-sudo
`;

  try {
    // Create GitHub issue using gh CLI
    const command = `gh issue create --title "${issueTitle}" --body "${issueBody}" --label "critical,email-delivery,automation" --repo turboresponsehq-sudo/turbo-response`;
    
    const result = execSync(command, { encoding: 'utf8' });
    
    console.log('[FAILSAFE] ✅ GitHub issue created successfully');
    console.log('[FAILSAFE] Issue URL:', result.trim());
    
    return result.trim();
  } catch (error) {
    console.error('[FAILSAFE] ❌ Failed to create GitHub issue:', error.message);
    // Don't throw - this is a failsafe, not critical path
    return null;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node create-email-failure-issue.js <error_message> <timestamp>');
    process.exit(1);
  }
  
  const errorMessage = args[0];
  const timestamp = args[1];
  
  await createFailureIssue(errorMessage, timestamp);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createFailureIssue };
