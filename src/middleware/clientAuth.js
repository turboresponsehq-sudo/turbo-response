const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate client portal access
 * Verifies JWT token from httpOnly cookie
 */
function authenticateClient(req, res, next) {
  try {
    const token = req.cookies.client_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is for client (not admin)
    if (decoded.type !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Attach client auth data to request
    req.clientAuth = {
      caseId: decoded.caseId,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
}

module.exports = { authenticateClient };
