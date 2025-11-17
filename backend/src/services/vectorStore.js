/**
 * Vector Store Service using PostgreSQL JSON Storage
 * Handles vector embeddings storage and semantic search for Brain Upload System
 */

const pool = require('../config/database');
const logger = require('../utils/logger');

const EMBEDDING_DIMENSION = 1536; // text-embedding-3-small dimension

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {Number} Cosine similarity score (0-1)
 */
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
};

/**
 * Upsert vectors to PostgreSQL
 * @param {Array} vectors - Array of {id, values, metadata}
 */
const upsertVectors = async (vectors) => {
  try {
    const client = await pool.getConnection();

    try {
      for (const vector of vectors) {
        const { id, values, metadata } = vector;

        // Extract document_id and chunk_index from id (format: doc{id}_chunk{index})
        const match = id.match(/doc(\d+)_chunk(\d+)/);
        if (!match) {
          logger.warn('Invalid vector ID format', { id });
          continue;
        }

        const documentId = parseInt(match[1]);
        const chunkIndex = parseInt(match[2]);

        // Insert or update embedding
        const query = `
          INSERT INTO brain_embeddings (
            document_id,
            chunk_index,
            chunk_text,
            chunk_tokens,
            embedding,
            document_title,
            document_domain,
            document_category,
            document_tags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            chunk_text = VALUES(chunk_text),
            chunk_tokens = VALUES(chunk_tokens),
            embedding = VALUES(embedding),
            document_title = VALUES(document_title),
            document_domain = VALUES(document_domain),
            document_category = VALUES(document_category),
            document_tags = VALUES(document_tags)
        `;

        const values_arr = [
          documentId,
          chunkIndex,
          metadata.chunk_text || '',
          metadata.chunk_tokens || 0,
          JSON.stringify(values),
          metadata.document_title || '',
          metadata.document_domain || '',
          metadata.document_category || '',
          metadata.document_tags ? metadata.document_tags.join(',') : ''
        ];

        await client.query(query, values_arr);
      }

      logger.info('Vectors upserted successfully', { count: vectors.length });
      return { success: true, count: vectors.length };
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Failed to upsert vectors', { error: error.message });
    throw error;
  }
};

/**
 * Query vectors by similarity
 * @param {Array} queryVector - Query embedding vector
 * @param {Object} options - Query options
 * @returns {Array} Similar vectors with metadata
 */
const queryVectors = async (queryVector, options = {}) => {
  try {
    const {
      topK = 5,
      filter = {},
      includeMetadata = true
    } = options;

    // Build WHERE clause for filters
    const whereClauses = [];
    const whereValues = [];

    if (filter.document_domain) {
      whereClauses.push('document_domain = ?');
      whereValues.push(filter.document_domain);
    }

    if (filter.document_category) {
      whereClauses.push('document_category = ?');
      whereValues.push(filter.document_category);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Fetch all embeddings (with filters)
    const query = `
      SELECT 
        id,
        document_id,
        chunk_index,
        chunk_text,
        chunk_tokens,
        embedding,
        document_title,
        document_domain,
        document_category,
        document_tags
      FROM brain_embeddings
      ${whereClause}
    `;

    const client = await pool.getConnection();
    let results;
    
    try {
      results = await client.query(query, whereValues);
    } finally {
      client.release();
    }

    // Calculate similarity for each vector
    const similarities = results.map(row => {
      const embedding = JSON.parse(row.embedding);
      const similarity = cosineSimilarity(queryVector, embedding);

      return {
        id: `doc${row.document_id}_chunk${row.chunk_index}`,
        score: similarity,
        metadata: includeMetadata ? {
          document_id: row.document_id,
          chunk_index: row.chunk_index,
          chunk_text: row.chunk_text,
          chunk_tokens: row.chunk_tokens,
          document_title: row.document_title,
          document_domain: row.document_domain,
          document_category: row.document_category,
          document_tags: row.document_tags ? row.document_tags.split(',') : []
        } : undefined
      };
    });

    // Sort by similarity (descending) and take top K
    const topResults = similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    logger.info('Vector query completed', { 
      topK, 
      totalVectors: results.length,
      resultsCount: topResults.length 
    });

    return topResults;
  } catch (error) {
    logger.error('Failed to query vectors', { error: error.message });
    throw error;
  }
};

/**
 * Delete vectors by document ID
 * @param {Number} documentId - Document ID to delete vectors for
 */
const deleteVectorsByDocument = async (documentId) => {
  try {
    const query = 'DELETE FROM brain_embeddings WHERE document_id = ?';
    
    const client = await pool.getConnection();
    try {
      await client.query(query, [documentId]);
    } finally {
      client.release();
    }
    
    logger.info('Vectors deleted successfully', { documentId });
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete vectors', { error: error.message });
    throw error;
  }
};

/**
 * Get index stats
 */
const getIndexStats = async () => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_vectors,
        COUNT(DISTINCT document_id) as total_documents
      FROM brain_embeddings
    `;
    
    const client = await pool.getConnection();
    let result;
    
    try {
      const results = await client.query(query);
      result = results[0];
    } finally {
      client.release();
    }

    return {
      totalVectors: parseInt(result.total_vectors) || 0,
      totalDocuments: parseInt(result.total_documents) || 0,
      dimension: EMBEDDING_DIMENSION
    };
  } catch (error) {
    logger.error('Failed to get index stats', { error: error.message });
    throw error;
  }
};

/**
 * Initialize (no-op for PostgreSQL, kept for API compatibility)
 */
const initializePinecone = async () => {
  // No initialization needed for PostgreSQL
  logger.info('PostgreSQL vector store ready');
  return true;
};

module.exports = {
  initializePinecone, // Kept for API compatibility
  upsertVectors,
  queryVectors,
  deleteVectorsByDocument,
  getIndexStats,
  cosineSimilarity,
  DIMENSION: EMBEDDING_DIMENSION
};
