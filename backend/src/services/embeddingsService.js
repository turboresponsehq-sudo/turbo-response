/**
 * Embeddings Service using OpenAI
 * Generates vector embeddings for text chunks
 */

const OpenAI = require('openai');
const logger = require('../utils/logger');

// Lazy initialization
let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    logger.info('OpenAI embeddings client initialized');
  }
  return openai;
};

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSION = 1536;

/**
 * Generate embedding for a single text
 * @param {String} text - Text to generate embedding for
 * @returns {Array} Embedding vector
 */
const generateEmbedding = async (text) => {
  try {
    const client = getOpenAIClient();
    
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      encoding_format: 'float'
    });

    const embedding = response.data[0].embedding;
    
    logger.info('Embedding generated', { 
      model: EMBEDDING_MODEL,
      dimension: embedding.length,
      tokens: response.usage.total_tokens
    });

    return {
      embedding,
      tokens: response.usage.total_tokens,
      model: EMBEDDING_MODEL
    };
  } catch (error) {
    logger.error('Embedding generation failed', { error: error.message });
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Generate embeddings for multiple texts (batch)
 * @param {Array} texts - Array of texts to generate embeddings for
 * @returns {Array} Array of embeddings
 */
const generateEmbeddings = async (texts) => {
  try {
    const client = getOpenAIClient();
    
    // OpenAI supports batch embedding generation
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
      encoding_format: 'float'
    });

    const embeddings = response.data.map(item => item.embedding);
    
    logger.info('Batch embeddings generated', { 
      count: embeddings.length,
      model: EMBEDDING_MODEL,
      totalTokens: response.usage.total_tokens
    });

    return {
      embeddings,
      tokens: response.usage.total_tokens,
      model: EMBEDDING_MODEL,
      cost: calculateEmbeddingCost(response.usage.total_tokens)
    };
  } catch (error) {
    logger.error('Batch embedding generation failed', { error: error.message });
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
};

/**
 * Calculate embedding cost
 * text-embedding-3-small: $0.02 per 1M tokens
 * @param {Number} tokens - Token count
 * @returns {Number} Cost in USD
 */
const calculateEmbeddingCost = (tokens) => {
  const costPer1MTokens = 0.02;
  return (tokens / 1000000) * costPer1MTokens;
};

/**
 * Generate embedding for search query
 * @param {String} query - Search query text
 * @returns {Array} Query embedding vector
 */
const generateQueryEmbedding = async (query) => {
  const result = await generateEmbedding(query);
  return result.embedding;
};

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  generateQueryEmbedding,
  calculateEmbeddingCost,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSION
};
