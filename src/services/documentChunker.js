/**
 * Document Chunking Service
 * 
 * Splits documents into semantic chunks for RAG pipeline
 * Uses sentence-aware splitting with overlap for context preservation
 */

const logger = require('../utils/logger');

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 * @param {string} text - Text to count tokens
 * @returns {number} Estimated token count
 */
function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Split text into sentences
 * @param {string} text - Text to split
 * @returns {string[]} Array of sentences
 */
function splitIntoSentences(text) {
  // Split on sentence boundaries (., !, ?) followed by whitespace
  // Keep the punctuation with the sentence
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  // Handle text without sentence endings
  if (sentences.length === 0 && text.trim().length > 0) {
    return [text.trim()];
  }
  
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Chunk document text into semantic segments
 * @param {string} text - Full document text
 * @param {object} options - Chunking options
 * @param {number} options.maxTokens - Maximum tokens per chunk (default: 800)
 * @param {number} options.overlapTokens - Overlap between chunks (default: 100)
 * @returns {Array<{content: string, tokenCount: number, chunkIndex: number}>}
 */
function chunkDocument(text, options = {}) {
  const {
    maxTokens = 800,
    overlapTokens = 100
  } = options;

  // Clean text
  const cleanedText = text
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')  // Collapse excessive newlines
    .trim();

  if (!cleanedText) {
    logger.warn('Empty text provided for chunking');
    return [];
  }

  // Split into sentences
  const sentences = splitIntoSentences(cleanedText);
  
  if (sentences.length === 0) {
    logger.warn('No sentences found in text');
    return [{
      content: cleanedText,
      tokenCount: estimateTokenCount(cleanedText),
      chunkIndex: 0
    }];
  }

  const chunks = [];
  let currentChunk = '';
  let currentTokens = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceTokens = estimateTokenCount(sentence);

    // If adding this sentence would exceed max tokens, save current chunk
    if (currentTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        tokenCount: currentTokens,
        chunkIndex: chunkIndex++
      });

      // Start new chunk with overlap
      // Include last few sentences for context
      const overlapSentences = [];
      let overlapCount = 0;
      
      for (let j = i - 1; j >= 0 && overlapCount < overlapTokens; j--) {
        const prevSentence = sentences[j];
        const prevTokens = estimateTokenCount(prevSentence);
        
        if (overlapCount + prevTokens <= overlapTokens) {
          overlapSentences.unshift(prevSentence);
          overlapCount += prevTokens;
        } else {
          break;
        }
      }

      currentChunk = overlapSentences.join(' ');
      currentTokens = overlapCount;
    }

    // Add sentence to current chunk
    currentChunk += (currentChunk ? ' ' : '') + sentence;
    currentTokens += sentenceTokens;
  }

  // Add final chunk if not empty
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      tokenCount: currentTokens,
      chunkIndex: chunkIndex
    });
  }

  logger.info('Document chunked successfully', {
    totalSentences: sentences.length,
    totalChunks: chunks.length,
    avgTokensPerChunk: chunks.reduce((sum, c) => sum + c.tokenCount, 0) / chunks.length
  });

  return chunks;
}

/**
 * Chunk document with metadata
 * @param {string} text - Full document text
 * @param {number} documentId - Document ID for reference
 * @param {object} options - Chunking options
 * @returns {Array<{content: string, tokenCount: number, chunkIndex: number, documentId: number}>}
 */
function chunkDocumentWithMetadata(text, documentId, options = {}) {
  const chunks = chunkDocument(text, options);
  
  return chunks.map(chunk => ({
    ...chunk,
    documentId
  }));
}

module.exports = {
  chunkDocument,
  chunkDocumentWithMetadata,
  estimateTokenCount,
  splitIntoSentences
};
