const { query } = require('../services/database/db');
const { getSupabaseClient } = require('../services/supabase/client');
const logger = require('../utils/logger');

// Create new admin case
const createAdminCase = async (req, res) => {
  try {
    const { title, category, description, client_name, client_email, client_phone } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required'
      });
    }

    const result = await query(
      `INSERT INTO admin_cases (title, category, description, client_name, client_email, client_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, category, description, client_name, client_email, client_phone]
    );

    logger.info('Admin case created', { caseId: result.rows[0].id });

    res.json({
      success: true,
      case: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to create admin case', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to create case'
    });
  }
};

// Get all admin cases
const getAllAdminCases = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM admin_cases ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      cases: result.rows
    });
  } catch (error) {
    logger.error('Failed to get admin cases', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cases'
    });
  }
};

// Get single admin case by ID
const getAdminCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM admin_cases WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    res.json({
      success: true,
      case: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to get admin case', { error: error.message, caseId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve case'
    });
  }
};

// Upload document to admin case
const uploadDocument = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { note } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Verify case exists
    const caseResult = await query(
      `SELECT id FROM admin_cases WHERE id = $1`,
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    // Upload to Supabase storage
    const supabase = getSupabaseClient();
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `case-${caseId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('case-files')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      logger.error('Supabase upload failed', { error: uploadError });
      return res.status(500).json({
        success: false,
        error: 'Failed to upload file to storage'
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('case-files')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Save document metadata to database
    const docResult = await query(
      `INSERT INTO case_documents (case_id, file_key, file_url, file_name, mime_type, file_size, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [caseId, filePath, fileUrl, file.originalname, file.mimetype, file.size, note || null]
    );

    logger.info('Document uploaded', { caseId, documentId: docResult.rows[0].id });

    res.json({
      success: true,
      document: docResult.rows[0]
    });
  } catch (error) {
    logger.error('Failed to upload document', { error: error.message, caseId: req.params.caseId });
    res.status(500).json({
      success: false,
      error: 'Failed to upload document'
    });
  }
};

// Get all documents for a case
const getCaseDocuments = async (req, res) => {
  try {
    const { caseId } = req.params;

    const result = await query(
      `SELECT * FROM case_documents WHERE case_id = $1 ORDER BY uploaded_at DESC`,
      [caseId]
    );

    res.json({
      success: true,
      documents: result.rows
    });
  } catch (error) {
    logger.error('Failed to get case documents', { error: error.message, caseId: req.params.caseId });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve documents'
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    // Get document info
    const docResult = await query(
      `SELECT file_key FROM case_documents WHERE id = $1`,
      [docId]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const fileKey = docResult.rows[0].file_key;

    // Delete from Supabase storage
    const supabase = getSupabaseClient();
    const { error: deleteError } = await supabase.storage
      .from('case-files')
      .remove([fileKey]);

    if (deleteError) {
      logger.error('Supabase delete failed', { error: deleteError });
    }

    // Delete from database
    await query(
      `DELETE FROM case_documents WHERE id = $1`,
      [docId]
    );

    logger.info('Document deleted', { documentId: docId });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete document', { error: error.message, docId: req.params.docId });
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
};

// Delete admin case (cascades to documents)
const deleteAdminCase = async (req, res) => {
  try {
    const { id } = req.params;

    // Get all documents for this case
    const docsResult = await query(
      `SELECT file_key FROM admin_case_documents WHERE case_id = $1`,
      [id]
    );

    // Delete files from Supabase storage
    if (docsResult.rows.length > 0) {
      const supabase = getSupabaseClient();
      const fileKeys = docsResult.rows.map(doc => doc.file_key);
      
      const { error: deleteError } = await supabase.storage
        .from('case-files')
        .remove(fileKeys);

      if (deleteError) {
        logger.error('Supabase bulk delete failed', { error: deleteError });
      }
    }

    // Delete case (CASCADE will delete documents from database)
    const result = await query(
      `DELETE FROM admin_cases WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    logger.info('Admin case deleted', { caseId: id });

    res.json({
      success: true,
      message: 'Case and all associated documents deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete admin case', { error: error.message, caseId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to delete case'
    });
  }
};

module.exports = {
  createAdminCase,
  getAllAdminCases,
  getAdminCaseById,
  uploadDocument,
  getCaseDocuments,
  deleteDocument,
  deleteAdminCase
};
