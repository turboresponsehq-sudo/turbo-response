/**
 * Shim file for Render deployment
 * 
 * This file exists because Render's start command is configured as "node dist/server.js"
 * but our actual server is built as dist/server.mjs (ESM format).
 * 
 * This shim is copied to dist/server.js during build and simply imports the real server.
 */

import('./server.mjs').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
