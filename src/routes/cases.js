const express = require('express');
const router = express.Router();

const {
  getAdminCaseById,
  getAllCases,
} = require('../controllers/casesController');

const authenticateToken = require('../middleware/auth');

// Admin: get ALL cases
router.get('/admin/cases/all', authenticateToken, getAllCases);

// Admin: get ONE case
router.get('/admin/cases/:id', authenticateToken, getAdminCaseById);

module.exports = router;
