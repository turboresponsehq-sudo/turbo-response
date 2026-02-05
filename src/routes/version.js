const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');

/**
 * GET /api/version
 * Returns deployment version information for debugging
 * 
 * Usage: Check this endpoint after deployment to verify which code version is running
 */
router.get('/', (req, res) => {
  try {
    // Get git commit SHA (short version)
    const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const commitShort = commitSha.substring(0, 7);
    
    // Get commit timestamp
    const commitDate = execSync('git log -1 --format=%ai', { encoding: 'utf-8' }).trim();
    
    // Get commit message
    const commitMessage = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim();
    
    // Get branch name
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    
    // Server start time (uptime)
    const uptimeSeconds = process.uptime();
    const uptimeFormatted = formatUptime(uptimeSeconds);
    
    res.json({
      status: 'healthy',
      version: commitShort,
      commitSha: commitSha,
      commitDate: commitDate,
      commitMessage: commitMessage,
      branch: branch,
      buildTime: new Date().toISOString(),
      uptime: uptimeFormatted,
      uptimeSeconds: Math.floor(uptimeSeconds),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      features: {
        cookieAuth: false,  // Will be true after PR #4
        ragSystem: true,
        clientPortal: true,
        mobileIntakeFix: true  // Commit d8e1daa0
      }
    });
  } catch (error) {
    // If git commands fail (e.g., not in git repo), return minimal info
    res.json({
      status: 'healthy',
      version: 'unknown',
      error: 'Git information not available',
      uptime: formatUptime(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

/**
 * Format uptime in human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime (e.g., "2h 15m 30s")
 */
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = router;
