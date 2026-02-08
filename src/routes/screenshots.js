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


/**
 * POST /api/screenshots/:id/send-to-brain
 * Send a screenshot to the Brain system with OCR
 */
router.post('/:id/send-to-brain', accessToken, async (req, res) => {
  try {
    const { id } = req.params;
    const screenshotId = parseInt(id);

    if (!id || isNaN(screenshotId) || screenshotId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid screenshot ID'
      });
    }

    logger.info('[Screenshot → Brain] Request received', { screenshotId });

    // 1. Get screenshot from database
    const screenshotResult = await query(
      'SELECT * FROM screenshots WHERE id = $1',
      [screenshotId]
    );

    if (screenshotResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Screenshot not found'
      });
    }

    const screenshot = screenshotResult.rows[0];

    // 2. Check if already in Brain
    if (screenshot.in_brain) {
      return res.status(400).json({
        success: false,
        error: 'Screenshot already in Brain',
        brain_document_id: screenshot.brain_document_id
      });
    }

    // 3. Download image and perform OCR
    const axios = require('axios');
    const { extractTextFromImage } = require('../services/ocrService');
    
    logger.info('[Screenshot → Brain] Downloading image for OCR', { 
      url: screenshot.file_url 
    });

    const imageResponse = await axios.get(screenshot.file_url, {
      responseType: 'arraybuffer'
    });
    const imageBuffer = Buffer.from(imageResponse.data);

    logger.info('[Screenshot → Brain] Performing OCR');
    const extractedText = await extractTextFromImage(imageBuffer);

    // 4. Upload to Supabase Brain
    const { getBrainBucket, getSupabaseDB } = require('../services/supabase/client');
    
    const bucket = getBrainBucket();
    const supabase = getSupabaseDB();

    // Generate unique filename for Brain storage
    const timestamp = Date.now();
    const sanitizedFilename = screenshot.file_name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const brainFilename = `screenshot_${timestamp}_${sanitizedFilename}`;

    logger.info('[Screenshot → Brain] Uploading to Brain storage', { brainFilename });

    // Upload image to Brain bucket
    const { data: uploadData, error: uploadError } = await bucket.upload(
      brainFilename,
      imageBuffer,
      {
        contentType: screenshot.mime_type,
        cacheControl: '3600',
        upsert: false
      }
    );

    if (uploadError) {
      logger.error('[Screenshot → Brain] Storage upload failed', { error: uploadError });
      return res.status(500).json({
        success: false,
        error: 'Failed to upload to Brain storage',
        details: uploadError.message
      });
    }

    // Get public URL
    const { data: urlData } = bucket.getPublicUrl(brainFilename);
    const brainFileUrl = urlData.publicUrl;

    // 5. Create brain_documents entry
    const { data: brainDoc, error: brainError } = await supabase
      .from('brain_documents')
      .insert({
        title: screenshot.description || `Screenshot ${screenshot.id}`,
        description: `Screenshot uploaded on ${new Date(screenshot.created_at).toLocaleDateString()}\n\nExtracted Text:\n${extractedText}`,
        file_name: brainFilename,
        file_path: brainFilename,
        file_url: brainFileUrl,
        mime_type: screenshot.mime_type,
        size_bytes: screenshot.file_size,
        source: 'screenshot'
      })
      .select()
      .single();

    if (brainError) {
      logger.error('[Screenshot → Brain] Database insert failed', { error: brainError });
      // Clean up uploaded file
      await bucket.remove([brainFilename]);
      return res.status(500).json({
        success: false,
        error: 'Failed to create Brain document',
        details: brainError.message
      });
    }

    logger.info('[Screenshot → Brain] Brain document created', { 
      brainDocId: brainDoc.id 
    });

    // 6. Update screenshot record
    await query(
      `UPDATE screenshots 
       SET in_brain = TRUE, 
           brain_document_id = $1, 
           sent_to_brain_at = NOW() 
       WHERE id = $2`,
      [brainDoc.id, screenshotId]
    );

    logger.info('[Screenshot → Brain] Success', {
      screenshotId,
      brainDocId: brainDoc.id
    });

    res.json({
      success: true,
      message: 'Screenshot sent to Brain successfully',
      brain_document: {
        id: brainDoc.id,
        title: brainDoc.title,
        file_url: brainDoc.file_url,
        extracted_text: extractedText
      }
    });

  } catch (error) {
    logger.error('[Screenshot → Brain] Error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to send screenshot to Brain',
      details: error.message
    });
  }
});

module.exports = router;
