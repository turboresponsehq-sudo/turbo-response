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

// POST /api/upload/single - Upload single file
router.post('/single', upload.single('file'), uploadSingleFile);

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', upload.array('files', 5), uploadMultipleFiles);

module.exports = router;
