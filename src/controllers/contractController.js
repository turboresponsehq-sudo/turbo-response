const { query } = require('../services/database/db');

/**
 * Sign contract for a case
 * POST /api/case/:id/sign-contract
 */
exports.signContract = async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);
    const {
      clientName,
      clientEmail,
      agreementText,
      acknowledgments
    } = req.body;

    // Validation
    if (!clientName || !clientEmail || !agreementText) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: clientName, clientEmail, agreementText'
      });
    }

    // Validate all 6 acknowledgments are checked
    if (!acknowledgments || acknowledgments.length !== 6 || !acknowledgments.every(Boolean)) {
      return res.status(400).json({
        success: false,
        message: 'All 6 acknowledgments must be checked'
      });
    }

    // Get client IP address
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     'unknown';

    // Check if case exists
    const caseCheck = await query(
      'SELECT id, email FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if contract already signed
    const existingContract = await query(
      'SELECT id FROM client_contracts WHERE case_id = $1',
      [caseId]
    );

    if (existingContract.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Contract already signed for this case'
      });
    }

    // Insert contract signature
    const contractResult = await query(
      `INSERT INTO client_contracts 
       (case_id, client_email, client_name, ip_address, agreement_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, signed_at`,
      [caseId, clientEmail, clientName, ipAddress, agreementText]
    );

    // Update case to mark contract as signed
    await query(
      'UPDATE cases SET contract_signed = TRUE WHERE id = $1',
      [caseId]
    );

    res.json({
      success: true,
      message: 'Contract signed successfully',
      data: {
        contractId: contractResult.rows[0].id,
        signedAt: contractResult.rows[0].signed_at
      }
    });

  } catch (error) {
    console.error('Error signing contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign contract',
      error: error.message
    });
  }
};

/**
 * Get signed contract for a case
 * GET /api/case/:id/contract
 */
exports.getContract = async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);

    const result = await query(
      `SELECT 
        id,
        case_id,
        client_email,
        client_name,
        ip_address,
        signed_at,
        agreement_text
       FROM client_contracts
       WHERE case_id = $1
       ORDER BY signed_at DESC
       LIMIT 1`,
      [caseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No signed contract found for this case'
      });
    }

    const contract = result.rows[0];

    // Generate PDF
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Contract-${caseId}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc.fontSize(20).text('CLIENT SERVICE CONTRACT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Contract Date: ${new Date(contract.signed_at).toLocaleDateString()}`);
    doc.text(`Client Name: ${contract.client_name}`);
    doc.text(`Client Email: ${contract.client_email}`);
    doc.text(`Case ID: ${caseId}`);
    doc.text(`IP Address: ${contract.ip_address}`);
    doc.moveDown();
    doc.fontSize(10).text(contract.agreement_text, { align: 'left' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Electronic Signature: ${contract.client_name}`);
    doc.text(`Signed At: ${new Date(contract.signed_at).toLocaleString()}`);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contract',
      error: error.message
    });
  }
};

/**
 * Check if contract is signed for a case
 * GET /api/case/:id/contract-status
 */
exports.getContractStatus = async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);

    const result = await query(
      'SELECT contract_signed FROM cases WHERE id = $1',
      [caseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.json({
      success: true,
      contractSigned: result.rows[0].contract_signed || false
    });

  } catch (error) {
    console.error('Error checking contract status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check contract status',
      error: error.message
    });
  }
};
