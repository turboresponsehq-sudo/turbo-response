/**
 * PDF Text Extraction Service
 * 
 * Extracts text content from PDF files for RAG pipeline
 * Uses pdf-parse library for robust PDF parsing
 */

const pdfParse = require('pdf-parse');
const logger = require('../utils/logger');

/**
 * Extract text from PDF buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<{text: string, pages: number, metadata: object}>}
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    
    logger.info('PDF text extracted successfully', {
      pages: data.numpages,
      textLength: data.text.length,
      hasMetadata: !!data.info
    });

    return {
      text: data.text,
      pages: data.numpages,
      metadata: data.info || {}
    };
  } catch (error) {
    logger.error('PDF text extraction failed', {
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from PDF file URL (download and parse)
 * @param {string} fileUrl - Public URL to PDF file
 * @returns {Promise<{text: string, pages: number, metadata: object}>}
 */
async function extractTextFromPDFUrl(fileUrl) {
  try {
    // Download PDF from URL
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download PDF: HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    return await extractTextFromPDF(pdfBuffer);
  } catch (error) {
    logger.error('PDF URL extraction failed', {
      url: fileUrl,
      error: error.message
    });
    throw new Error(`Failed to extract text from PDF URL: ${error.message}`);
  }
}

/**
 * Validate if buffer is a valid PDF
 * @param {Buffer} buffer - File buffer
 * @returns {boolean}
 */
function isPDF(buffer) {
  // PDF files start with %PDF-
  const pdfSignature = Buffer.from('%PDF-');
  return buffer.slice(0, 5).equals(pdfSignature);
}

module.exports = {
  extractTextFromPDF,
  extractTextFromPDFUrl,
  isPDF
};
