const { query } = require('../services/database/db');
const { extractText } = require('../services/ocrService');
const { detectCaseType, extractStructuredData } = require('../services/aiCaseDetection');
const { storagePut } = require('../../server/storage');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Upload case document with OCR and AI detection
 */
async function uploadCaseDocument(req, res) {
  try {
    const { caseType, description, caseId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    logger.info('Processing case document upload', {
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      caseType,
      caseId
    });

    // Generate unique file key
    const fileExt = file.originalname.split('.').pop();
    const fileKey = `case-documents/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;

    // Upload to S3
    const { url: fileUrl } = await storagePut(fileKey, file.buffer, file.mimetype);

    // Extract text using OCR
    let textContent = '';
    try {
      textContent = await extractText(file.buffer, file.mimetype);
      logger.info('OCR extraction successful', {
        textLength: textContent.length,
        fileName: file.originalname
      });
    } catch (ocrError) {
      logger.warn('OCR extraction failed, continuing without text', {
        error: ocrError.message,
        fileName: file.originalname
      });
    }

    // AI case type detection if not provided
    let finalCaseType = caseType;
    let extractedData = {};

    if (!caseType && textContent) {
      const detection = await detectCaseType(textContent);
      finalCaseType = detection.caseType;
      extractedData = detection.extractedData;
      
      logger.info('AI case type detection completed', {
        detectedType: finalCaseType,
        confidence: detection.confidence
      });
    } else if (caseType && textContent) {
      // Extract structured data for known case type
      extractedData = await extractStructuredData(textContent, caseType);
    }

    // Insert into database
    const result = await query(
      `INSERT INTO case_documents (
        case_id, case_type, file_url, file_name, mime_type, 
        size_bytes, description, text_content, extracted_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        caseId || null,
        finalCaseType || 'General Evidence',
        fileUrl,
        file.originalname,
        file.mimetype,
        file.size,
        description || null,
        textContent || null,
        JSON.stringify(extractedData)
      ]
    );

    const document = result.rows[0];

    logger.info('Case document uploaded successfully', {
      documentId: document.id,
      caseType: document.case_type,
      fileName: document.file_name
    });

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        case_id: document.case_id,
        case_type: document.case_type,
        file_url: document.file_url,
        file_name: document.file_name,
        mime_type: document.mime_type,
        size_bytes: document.size_bytes,
        description: document.description,
        extracted_data: document.extracted_data,
        created_at: document.created_at
      }
    });
  } catch (error) {
    logger.error('Case document upload failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to upload document',
      message: error.message
    });
  }
}

/**
 * Get all case documents, optionally filtered by case type
 */
async function getCaseDocuments(req, res) {
  try {
    const { caseType, caseId } = req.query;

    let queryText = 'SELECT * FROM case_documents WHERE 1=1';
    const params = [];

    if (caseType) {
      params.push(caseType);
      queryText += ` AND case_type = $${params.length}`;
    }

    if (caseId) {
      params.push(caseId);
      queryText += ` AND case_id = $${params.length}`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    res.status(200).json({
      success: true,
      documents: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch case documents', {
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to fetch documents',
      message: error.message
    });
  }
}

/**
 * Get documents grouped by case type
 */
async function getDocumentsByType(req, res) {
  try {
    const result = await query(`
      SELECT 
        case_type,
        COUNT(*) as document_count,
        MAX(created_at) as last_upload
      FROM case_documents
      GROUP BY case_type
      ORDER BY document_count DESC
    `);

    res.status(200).json({
      success: true,
      caseTypes: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch documents by type', {
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to fetch documents by type',
      message: error.message
    });
  }
}

/**
 * Delete case document
 */
async function deleteCaseDocument(req, res) {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM case_documents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    logger.info('Case document deleted', {
      documentId: id,
      fileName: result.rows[0].file_name
    });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete case document', {
      error: error.message,
      documentId: req.params.id
    });

    res.status(500).json({
      error: 'Failed to delete document',
      message: error.message
    });
  }
}

module.exports = {
  uploadCaseDocument,
  getCaseDocuments,
  getDocumentsByType,
  deleteCaseDocument,
};
