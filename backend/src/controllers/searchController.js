/**
 * Search Controller for Brain Semantic Search
 * Handles vector similarity search queries
 */

const logger = require('../utils/logger');
const { generateQueryEmbedding } = require('../services/embeddingsService');
const { queryVectors } = require('../services/vectorStore');
const pool = require('../config/database');

/**
 * Semantic search in Brain documents
 * POST /api/brain/search
 */
const semanticSearch = async (req, res) => {
  try {
    const {
      query,
      topK = 5,
      domain = null,
      category = null,
      tags = null
    } = req.body;

    // Validate query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    logger.info('Semantic search initiated', { query, topK, domain, category });

    // Step 1: Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);

    // Step 2: Build filter for Pinecone
    const filter = {};
    if (domain) {
      filter.document_domain = domain;
    }
    if (category) {
      filter.document_category = category;
    }
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Pinecone supports array contains filtering
      filter.document_tags = { $in: tags };
    }

    // Step 3: Query Pinecone for similar vectors
    const matches = await queryVectors(queryEmbedding, {
      topK: topK * 2, // Get more results for re-ranking
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      includeMetadata: true
    });

    // Step 4: Format results
    const results = matches.map(match => ({
      documentId: match.metadata.document_id,
      chunkIndex: match.metadata.chunk_index,
      chunkText: match.metadata.chunk_text,
      score: match.score,
      title: match.metadata.document_title,
      domain: match.metadata.document_domain,
      category: match.metadata.document_category,
      tags: match.metadata.document_tags
    }));

    // Step 5: Group by document and get top results
    const documentScores = {};
    results.forEach(result => {
      if (!documentScores[result.documentId]) {
        documentScores[result.documentId] = {
          documentId: result.documentId,
          title: result.title,
          domain: result.domain,
          category: result.category,
          tags: result.tags,
          maxScore: result.score,
          chunks: []
        };
      }
      documentScores[result.documentId].chunks.push({
        chunkIndex: result.chunkIndex,
        chunkText: result.chunkText,
        score: result.score
      });
      // Update max score
      if (result.score > documentScores[result.documentId].maxScore) {
        documentScores[result.documentId].maxScore = result.score;
      }
    });

    // Sort by max score and take top K
    const topDocuments = Object.values(documentScores)
      .sort((a, b) => b.maxScore - a.maxScore)
      .slice(0, topK);

    logger.info('Semantic search completed', { 
      query, 
      resultsCount: topDocuments.length,
      topScore: topDocuments[0]?.maxScore || 0
    });

    res.json({
      success: true,
      query,
      results: topDocuments,
      totalResults: topDocuments.length
    });

  } catch (error) {
    logger.error('Semantic search failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Semantic search failed',
      error: error.message
    });
  }
};

/**
 * Get relevant context for AI prompts
 * POST /api/brain/context
 */
const getRelevantContext = async (req, res) => {
  try {
    const {
      query,
      maxChunks = 3,
      domain = null
    } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);

    // Build filter
    const filter = domain ? { document_domain: domain } : undefined;

    // Query vectors
    const matches = await queryVectors(queryEmbedding, {
      topK: maxChunks,
      filter,
      includeMetadata: true
    });

    // Format context chunks
    const contextChunks = matches.map(match => ({
      text: match.metadata.chunk_text,
      score: match.score,
      source: {
        documentId: match.metadata.document_id,
        title: match.metadata.document_title,
        domain: match.metadata.document_domain
      }
    }));

    // Build combined context string
    const contextText = contextChunks
      .map((chunk, index) => `[Source ${index + 1}: ${chunk.source.title}]\n${chunk.text}`)
      .join('\n\n---\n\n');

    res.json({
      success: true,
      contextText,
      chunks: contextChunks,
      sources: contextChunks.map(c => c.source)
    });

  } catch (error) {
    logger.error('Failed to get relevant context', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get relevant context',
      error: error.message
    });
  }
};

module.exports = {
  semanticSearch,
  getRelevantContext
};
