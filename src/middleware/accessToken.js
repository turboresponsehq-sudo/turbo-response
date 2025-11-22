/**
 * Access Token Middleware
 * 
 * Validates X-Access-Token header against ACCESS_TOKEN environment variable
 * Used to protect sensitive API endpoints (e.g., Brain System)
 */

module.exports = function accessToken(req, res, next) {
  // ULTRA DEBUG: Log ALL headers
  console.log('[Access Token] ========== REQUEST START ==========');
  console.log('[Access Token] Method:', req.method);
  console.log('[Access Token] Path:', req.path);
  console.log('[Access Token] ALL Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[Access Token] ACCESS_TOKEN env exists:', !!process.env.ACCESS_TOKEN);
  console.log('[Access Token] ACCESS_TOKEN value:', process.env.ACCESS_TOKEN);
  
  // Support multiple header formats
  const token =
    req.headers["x-access-token"] ||
    req.headers["X-Access-Token"] ||
    req.headers["authorization"];

  // Debug logging to see what headers are received
  console.log('[Access Token] Extracted token:', token);
  console.log('[Access Token] Token type:', typeof token);
  console.log('[Access Token] Token length:', token ? token.length : 0);

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
