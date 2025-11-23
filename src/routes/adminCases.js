const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  createAdminCase,
  getAllAdminCases,
  getAdminCaseById,
  uploadDocument,
  getCaseDocuments,
  deleteDocument,
  deleteAdminCase
} = require('../controllers/adminCasesController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// All routes require authentication
router.use(authenticateToken);

// Case management routes
router.post('/create', createAdminCase);
router.get('/', getAllAdminCases);
router.get('/:id', getAdminCaseById);
router.delete('/:id', deleteAdminCase);

// Document management routes
router.post('/:caseId/upload', upload.single('file'), uploadDocument);
router.get('/:caseId/documents', getCaseDocuments);
router.delete('/documents/:docId', deleteDocument);

module.exports = router;
