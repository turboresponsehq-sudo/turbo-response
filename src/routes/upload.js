const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadSingleFile, uploadMultipleFiles } = require('../controllers/uploadController');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
    }
  }
});

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds 10MB limit',
        code: err.code
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: 'Unexpected file field in upload',
        code: err.code
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message,
      code: err.code
    });
  } else if (err) {
    // Other errors (e.g., file type validation)
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }
  next();
};

// POST /api/upload/single - Upload single file
router.post('/single', upload.single('file'), handleMulterError, uploadSingleFile);

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', upload.array('files', 5), handleMulterError, uploadMultipleFiles);

module.exports = router;
