const { query } = require('../services/database/db');
const logger = require('../utils/logger');

/**
 * Get all admin cases (used by /admin dashboard)
 */
async function getAllAdminCases(req, res) {
  try {
    const result = await query(`
      SELECT
        id,
        title,
        category,
        status,
        description,
        client_name,
        client_email,
        client_phone,
        created_at,
        updated_at
      FROM admin_cases
      ORDER BY created_at DESC;
    `);

    return res.json({
      success: true,
      cases: result.rows,
    });
  } catch (error) {
    logger.error('Error loading admin cases:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load admin cases',
      detail: error.message,
    });
  }
}

/**
 * Create a new admin case
 */
async function createAdminCase(req, res) {
  try {
    const {
      title,
      category,
      status,
      description,
      clientName,
      clientEmail,
      clientPhone,
      client_name,
      client_email,
      client_phone,
    } = req.body;

    const finalClientName = client_name || clientName || null;
    const finalClientEmail = client_email || clientEmail || null;
    const finalClientPhone = client_phone || clientPhone || null;
    const finalStatus = status || 'active';

    const result = await query(
      `
      INSERT INTO admin_cases (
        title,
        category,
        status,
        description,
        client_name,
        client_email,
        client_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        title,
        category,
        status,
        description,
        client_name,
        client_email,
        client_phone,
        created_at,
        updated_at;
    `,
      [
        title,
        category,
        finalStatus,
        description || null,
        finalClientName,
        finalClientEmail,
        finalClientPhone,
      ]
    );

    return res.status(201).json({
      success: true,
      case: result.rows[0],
    });
  } catch (error) {
    logger.error('Error creating admin case:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create admin case',
      detail: error.message,
    });
  }
}

/**
 * Get single admin case by ID
 */
async function getAdminCaseById(req, res) {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        id,
        title,
        category,
        status,
        description,
        client_name,
        client_email,
        client_phone,
        created_at,
        updated_at
      FROM admin_cases
      WHERE id = $1;
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found',
      });
    }

    return res.json({
      success: true,
      case: result.rows[0],
    });
  } catch (error) {
    logger.error('Error fetching admin case by id:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load case',
      detail: error.message,
    });
  }
}

/**
 * Upload a document for a case
 * (uses multer memoryStorage in the route)
 */
async function uploadDocument(req, res) {
  try {
    const { caseId } = req.params;
    const file = req.file;
    const { note } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Simple placeholder file_key / file_url so DB insert works.
    const fileKey = `${Date.now()}-${file.originalname}`;
    const fileUrl = `/uploads/${fileKey}`;

    const result = await query(
      `
      INSERT INTO admin_case_documents (
        case_id,
        file_key,
        file_url,
        file_name,
        mime_type,
        file_size,
        note
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        case_id,
        file_key,
        file_url,
        file_name,
        mime_type,
        file_size,
        note,
        uploaded_at;
    `,
      [
        caseId,
        fileKey,
        fileUrl,
        file.originalname,
        file.mimetype,
        file.size,
        note || null,
      ]
    );

    return res.status(201).json({
      success: true,
      document: result.rows[0],
    });
  } catch (error) {
    logger.error('Error uploading admin case document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload document',
      detail: error.message,
    });
  }
}

/**
 * Get documents for a case
 */
async function getCaseDocuments(req, res) {
  try {
    const { caseId } = req.params;

    const result = await query(
      `
      SELECT
        id,
        case_id,
        file_key,
        file_url,
        file_name,
        mime_type,
        file_size,
        note,
        uploaded_at
      FROM admin_case_documents
      WHERE case_id = $1
      ORDER BY uploaded_at DESC;
    `,
      [caseId]
    );

    return res.json({
      success: true,
      documents: result.rows,
    });
  } catch (error) {
    logger.error('Error loading admin case documents:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load documents',
      detail: error.message,
    });
  }
}

/**
 * Delete a document
 */
async function deleteDocument(req, res) {
  try {
    const { docId } = req.params;

    const result = await query(
      `
      DELETE FROM admin_case_documents
      WHERE id = $1
      RETURNING id;
    `,
      [docId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    return res.json({
      success: true,
      deletedId: docId,
    });
  } catch (error) {
    logger.error('Error deleting admin case document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete document',
      detail: error.message,
    });
  }
}

/**
 * Delete a case (and its documents via FK cascade)
 */
async function deleteAdminCase(req, res) {
  try {
    const { id } = req.params;

    const result = await query(
      `
      DELETE FROM admin_cases
      WHERE id = $1
      RETURNING id;
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found',
      });
    }

    return res.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    logger.error('Error deleting admin case:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete case',
      detail: error.message,
    });
  }
}

module.exports = {
  createAdminCase,
  getAllAdminCases,
  getAdminCaseById,
  uploadDocument,
  getCaseDocuments,
  deleteDocument,
  deleteAdminCase,
};

