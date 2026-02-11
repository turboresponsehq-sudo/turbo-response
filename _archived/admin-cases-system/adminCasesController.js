const db = require('../services/database/db');

// CREATE CASE
async function createAdminCase(req, res) {
  try {
    const { title, category, description, client_name, client_email, client_phone } = req.body;

    const result = await db.query(
      `INSERT INTO admin_cases (title, category, description, client_name, client_email, client_phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, category, description, client_name, client_email, client_phone]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET ALL CASES
async function getAllAdminCases(req, res) {
  try {
    const result = await db.query(`SELECT * FROM admin_cases ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET 1 CASE
async function getAdminCaseById(req, res) {
  try {
    const result = await db.query(
      `SELECT * FROM admin_cases WHERE id = $1`,
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE CASE
async function deleteAdminCase(req, res) {
  try {
    await db.query(`DELETE FROM admin_cases WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// UPLOAD DOCUMENT
async function uploadDocument(req, res) {
  try {
    const file = req.file;

    const result = await db.query(
      `INSERT INTO admin_case_documents 
       (case_id, file_key, file_url, file_name, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.params.caseId,
        file.originalname,
        `/uploads/${file.originalname}`,
        file.originalname,
        file.mimetype,
        file.size
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET DOCUMENTS
async function getCaseDocuments(req, res) {
  try {
    const result = await db.query(
      `SELECT * FROM admin_case_documents WHERE case_id = $1 ORDER BY uploaded_at DESC`,
      [req.params.caseId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE DOCUMENT
async function deleteDocument(req, res) {
  try {
    await db.query(`DELETE FROM admin_case_documents WHERE id = $1`, [req.params.docId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createAdminCase,
  getAllAdminCases,
  getAdminCaseById,
  uploadDocument,
  getCaseDocuments,
  deleteDocument,
  deleteAdminCase
};
