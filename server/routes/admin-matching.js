/**
 * Admin Matching Routes - Manual trigger for benefits matching
 * 
 * PURPOSE: Founder-controlled endpoint to run matching engine
 * SECURITY: Admin-only access
 * MODE: Controlled sandbox testing
 */

import express from 'express';
import { runMatchingForAllProfiles } from '../matching/eligibility-matcher.js';
import { generateBenefitsReport, saveReportToFile, generateDailySummary, saveDailySummary } from '../matching/report-generator.js';
import { getDb } from '../db';

const router = express.Router();

/**
 * POST /api/admin/run-matching
 * Manually trigger matching for all pending profiles
 * CONTROLLED: Generates draft reports, does NOT send anything to users
 */
router.post('/run-matching', async (req, res) => {
  try {
    console.log('[Admin Matching] Starting manual matching run...');
    
    // Run matching engine
    const results = await runMatchingForAllProfiles();
    
    console.log(`[Admin Matching] Processed ${results.length} profiles`);
    
    // Generate individual reports for each profile
    const db = await getDb();
    const reportPaths = [];
    
    for (const result of results) {
      if (result.status === 'draft') {
        // Fetch full profile with matches
        const profileResult = await db.execute(
          `SELECT * FROM eligibility_profiles WHERE id = ${result.profileId}`
        );
        
        const profileRows = Array.isArray(profileResult) ? profileResult : profileResult.rows || [];
        
        if (profileRows.length > 0) {
          const profile = profileRows[0];
          const matches = JSON.parse(profile.matchedPrograms || '[]');
          
          // Generate report
          const report = generateBenefitsReport(profile, matches);
          const filepath = saveReportToFile(profile, report);
          
          reportPaths.push({
            profileId: profile.id,
            userEmail: profile.userEmail,
            filepath,
          });
          
          console.log(`[Admin Matching] Generated report for profile ${profile.id}: ${filepath}`);
        }
      }
    }
    
    // Generate daily summary for founder
    const summary = generateDailySummary(results);
    const summaryPath = saveDailySummary(summary);
    
    console.log(`[Admin Matching] Generated daily summary: ${summaryPath}`);
    
    res.json({
      success: true,
      message: 'Matching completed successfully',
      results: {
        totalProcessed: results.length,
        successful: results.filter(r => r.status === 'draft').length,
        errors: results.filter(r => r.status === 'error').length,
        reportsGenerated: reportPaths.length,
        summaryPath,
        details: results,
      },
    });
    
  } catch (error) {
    console.error('[Admin Matching] Error running matching:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/matching-status
 * Get current status of all eligibility profiles
 */
router.get('/matching-status', async (req, res) => {
  try {
    const db = await getDb();
    
    const statsResult = await db.execute(`
      SELECT 
        matchingStatus,
        COUNT(*) as count
      FROM eligibility_profiles
      WHERE benefitsConsent = true
      GROUP BY matchingStatus
    `);
    
    const profilesResult = await db.execute(`
      SELECT 
        id,
        userEmail,
        zipCode,
        householdSize,
        monthlyIncomeRange,
        matchingStatus,
        matchingScore,
        reportGeneratedAt,
        approvedBy,
        approvedAt,
        createdAt
      FROM eligibility_profiles
      WHERE benefitsConsent = true
      ORDER BY createdAt DESC
      LIMIT 50
    `);
    
    const stats = Array.isArray(statsResult) ? statsResult : statsResult.rows || [];
    const profiles = Array.isArray(profilesResult) ? profilesResult : profilesResult.rows || [];
    
    res.json({
      success: true,
      stats,
      recentProfiles: profiles,
    });
    
  } catch (error) {
    console.error('[Admin Matching] Error fetching status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/approve-match/:profileId
 * Approve a match and mark it ready for sending
 */
router.post('/approve-match/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { approverName } = req.body; // Founder's name
    
    const db = await getDb();
    
    await db.execute(`
      UPDATE eligibility_profiles
      SET matchingStatus = 'approved',
          approvedBy = '${approverName || 'Admin'}',
          approvedAt = NOW()
      WHERE id = ${profileId}
    `);
    
    console.log(`[Admin Matching] Profile ${profileId} approved by ${approverName}`);
    
    res.json({
      success: true,
      message: `Profile ${profileId} approved. Ready for manual sending.`,
    });
    
  } catch (error) {
    console.error('[Admin Matching] Error approving match:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/reject-match/:profileId
 * Reject a match and reset to pending
 */
router.post('/reject-match/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { reason } = req.body;
    
    const db = await getDb();
    
    await db.execute(`
      UPDATE eligibility_profiles
      SET matchingStatus = 'rejected',
          matchingScore = NULL,
          matchedPrograms = NULL,
          reportGeneratedAt = NULL
      WHERE id = ${profileId}
    `);
    
    console.log(`[Admin Matching] Profile ${profileId} rejected. Reason: ${reason || 'Not specified'}`);
    
    res.json({
      success: true,
      message: `Profile ${profileId} rejected.`,
    });
    
  } catch (error) {
    console.error('[Admin Matching] Error rejecting match:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
