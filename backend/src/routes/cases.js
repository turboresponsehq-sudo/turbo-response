const express = require('express');
const router = express.Router();
const { getMyCases, getCaseById, getAllCases, getAdminCaseById, updateCaseStatus } = require('../controllers/casesController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Admin routes (must come before user routes to avoid conflicts)
// GET /api/cases/admin/all - Get all cases (admin only)
router.get('/cases/admin/all', authenticateToken, requireAdmin, getAllCases);

// GET /api/case/:id - Get case details by ID (admin only)
router.get('/case/:id', authenticateToken, requireAdmin, getAdminCaseById);

// PATCH /api/case/:id - Update case status (admin only)
router.patch('/case/:id', authenticateToken, requireAdmin, updateCaseStatus);

// User routes
// GET /api/cases - Get all cases for current user
router.get('/cases', authenticateToken, getMyCases);

// GET /api/cases/:case_id - Get single case details
router.get('/cases/:case_id', authenticateToken, getCaseById);

module.exports = router;
