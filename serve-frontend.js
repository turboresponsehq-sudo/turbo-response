const express = require('express');
const path = require('path');

/**
 * Frontend serving middleware for SPA routing
 * Serves static files from dist/public and provides fallback to index.html for all non-API routes
 */
function serveFrontend(app) {
  // In production (after esbuild), __dirname is the dist folder
  // In development, __dirname is the project root
  const publicPath = path.join(__dirname, 'public');
  
  // Serve static files from dist/public
  app.use(express.static(publicPath));
  
  // SPA fallback - serve index.html for all non-API routes
  // This MUST be registered AFTER all API routes
  app.get('*', (req, res, next) => {
    // Skip SPA fallback for API routes and backend-rendered routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/resources')) {
      return next(); // Let backend routes handle it
    }
    
    // Serve index.html for all other routes (React Router will handle routing)
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        console.error('[FRONTEND] Error serving index.html:', err);
        res.status(500).json({ 
          error: 'Failed to serve frontend',
          message: err.message 
        });
      }
    });
  });
}

module.exports = { serveFrontend };
