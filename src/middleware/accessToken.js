/**
 * Access Token Middleware
 * 
 * Validates X-Access-Token header against ACCESS_TOKEN environment variable
 * Used to protect sensitive API endpoints (e.g., Brain System)
 */

module.exports = function accessToken(req, res, next) {
  // Support multiple header formats
  const token =
    req.headers["x-access-token"] ||
    req.headers["X-Access-Token"] ||
    req.headers["authorization"];

  // Debug logging to see what headers are received
  console.log('[Access Token] Headers received:', {
    'x-access-token': req.headers["x-access-token"],
    'X-Access-Token': req.headers["X-Access-Token"],
    'authorization': req.headers["authorization"],
    'extracted_token': token ? token.substring(0, 10) + '...' : 'none'
  });

  if (!token) {
    console.log('[Access Token] No token found in headers');
    return res.status(401).json({ error: "Access token required" });
  }

  if (token !== process.env.ACCESS_TOKEN) {
    console.log('[Access Token] Token mismatch');
    return res.status(403).json({ error: "Invalid access token" });
  }

  console.log('[Access Token] Valid token, access granted');
  next();
};
