/**
 * Access Token Middleware
 * 
 * Validates X-Access-Token header against ACCESS_TOKEN environment variable
 * Used to protect sensitive API endpoints (e.g., Brain System)
 */

module.exports = function accessToken(req, res, next) {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  if (token !== process.env.ACCESS_TOKEN) {
    return res.status(403).json({ error: "Invalid access token" });
  }

  next();
};
