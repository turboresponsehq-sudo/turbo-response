const { query } = require('../services/database/db');

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

    res.json({
      success: true,
      cases: result.rows
    });
  } catch (error) {
    console.error('❌ Error loading admin cases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load admin cases',
      detail: error.message
    });
  }
}

module.exports = { getAllAdminCases };
