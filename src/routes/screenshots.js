const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../services/storage/local');
const { query } = require('../services/database/db');
const logger = require('../utils/logger');
const accessToken = require('../middleware/accessToken');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

/**
 * POST /api/screenshots/upload
 * Upload a screenshot with metadata
 */
router.post('/upload', accessToken, upload.single('screenshot'), async (req, res) => {
  try {
    logger.info('[Screenshot Upload] Request received', {
      hasFile: !!req.file,
      body: req.body
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No screenshot file provided'
      });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { description, research_notes } = req.body;

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }

    logger.info('[Screenshot Upload] Processing file', {
      originalname,
      mimetype,
      size: buffer.length,
      description: description.substring(0, 50)
    });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = originalname.split('.').pop();
    const filename = `screenshot-${timestamp}.${ext}`;

    // Upload to storage
    logger.info('[Screenshot Upload] Uploading to storage', { filename });
    const fileUrl = await uploadFile(buffer, filename, mimetype);

    // Save metadata to database
    const insertQuery = `
      INSERT INTO screenshots (
        file_url,
        file_name,
        description,
        research_notes,
        mime_type,
        file_size,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const result = await query(insertQuery, [
      fileUrl,
      filename,
      description,
      research_notes || null,
      mimetype,
      buffer.length
    ]);

    logger.info('[Screenshot Upload] Success', {
      id: result.rows[0].id,
      filename
    });

    res.status(200).json({
      success: true,
      screenshot: result.rows[0]
    });

  } catch (error) {
    logger.error('[Screenshot Upload] Error', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Screenshot upload failed',
      message: error.message
    });
  }
});

/**
 * GET /api/screenshots/list
 * Get all screenshots
 */
router.get('/list', accessToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM screenshots
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      screenshots: result.rows
    });

  } catch (error) {
    logger.error('[Screenshot List] Error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch screenshots'
    });
  }
});

/**
 * DELETE /api/screenshots/:id
 * Delete a screenshot
 */
router.delete('/:id', accessToken, async (req, res) => {
  try {
    const { id } = req.params;
    const screenshotId = parseInt(id);

    if (!id || isNaN(screenshotId) || screenshotId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid screenshot ID'
      });
    }

    const result = await query(
      'DELETE FROM screenshots WHERE id = $1 RETURNING *',
      [screenshotId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Screenshot not found'
      });
    }

    logger.info('[Screenshot Delete] Success', { id: screenshotId });

    res.json({
      success: true,
      message: 'Screenshot deleted successfully'
    });

  } catch (error) {
    logger.error('[Screenshot Delete] Error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to delete screenshot'
    });
  }
});

module.exports = router;
