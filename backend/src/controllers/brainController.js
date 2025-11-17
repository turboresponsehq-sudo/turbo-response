const pool = require('../config/database');
const logger = require('../utils/logger');
const { storagePut } = require('../services/storage');
const multer = require('multer');
const path = require('path');
const { processDocument } = require('../services/documentProcessor');
const { generateEmbeddings } = require('../services/embeddingsService');
const { upsertVectors, deleteVectorsByDocument } = require('../services/vectorStore');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not supported`));
    }
  }
});

/**
 * Upload document to Brain
 * POST /api/brain/upload
 */
const uploadDocument = async (req, res) => {
  try {
    const {
      title,
      category,
      subcategory,
      tags,
      domain,
      visibility = 'private',
      clientId,
      uploadedBy
    } = req.body;

    // Validate required fields
    if (!title || !category || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, domain'
      });
    }

    // Validate domain
    const validDomains = [
      'consumer-rights',
      'business-client',
      'internal-strategy',
      'legal',
      'marketing',
      'automation',
      'training',
      'industry-specific'
    ];

    if (!validDomains.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: `Invalid domain. Must be one of: ${validDomains.join(', ')}`
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `brain/${domain}/${timestamp}-${sanitizedFilename}`;

    // Upload to S3
    logger.info('Uploading file to S3', { filename: file.originalname, size: file.size });
    const { url: fileUrl } = await storagePut(s3Key, file.buffer, file.mimetype);

    // Parse tags (comma-separated string to array)
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Insert into database
    const query = `
      INSERT INTO brain_documents (
        title,
        filename,
        file_url,
        file_type,
        file_size,
        category,
        subcategory,
        tags,
        domain,
        visibility,
        uploaded_by,
        client_id,
        processing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      title,
      file.originalname,
      fileUrl,
      fileExtension.replace('.', ''),
      file.size,
      category,
      subcategory || null,
      tagsArray,
      domain,
      visibility,
      uploadedBy || 'admin',
      clientId || null,
      'pending'
    ];

    const result = await pool.query(query, values);
    const document = result.rows[0];

    logger.info('Document uploaded successfully', { documentId: document.id, title });

    // Trigger async document processing (don't wait for completion)
    processDocumentAsync(document.id, fileUrl, document.file_type, {
      title: document.title,
      domain: document.domain,
      category: document.category,
      tags: document.tags
    }).catch(error => {
      logger.error('Async document processing failed', { documentId: document.id, error: error.message });
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully. Processing will begin shortly.',
      document
    });

  } catch (error) {
    logger.error('Document upload failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

/**
 * Get all documents with filters
 * GET /api/brain/documents
 */
const getDocuments = async (req, res) => {
  try {
    const {
      domain,
      category,
      tags,
      visibility,
      search,
      status,
      limit = 50,
      offset = 0
    } = req.query;

    let query = 'SELECT * FROM brain_documents WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Apply filters
    if (domain) {
      query += ` AND domain = $${paramCount}`;
      values.push(domain);
      paramCount++;
    }

    if (category) {
      query += ` AND category ILIKE $${paramCount}`;
      values.push(`%${category}%`);
      paramCount++;
    }

    if (tags) {
      const tagsArray = tags.split(',').map(t => t.trim());
      query += ` AND tags && $${paramCount}`;
      values.push(tagsArray);
      paramCount++;
    }

    if (visibility) {
      query += ` AND visibility = $${paramCount}`;
      values.push(visibility);
      paramCount++;
    }

    if (status) {
      query += ` AND processing_status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR filename ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    // Order by newest first
    query += ' ORDER BY created_at DESC';

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM brain_documents WHERE 1=1';
    const countValues = values.slice(0, -2); // Remove limit and offset

    if (domain) countQuery += ' AND domain = $1';
    if (category) countQuery += ` AND category ILIKE $${countValues.indexOf(`%${category}%`) + 1}`;
    if (tags) countQuery += ` AND tags && $${countValues.indexOf(tags.split(',').map(t => t.trim())) + 1}`;
    if (visibility) countQuery += ` AND visibility = $${countValues.indexOf(visibility) + 1}`;
    if (status) countQuery += ` AND processing_status = $${countValues.indexOf(status) + 1}`;
    if (search) countQuery += ` AND (title ILIKE $${countValues.indexOf(`%${search}%`) + 1} OR filename ILIKE $${countValues.indexOf(`%${search}%`) + 1})`;

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      documents: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < total
      }
    });

  } catch (error) {
    logger.error('Failed to fetch documents', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

/**
 * Get single document by ID
 * GET /api/brain/document/:id
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM brain_documents WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Increment access count
    await pool.query(
      'UPDATE brain_documents SET access_count = access_count + 1, last_accessed_at = NOW() WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      document: result.rows[0]
    });

  } catch (error) {
    logger.error('Failed to fetch document', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

/**
 * Update document metadata
 * PUT /api/brain/document/:id
 */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      subcategory,
      tags,
      domain,
      visibility,
      summary
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }

    if (category) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }

    if (subcategory !== undefined) {
      updates.push(`subcategory = $${paramCount}`);
      values.push(subcategory);
      paramCount++;
    }

    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      updates.push(`tags = $${paramCount}`);
      values.push(tagsArray);
      paramCount++;
    }

    if (domain) {
      updates.push(`domain = $${paramCount}`);
      values.push(domain);
      paramCount++;
    }

    if (visibility) {
      updates.push(`visibility = $${paramCount}`);
      values.push(visibility);
      paramCount++;
    }

    if (summary) {
      updates.push(`summary = $${paramCount}`);
      values.push(summary);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);
    const query = `
      UPDATE brain_documents 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    logger.info('Document updated successfully', { documentId: id });

    res.json({
      success: true,
      message: 'Document updated successfully',
      document: result.rows[0]
    });

  } catch (error) {
    logger.error('Failed to update document', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
};

/**
 * Delete document
 * DELETE /api/brain/document/:id
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document info before deleting
    const getQuery = 'SELECT * FROM brain_documents WHERE id = $1';
    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete vectors from Pinecone
    try {
      await deleteVectorsByDocument(parseInt(id));
      logger.info('Vectors deleted from Pinecone', { documentId: id });
    } catch (error) {
      logger.warn('Failed to delete vectors from Pinecone', { documentId: id, error: error.message });
      // Continue with database deletion even if Pinecone deletion fails
    }

    // TODO: Delete file from S3 (future enhancement)

    // Delete from database
    const deleteQuery = 'DELETE FROM brain_documents WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    logger.info('Document deleted successfully', { documentId: id });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete document', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

/**
 * Get Brain statistics
 * GET /api/brain/stats
 */
const getStats = async (req, res) => {
  try {
    // Total documents
    const totalQuery = 'SELECT COUNT(*) as total FROM brain_documents';
    const totalResult = await pool.query(totalQuery);
    const total = parseInt(totalResult.rows[0].total);

    // Documents by domain
    const domainQuery = `
      SELECT domain, COUNT(*) as count 
      FROM brain_documents 
      GROUP BY domain 
      ORDER BY count DESC
    `;
    const domainResult = await pool.query(domainQuery);

    // Documents by status
    const statusQuery = `
      SELECT processing_status, COUNT(*) as count 
      FROM brain_documents 
      GROUP BY processing_status
    `;
    const statusResult = await pool.query(statusQuery);

    // Total storage used
    const storageQuery = 'SELECT SUM(file_size) as total_bytes FROM brain_documents';
    const storageResult = await pool.query(storageQuery);
    const totalBytes = parseInt(storageResult.rows[0].total_bytes || 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

    // Most accessed documents
    const topDocsQuery = `
      SELECT id, title, domain, access_count 
      FROM brain_documents 
      WHERE access_count > 0
      ORDER BY access_count DESC 
      LIMIT 10
    `;
    const topDocsResult = await pool.query(topDocsQuery);

    res.json({
      success: true,
      stats: {
        total,
        byDomain: domainResult.rows,
        byStatus: statusResult.rows,
        storage: {
          totalBytes,
          totalMB: parseFloat(totalMB)
        },
        topDocuments: topDocsResult.rows
      }
    });

  } catch (error) {
    logger.error('Failed to fetch stats', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

/**
 * Async document processing function
 * Extracts text, generates embeddings, and stores in vector database
 */
const processDocumentAsync = async (documentId, fileUrl, fileType, metadata) => {
  try {
    logger.info('Starting document processing', { documentId, fileType });

    // Update status to processing
    await pool.query(
      'UPDATE brain_documents SET processing_status = $1 WHERE id = $2',
      ['processing', documentId]
    );

    // Step 1: Extract text and chunk
    const { text, chunks, totalTokens } = await processDocument(fileUrl, fileType);

    // Update document with extracted text
    await pool.query(
      'UPDATE brain_documents SET content_text = $1 WHERE id = $2',
      [text, documentId]
    );

    logger.info('Text extraction completed', { 
      documentId, 
      chunks: chunks.length,
      totalTokens 
    });

    // Step 2: Generate embeddings for all chunks
    const chunkTexts = chunks.map(c => c.text);
    const { embeddings, tokens, cost } = await generateEmbeddings(chunkTexts);

    logger.info('Embeddings generated', { 
      documentId, 
      embeddings: embeddings.length,
      tokens,
      cost 
    });

    // Step 3: Prepare vectors for Pinecone
    const vectors = embeddings.map((embedding, index) => ({
      id: `doc${documentId}_chunk${index}`,
      values: embedding,
      metadata: {
        document_id: documentId,
        chunk_index: index,
        chunk_text: chunks[index].text.substring(0, 1000), // Store first 1000 chars in metadata
        chunk_tokens: chunks[index].tokens,
        document_title: metadata.title,
        document_domain: metadata.domain,
        document_category: metadata.category,
        document_tags: metadata.tags || []
      }
    }));

    // Step 4: Upsert to Pinecone
    await upsertVectors(vectors);

    logger.info('Vectors upserted to Pinecone', { documentId, vectors: vectors.length });

    // Step 5: Update document status
    await pool.query(
      'UPDATE brain_documents SET processing_status = $1, chunk_count = $2 WHERE id = $3',
      ['completed', chunks.length, documentId]
    );

    logger.info('Document processing completed', { documentId });

  } catch (error) {
    logger.error('Document processing failed', { documentId, error: error.message });

    // Update status to failed
    await pool.query(
      'UPDATE brain_documents SET processing_status = $1 WHERE id = $2',
      ['failed', documentId]
    );

    throw error;
  }
};

module.exports = {
  upload, // Multer middleware
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getStats
};
