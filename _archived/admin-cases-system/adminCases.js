const express = require('express');
const multer = require('multer');
const router = express.Router();

// IMPORT CONTROLLER FUNCTIONS — IMPORTANT
const {
  createAdminCase,
  getAllAdminCases,
  uploadDocument,
  getCaseDocuments,
  deleteDocument,
  deleteAdminCase
} = require('../controllers/adminCasesController');

// Import getAdminCaseById from casesController (queries cases + business_intakes tables)
const { getAdminCaseById } = require('../controllers/casesController');

// AUTH MIDDLEWARE
const { authenticateToken } = require('../middleware/auth');

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// All routes require authentication
router.use(authenticateToken);

// ------- CASE ROUTES -------
router.post('/create', createAdminCase);
router.get('/', getAllAdminCases);
// Use casesController.getAdminCaseById to query cases + business_intakes tables
router.get('/:id', getAdminCaseById);
router.delete('/:id', deleteAdminCase);

// ------- DOCUMENT ROUTES -------
router.post('/:caseId/upload', upload.single('file'), uploadDocument);
router.get('/:caseId/documents', getCaseDocuments);
router.delete('/documents/:docId', deleteDocument);

module.exports = router;
