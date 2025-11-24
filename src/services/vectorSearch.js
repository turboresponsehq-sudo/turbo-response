/**
 * Vector Search Service
 * 
 * Performs semantic similarity search using pgvector
 * Stores and retrieves document chunk embeddings
 */

const { getSupabaseDB } = require('./supabase/client');
const logger = require('../utils/logger');

/**
 * Store chunk embeddings in database
 * @param {number} documentId - Document ID
 * @param {Array<{content: string, chunkIndex: number, tokenCount: number, embedding: number[]}>} chunks - Chunks with embeddings
 * @returns {Promise<number>} Number of chunks stored
 */
async function storeChunkEmbeddings(documentId, chunks) {
  try {
    const supabase = getSupabaseDB();
    
    // Prepare chunk records for insertion
    const chunkRecords = chunks.map(chunk => ({
      document_id: documentId,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: JSON.stringify(chunk.embedding),  // pgvector expects array as string
      token_count: chunk.tokenCount
    }));

    // Insert chunks in batch
    const { data, error } = await supabase
      .from('brain_chunks')
      .insert(chunkRecords)
      .select('id');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    logger.info('Chunk embeddings stored', {
      documentId,
      chunksStored: data.length
    });

    return data.length;
  } catch (error) {
    logger.error('Failed to store chunk embeddings', {
      error: error.message,
      documentId,
      chunksCount: chunks.length
    });
    throw new Error(`Failed to store chunk embeddings: ${error.message}`);
  }
}

/**
 * Search for similar chunks using vector similarity
 * @param {number[]} queryEmbedding - Query embedding vector
 * @param {object} options - Search options
 * @param {number} options.topK - Number of results to return (default: 5)
 * @param {number} options.minScore - Minimum similarity score 0-1 (default: 0.7)
 * @param {number[]} options.documentIds - Filter by specific document IDs (optional)
 * @returns {Promise<Array<{chunkId: number, documentId: number, content: string, score: number, chunkIndex: number}>>}
 */
async function searchSimilarChunks(queryEmbedding, options = {}) {
  const {
    topK = 5,
    minScore = 0.7,
    documentIds = null
  } = options;

  try {
    const supabase = getSupabaseDB();
    
    // Convert embedding to pgvector format
    const embeddingStr = JSON.stringify(queryEmbedding);

    // Build query with cosine similarity
    // Note: pgvector uses <=> operator for cosine distance (lower is better)
    // We convert to similarity score: 1 - distance
    let query = supabase
      .from('brain_chunks')
      .select(`
        id,
        document_id,
        content,
        chunk_index,
        embedding
      `)
      .order('embedding', { ascending: true });  // This will be replaced by RPC call

    // Use RPC function for vector similarity search
    // This is more efficient than client-side filtering
    const { data, error } = await supabase.rpc('search_brain_chunks', {
      query_embedding: embeddingStr,
      match_count: topK * 2,  // Get more results to filter by score
      filter_document_ids: documentIds
    });

    if (error) {
      // Fallback: If RPC function doesn't exist, use direct query
      logger.warn('RPC search function not found, using fallback query', {
        error: error.message
      });
      
      const fallbackQuery = supabase
        .from('brain_chunks')
        .select('*')
        .limit(topK);

      if (documentIds && documentIds.length > 0) {
        fallbackQuery.in('document_id', documentIds);
      }

      const fallbackResult = await fallbackQuery;
      
      if (fallbackResult.error) {
        throw new Error(`Database error: ${fallbackResult.error.message}`);
      }

      // Calculate cosine similarity manually
      const results = fallbackResult.data.map(chunk => {
        const chunkEmbedding = JSON.parse(chunk.embedding);
        const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
        
        return {
          chunkId: chunk.id,
          documentId: chunk.document_id,
          content: chunk.content,
          score: similarity,
          chunkIndex: chunk.chunk_index
        };
      });

      // Filter by min score and sort
      const filteredResults = results
        .filter(r => r.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      logger.info('Vector search completed (fallback)', {
        totalResults: filteredResults.length,
        topScore: filteredResults[0]?.score || 0
      });

      return filteredResults;
    }

    // Process RPC results
    const results = data
      .map(chunk => ({
        chunkId: chunk.id,
        documentId: chunk.document_id,
        content: chunk.content,
        score: 1 - chunk.distance,  // Convert distance to similarity
        chunkIndex: chunk.chunk_index
      }))
      .filter(r => r.score >= minScore)
      .slice(0, topK);

    logger.info('Vector search completed', {
      totalResults: results.length,
      topScore: results[0]?.score || 0
    });

    return results;
  } catch (error) {
    logger.error('Vector search failed', {
      error: error.message,
      topK,
      minScore
    });
    throw new Error(`Vector search failed: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Similarity score 0-1
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same dimension');
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
}

/**
 * Delete all chunks for a document
 * @param {number} documentId - Document ID
 * @returns {Promise<number>} Number of chunks deleted
 */
async function deleteDocumentChunks(documentId) {
  try {
    const supabase = getSupabaseDB();

    const { data, error } = await supabase
      .from('brain_chunks')
      .delete()
      .eq('document_id', documentId)
      .select('id');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    logger.info('Document chunks deleted', {
      documentId,
      chunksDeleted: data.length
    });

    return data.length;
  } catch (error) {
    logger.error('Failed to delete document chunks', {
      error: error.message,
      documentId
    });
    throw new Error(`Failed to delete document chunks: ${error.message}`);
  }
}

module.exports = {
  storeChunkEmbeddings,
  searchSimilarChunks,
  cosineSimilarity,
  deleteDocumentChunks
};
