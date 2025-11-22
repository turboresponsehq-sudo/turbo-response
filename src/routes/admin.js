const express = require('express');
const router = express.Router();
const {
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getStats
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/submissions - Get all submissions
router.get('/submissions', getAllSubmissions);

// GET /api/admin/submissions/:id - Get single submission
router.get('/submissions/:id', getSubmissionById);

// PATCH /api/admin/submissions/:id - Update submission
router.patch('/submissions/:id', updateSubmission);

// DELETE /api/admin/submissions/:id - Delete submission
router.delete('/submissions/:id', deleteSubmission);

// GET /api/admin/stats - Get dashboard stats
router.get('/stats', getStats);

module.exports = router;
