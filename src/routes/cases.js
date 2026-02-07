const express = require('express');
const router = express.Router();
const {
  getMyCases,
  getCaseById,
  getAllCases,
  getAdminCaseById,
  updateCaseStatus,
  updateCaseDocuments,
  deleteCase
} = require('../controllers/casesController');
// runAIAnalysis and getAIAnalysis not exported from casesController
const { verifyPayment } = require('../controllers/paymentVerificationController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateClient } = require('../middleware/clientAuth');

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

// GET /api/cases/:id - Get case details by ID (admin only)
router.get('/cases/:id', authenticateToken, requireAdmin, getAdminCaseById);

// PATCH /api/cases/:id - Update case status (admin only)
router.patch('/cases/:id', authenticateToken, requireAdmin, updateCaseStatus);

// POST /api/cases/:id/analyze - Run AI analysis with pricing (admin only)
// DISABLED: runAIAnalysis not exported from casesController
// router.post('/cases/:id/analyze', authenticateToken, requireAdmin, runAIAnalysis);

// GET /api/cases/:id/analysis - Get last saved AI analysis (admin only)
// DISABLED: getAIAnalysis not exported from casesController
// router.get('/cases/:id/analysis', authenticateToken, requireAdmin, getAIAnalysis);

// DELETE /api/cases/:id - Delete case (admin only)
router.delete('/cases/:id', authenticateToken, requireAdmin, deleteCase);

// PATCH /api/cases/:id/verify-payment - Admin verifies payment (admin only)
router.patch('/cases/:id/verify-payment', authenticateToken, requireAdmin, verifyPayment);

// User routes
// GET /api/cases - Get all cases for current user
router.get('/cases', authenticateToken, getMyCases);

// GET /api/cases/:case_id - Get single case details
router.get('/cases/:case_id', authenticateToken, getCaseById);

// PATCH /api/case/:id/documents - Update case documents (client can update their own)
router.patch('/case/:id/documents', authenticateClient, updateCaseDocuments);

module.exports = router;
