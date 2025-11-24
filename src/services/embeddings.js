/**
 * Embeddings Generation Service
 * 
 * Generates vector embeddings for text using OpenAI text-embedding-3-small
 * Supports batch processing for efficiency
 */

const { chat } = require('./ai/openai');
const logger = require('../utils/logger');

// OpenAI client is already configured in openai.js
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate embedding for a single text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} 1536-dimensional embedding vector
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    });

    const embedding = response.data[0].embedding;
    
    logger.info('Embedding generated', {
      textLength: text.length,
      embeddingDimension: embedding.length
    });

    return embedding;
  } catch (error) {
    logger.error('Embedding generation failed', {
      error: error.message,
      textLength: text.length
    });
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to embed
 * @param {number} batchSize - Maximum texts per API call (default: 100)
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
async function generateEmbeddingsBatch(texts, batchSize = 100) {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    const allEmbeddings = [];
    
    // Process in batches to respect API limits
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      logger.info('Generating embeddings batch', {
        batchStart: i,
        batchSize: batch.length,
        totalTexts: texts.length
      });

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
        encoding_format: 'float'
      });

      const batchEmbeddings = response.data.map(item => item.embedding);
      allEmbeddings.push(...batchEmbeddings);
    }

    logger.info('Batch embeddings generated successfully', {
      totalTexts: texts.length,
      totalEmbeddings: allEmbeddings.length
    });

    return allEmbeddings;
  } catch (error) {
    logger.error('Batch embedding generation failed', {
      error: error.message,
      textsCount: texts.length
    });
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
}

/**
 * Generate embeddings for document chunks
 * @param {Array<{content: string, chunkIndex: number}>} chunks - Document chunks
 * @returns {Promise<Array<{content: string, chunkIndex: number, embedding: number[]}>>}
 */
async function generateChunkEmbeddings(chunks) {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  try {
    const texts = chunks.map(chunk => chunk.content);
    const embeddings = await generateEmbeddingsBatch(texts);

    const chunksWithEmbeddings = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index]
    }));

    logger.info('Chunk embeddings generated', {
      totalChunks: chunks.length,
      embeddingDimension: embeddings[0].length
    });

    return chunksWithEmbeddings;
  } catch (error) {
    logger.error('Chunk embedding generation failed', {
      error: error.message,
      chunksCount: chunks.length
    });
    throw new Error(`Failed to generate chunk embeddings: ${error.message}`);
  }
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  generateChunkEmbeddings
};
