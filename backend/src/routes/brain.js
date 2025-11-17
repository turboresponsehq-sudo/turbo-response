const express = require('express');
const router = express.Router();
const {
  upload,
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getStats
} = require('../controllers/brainController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All Brain routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   POST /api/brain/upload
 * @desc    Upload document to Brain with metadata
 * @access  Admin only
 */
router.post('/upload', upload.single('file'), uploadDocument);

/**
 * @route   GET /api/brain/documents
 * @desc    Get all documents with filters
 * @access  Admin only
 * @query   domain, category, tags, visibility, search, status, limit, offset
 */
router.get('/documents', getDocuments);

/**
 * @route   GET /api/brain/document/:id
 * @desc    Get single document by ID
 * @access  Admin only
 */
router.get('/document/:id', getDocumentById);

/**
 * @route   PUT /api/brain/document/:id
 * @desc    Update document metadata
 * @access  Admin only
 */
router.put('/document/:id', updateDocument);

/**
 * @route   DELETE /api/brain/document/:id
 * @desc    Delete document
 * @access  Admin only
 */
router.delete('/document/:id', deleteDocument);

/**
 * @route   GET /api/brain/stats
 * @desc    Get Brain statistics
 * @access  Admin only
 */
router.get('/stats', getStats);

module.exports = router;
