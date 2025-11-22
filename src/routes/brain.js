/**
 * Turbo Brain System Routes
 * 
 * Document upload and management for AI knowledge base
 * Uses Supabase for storage and metadata
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getBrainBucket, getSupabaseDB } = require('../services/supabase/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const accessToken = require('../middleware/accessToken');

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDFs and common document formats
    const allowedMimes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.'));
    }
  }
});

/**
 * GET /api/brain/setup
 * Diagnose and setup Supabase Brain System
 * Creates table and bucket if they don't exist
 */
router.get('/setup', accessToken, async (req, res) => {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        supabase_url: !!process.env.SUPABASE_URL,
        supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      database: { exists: false, error: null },
      storage: { exists: false, error: null },
      actions: []
    };

    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Supabase credentials not configured',
        details: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment',
        results
      });
    }

    const supabase = getSupabaseDB();
    const bucket = getBrainBucket();

    // Check if table exists
    try {
      const { data, error } = await supabase
        .from('brain_documents')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        results.database.exists = false;
        results.database.error = 'Table does not exist';
        results.actions.push('Need to create brain_documents table');
      } else if (error) {
        results.database.error = error.message;
      } else {
        results.database.exists = true;
        results.database.count = data ? data.length : 0;
      }
    } catch (err) {
      results.database.error = err.message;
    }

    // Check if bucket exists
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        results.storage.error = error.message;
      } else {
        const brainBucket = buckets.find(b => b.name === 'brain-docs');
        results.storage.exists = !!brainBucket;
        if (!brainBucket) {
          results.actions.push('Need to create brain-docs storage bucket');
        }
      }
    } catch (err) {
      results.storage.error = err.message;
    }

    // Determine status
    const isReady = results.database.exists && results.storage.exists;
    
    return res.json({
      success: isReady,
      ready: isReady,
      message: isReady 
        ? 'Brain System is fully configured and ready' 
        : 'Brain System requires setup',
      results,
      next_steps: isReady ? [
        'Upload documents via POST /api/brain/upload',
        'List documents via GET /api/brain/list'
      ] : [
        'Run SQL to create brain_documents table in Supabase SQL Editor',
        'Create brain-docs storage bucket in Supabase Dashboard',
        'Re-run this endpoint to verify'
      ],
      sql: !results.database.exists ? `
CREATE TABLE brain_documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  source VARCHAR(50) DEFAULT 'upload',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brain_documents_created_at ON brain_documents(created_at DESC);
CREATE INDEX idx_brain_documents_archived ON brain_documents(is_archived);
      ` : null
    });

  } catch (error) {
    console.error('[Brain Setup] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Setup check failed',
      details: error.message
    });
  }
});

/**
 * POST /api/brain/upload
 * Upload a document to the Brain System
 * 
 * Body (multipart/form-data):
 * - file: PDF or document file
 * - title: Document title (optional, defaults to filename)
 * - description: Document description (optional)
 */
router.post('/upload', accessToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { title, description } = req.body;
    const file = req.file;

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedFilename}`;

    console.log(`[Brain Upload] Uploading ${filename} (${file.size} bytes)`);

    // Upload to Supabase Storage
    const bucket = getBrainBucket();
    const { data: uploadData, error: uploadError } = await bucket.upload(filename, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    });

    if (uploadError) {
      console.error('[Brain Upload] Storage error:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload file to storage',
        details: uploadError.message
      });
    }

    // Get public URL for the file
    const { data: urlData } = bucket.getPublicUrl(filename);
    const fileUrl = urlData.publicUrl;

    console.log(`[Brain Upload] File uploaded to: ${fileUrl}`);

    // Insert metadata into brain_documents table
    const supabase = getSupabaseDB();
    const { data: docData, error: dbError } = await supabase
      .from('brain_documents')
      .insert({
        title: title || file.originalname,
        description: description || null,
        file_url: fileUrl,
        mime_type: file.mimetype,
        size_bytes: file.size,
        source: 'upload'
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Brain Upload] Database error:', dbError);
      // Try to clean up uploaded file
      await bucket.remove([filename]);
      return res.status(500).json({
        success: false,
        error: 'Failed to save document metadata',
        details: dbError.message
      });
    }

    console.log(`[Brain Upload] Document saved: ID ${docData.id}`);

    res.json({
      success: true,
      document: {
        id: docData.id,
        title: docData.title,
        description: docData.description,
        file_url: docData.file_url,
        mime_type: docData.mime_type,
        size_bytes: docData.size_bytes,
        created_at: docData.created_at
      }
    });

  } catch (error) {
    console.error('[Brain Upload] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: error.message
    });
  }
});

/**
 * GET /api/brain/list
 * List all documents in the Brain System
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - archived: Include archived documents (default: false)
 */
router.get('/list', accessToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const includeArchived = req.query.archived === 'true';
    const offset = (page - 1) * limit;

    const supabase = getSupabaseDB();
    
    // Build query
    let query = supabase
      .from('brain_documents')
      .select('*', { count: 'exact' });

    // Filter archived documents
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    // Order by most recent first
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Brain List] Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch documents',
        details: error.message
      });
    }

    res.json({
      success: true,
      documents: data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('[Brain List] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list documents',
      details: error.message
    });
  }
});

module.exports = router;

/**
 * DELETE /api/brain/delete/:id
 * Delete a document from the Brain System
 * 
 * Params:
 * - id: Document ID
 */
router.delete('/delete/:id', accessToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID'
      });
    }

    const supabase = getSupabaseDB();

    // Get document metadata first
    const { data: doc, error: fetchError } = await supabase
      .from('brain_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    console.log(`[Brain Delete] Deleting document ID ${id}: ${doc.title}`);

    // Extract filename from URL
    const urlParts = doc.file_url.split('/');
    const filename = urlParts[urlParts.length - 1];

    // Delete from storage
    const bucket = getBrainBucket();
    const { error: storageError } = await bucket.remove([filename]);

    if (storageError) {
      console.error('[Brain Delete] Storage error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('brain_documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('[Brain Delete] Database error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete document',
        details: dbError.message
      });
    }

    console.log(`[Brain Delete] Document ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Document deleted successfully',
      deleted_id: parseInt(id)
    });

  } catch (error) {
    console.error('[Brain Delete] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Delete failed',
      details: error.message
    });
  }
});

module.exports = router;
