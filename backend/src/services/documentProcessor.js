/**
 * Document Processing Service
 * Handles text extraction, chunking, and embedding generation for Brain Upload System
 */

const pdfParse = require('pdf-parse');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Extract text from PDF file
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {String} Extracted text
 */
const extractTextFromPDF = async (fileBuffer) => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    logger.error('PDF text extraction failed', { error: error.message });
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Extract text from plain text file
 * @param {Buffer} fileBuffer - Text file buffer
 * @returns {String} Extracted text
 */
const extractTextFromTxt = (fileBuffer) => {
  return fileBuffer.toString('utf-8');
};

/**
 * Extract text from document based on file type
 * @param {String} fileUrl - URL to the file
 * @param {String} fileType - File type (pdf, txt, etc.)
 * @returns {String} Extracted text
 */
const extractText = async (fileUrl, fileType) => {
  try {
    // Download file
    logger.info('Downloading file for text extraction', { fileUrl, fileType });
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);

    let text = '';

    switch (fileType.toLowerCase()) {
      case 'pdf':
        text = await extractTextFromPDF(fileBuffer);
        break;
      
      case 'txt':
        text = extractTextFromTxt(fileBuffer);
        break;
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    logger.info('Text extraction successful', { 
      fileType, 
      textLength: text.length,
      wordCount: text.split(/\s+/).length
    });

    return text;
  } catch (error) {
    logger.error('Text extraction failed', { error: error.message, fileUrl, fileType });
    throw error;
  }
};

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 * @param {String} text - Text to count tokens for
 * @returns {Number} Estimated token count
 */
const estimateTokenCount = (text) => {
  return Math.ceil(text.length / 4);
};

/**
 * Chunk text into overlapping segments
 * @param {String} text - Text to chunk
 * @param {Object} options - Chunking options
 * @returns {Array} Array of text chunks
 */
const chunkText = (text, options = {}) => {
  const {
    chunkSize = 1000, // tokens per chunk
    overlap = 200,     // token overlap between chunks
  } = options;

  // Convert tokens to approximate characters
  const chunkChars = chunkSize * 4;
  const overlapChars = overlap * 4;

  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkChars, text.length);
    const chunk = text.substring(startIndex, endIndex);
    
    // Only add non-empty chunks
    if (chunk.trim().length > 0) {
      chunks.push({
        text: chunk.trim(),
        tokens: estimateTokenCount(chunk),
        startIndex,
        endIndex
      });
    }

    // Move forward by (chunkSize - overlap)
    startIndex += (chunkChars - overlapChars);
    
    // Prevent infinite loop
    if (startIndex >= text.length) break;
  }

  logger.info('Text chunking completed', { 
    totalChunks: chunks.length,
    avgTokensPerChunk: chunks.length > 0 ? Math.round(chunks.reduce((sum, c) => sum + c.tokens, 0) / chunks.length) : 0
  });

  return chunks;
};

/**
 * Process document: extract text and create chunks
 * @param {String} fileUrl - URL to the file
 * @param {String} fileType - File type
 * @param {Object} chunkOptions - Chunking options
 * @returns {Object} { text, chunks }
 */
const processDocument = async (fileUrl, fileType, chunkOptions = {}) => {
  try {
    // Extract text
    const text = await extractText(fileUrl, fileType);

    // Chunk text
    const chunks = chunkText(text, chunkOptions);

    return {
      text,
      chunks,
      totalTokens: estimateTokenCount(text)
    };
  } catch (error) {
    logger.error('Document processing failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  extractText,
  extractTextFromPDF,
  extractTextFromTxt,
  chunkText,
  estimateTokenCount,
  processDocument
};
