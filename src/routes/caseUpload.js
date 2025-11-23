const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  uploadCaseDocument,
  getCaseDocuments,
  getDocumentsByType,
  deleteCaseDocument,
} = require('../controllers/caseUploadController');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/heic',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// POST /api/case-upload - Upload case document
router.post('/', upload.single('file'), uploadCaseDocument);

// GET /api/case-upload - Get all case documents (with optional filters)
router.get('/', getCaseDocuments);

// GET /api/case-upload/by-type - Get documents grouped by case type
router.get('/by-type', getDocumentsByType);

// DELETE /api/case-upload/:id - Delete case document
router.delete('/:id', deleteCaseDocument);

module.exports = router;
