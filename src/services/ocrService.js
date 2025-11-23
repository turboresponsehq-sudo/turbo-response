const { createWorker } = require('tesseract.js');
const pdf = require('pdf-parse');
const logger = require('../utils/logger');

/**
 * Extract text from image using Tesseract OCR
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(imageBuffer) {
  try {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    
    return text.trim();
  } catch (error) {
    logger.error('OCR extraction failed', { error: error.message });
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text from PDF
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    const data = await pdf(pdfBuffer);
    return data.text.trim();
  } catch (error) {
    logger.error('PDF text extraction failed', { error: error.message });
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from file based on mime type
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} Extracted text
 */
async function extractText(fileBuffer, mimeType) {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(fileBuffer);
  } else if (mimeType.startsWith('image/')) {
    return await extractTextFromImage(fileBuffer);
  } else {
    throw new Error(`Unsupported file type for OCR: ${mimeType}`);
  }
}

module.exports = {
  extractText,
  extractTextFromImage,
  extractTextFromPDF,
};
