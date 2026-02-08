const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');

// GET /api/debug/cases/:email - Check cases for an email
router.get('/debug/cases/:email', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, case_number, full_name, email, category, created_at FROM cases WHERE email = $1 ORDER BY id DESC',
      [req.params.email]
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      cases: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/debug/login-test/:caseNumber/:email - Test login query
router.get('/debug/login-test/:caseNumber/:email', async (req, res) => {
  try {
    const { caseNumber, email } = req.params;
    const emailLower = email.toLowerCase();
    
    const result = await query(
      'SELECT id, case_number, email, portal_enabled FROM cases WHERE case_number = $1 AND email = $2',
      [caseNumber, emailLower]
    );
    
    res.json({
      success: true,
      query: {
        case_number: caseNumber,
        email: emailLower,
        sql: 'SELECT id, case_number, email, portal_enabled FROM cases WHERE case_number = $1 AND email = $2'
      },
      found: result.rows.length > 0,
      count: result.rows.length,
      case: result.rows[0] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/debug/case-full/:id - Get full case data by ID
router.get('/debug/case-full/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM cases WHERE id = $1',
      [req.params.id]
    );
    
    const caseData = result.rows[0];
    let caseNumberAnalysis = null;
    
    if (caseData && caseData.case_number) {
      const cn = caseData.case_number;
      caseNumberAnalysis = {
        value: cn,
        length: cn.length,
        charCodes: Array.from(cn).map(c => c.charCodeAt(0)),
        trimmed: cn.trim(),
        trimmedLength: cn.trim().length
      };
    }
    
    res.json({
      success: true,
      found: result.rows.length > 0,
      case: caseData || null,
      caseNumberAnalysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/debug/all-cases - List all case numbers
router.get('/debug/all-cases', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, case_number, email, full_name, category, portal_enabled FROM cases ORDER BY id'
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      cases: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/debug/schema/:tableName - Check if table exists and get schema
router.get('/debug/schema/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    const result = await query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns 
       WHERE table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    );
    
    res.json({
      success: true,
      table: tableName,
      exists: result.rows.length > 0,
      columns: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
