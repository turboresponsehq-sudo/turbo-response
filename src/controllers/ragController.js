/**
 * RAG (Retrieval-Augmented Generation) Controller
 * 
 * Handles document indexing, semantic search, and context retrieval
 * for the Turbo Brain knowledge base
 */

const { query } = require('../services/database/db');
const { extractTextFromPDFUrl } = require('../services/pdfExtractor');
const { chunkDocument } = require('../services/documentChunker');
const { generateChunkEmbeddings, generateEmbedding } = require('../services/embeddings');
const { storeChunkEmbeddings, searchSimilarChunks, deleteDocumentChunks } = require('../services/vectorSearch');
const logger = require('../utils/logger');

/**
 * Index a document (extract text, chunk, generate embeddings, store)
 * POST /api/brain/index/:id
 */
const indexDocument = async (req, res, next) => {
  const documentId = parseInt(req.params.id);

  try {
    // 1. Fetch document metadata from database
    const docResult = await query(
      'SELECT id, title, file_url, mime_type FROM brain_documents WHERE id = $1',
      [documentId]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = docResult.rows[0];

    // 2. Update status to 'indexing'
    await query(
      'UPDATE brain_documents SET indexing_status = $1 WHERE id = $2',
      ['indexing', documentId]
    );

    logger.info('Starting document indexing', {
      documentId,
      title: document.title,
      fileUrl: document.file_url
    });

    // 3. Extract text from PDF
    const { text, pages } = await extractTextFromPDFUrl(document.file_url);

    if (!text || text.trim().length === 0) {
      await query(
        'UPDATE brain_documents SET indexing_status = $1 WHERE id = $2',
        ['failed', documentId]
      );

      return res.status(400).json({
        success: false,
        message: 'No text content found in document'
      });
    }

    // 4. Chunk the document
    const chunks = chunkDocument(text, {
      maxTokens: 800,
      overlapTokens: 100
    });

    if (chunks.length === 0) {
      await query(
        'UPDATE brain_documents SET indexing_status = $1 WHERE id = $2',
        ['failed', documentId]
      );

      return res.status(400).json({
        success: false,
        message: 'Failed to chunk document'
      });
    }

    // 5. Generate embeddings for chunks
    const chunksWithEmbeddings = await generateChunkEmbeddings(chunks);

    // 6. Delete existing chunks (if re-indexing)
    await deleteDocumentChunks(documentId);

    // 7. Store chunks with embeddings
    const chunksStored = await storeChunkEmbeddings(documentId, chunksWithEmbeddings);

    // 8. Update document status to 'indexed'
    await query(
      `UPDATE brain_documents 
       SET indexing_status = $1, 
           indexed_at = NOW(), 
           chunk_count = $2 
       WHERE id = $3`,
      ['indexed', chunksStored, documentId]
    );

    logger.info('Document indexed successfully', {
      documentId,
      pages,
      chunks: chunksStored,
      textLength: text.length
    });

    res.status(200).json({
      success: true,
      message: 'Document indexed successfully',
      document_id: documentId,
      pages,
      chunks_created: chunksStored,
      status: 'indexed'
    });
  } catch (error) {
    logger.error('Document indexing failed', {
      error: error.message,
      documentId
    });

    // Update status to 'failed'
    try {
      await query(
        'UPDATE brain_documents SET indexing_status = $1 WHERE id = $2',
        ['failed', documentId]
      );
    } catch (updateError) {
      logger.error('Failed to update document status', {
        error: updateError.message
      });
    }

    next(error);
  }
};

/**
 * Search for relevant document chunks
 * POST /api/brain/search
 */
const searchDocuments = async (req, res, next) => {
  const { query: searchQuery, top_k = 5, min_score = 0.7, document_ids = null } = req.body;

  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Query is required and must be a string'
    });
  }

  try {
    logger.info('Searching documents', {
      query: searchQuery,
      topK: top_k,
      minScore: min_score
    });

    // 1. Generate embedding for search query
    const queryEmbedding = await generateEmbedding(searchQuery);

    // 2. Search for similar chunks
    const results = await searchSimilarChunks(queryEmbedding, {
      topK: top_k,
      minScore: min_score,
      documentIds: document_ids
    });

    // 3. Fetch document metadata for results
    if (results.length > 0) {
      const documentIdsList = [...new Set(results.map(r => r.documentId))];
      const docsResult = await query(
        `SELECT id, title, file_url, created_at 
         FROM brain_documents 
         WHERE id = ANY($1)`,
        [documentIdsList]
      );

      const docsMap = {};
      docsResult.rows.forEach(doc => {
        docsMap[doc.id] = doc;
      });

      // Enrich results with document metadata
      const enrichedResults = results.map(result => ({
        chunk_id: result.chunkId,
        document_id: result.documentId,
        document_title: docsMap[result.documentId]?.title || 'Unknown',
        document_url: docsMap[result.documentId]?.file_url || null,
        content: result.content,
        score: result.score,
        chunk_index: result.chunkIndex
      }));

      logger.info('Search completed', {
        query: searchQuery,
        resultsCount: enrichedResults.length,
        topScore: enrichedResults[0]?.score || 0
      });

      return res.status(200).json({
        success: true,
        query: searchQuery,
        results: enrichedResults
      });
    }

    res.status(200).json({
      success: true,
      query: searchQuery,
      results: []
    });
  } catch (error) {
    logger.error('Search failed', {
      error: error.message,
      query: searchQuery
    });
    next(error);
  }
};

/**
 * Retrieve context for LLM prompt injection
 * GET /api/brain/retrieve
 */
const retrieveContext = async (req, res, next) => {
  const { query: searchQuery, max_tokens = 2000 } = req.query;

  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Query parameter is required'
    });
  }

  try {
    logger.info('Retrieving context', {
      query: searchQuery,
      maxTokens: max_tokens
    });

    // 1. Generate embedding for query
    const queryEmbedding = await generateEmbedding(searchQuery);

    // 2. Search for relevant chunks
    const results = await searchSimilarChunks(queryEmbedding, {
      topK: 10,  // Get more results to assemble context
      minScore: 0.7
    });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        context: '',
        sources: [],
        total_tokens: 0
      });
    }

    // 3. Assemble context within token limit
    let context = '';
    let totalTokens = 0;
    const sources = new Map();

    for (const result of results) {
      // Rough token estimate (1 token ≈ 4 characters)
      const chunkTokens = Math.ceil(result.content.length / 4);

      if (totalTokens + chunkTokens > max_tokens) {
        break;
      }

      context += result.content + '\n\n';
      totalTokens += chunkTokens;

      // Track sources
      if (!sources.has(result.documentId)) {
        sources.set(result.documentId, {
          document_id: result.documentId,
          chunk_count: 0
        });
      }
      sources.get(result.documentId).chunk_count++;
    }

    // 4. Fetch document titles for sources
    const sourcesList = Array.from(sources.values());
    const documentIds = sourcesList.map(s => s.document_id);

    const docsResult = await query(
      'SELECT id, title FROM brain_documents WHERE id = ANY($1)',
      [documentIds]
    );

    const docsMap = {};
    docsResult.rows.forEach(doc => {
      docsMap[doc.id] = doc.title;
    });

    const enrichedSources = sourcesList.map(source => ({
      document_id: source.document_id,
      title: docsMap[source.document_id] || 'Unknown',
      chunk_count: source.chunk_count
    }));

    logger.info('Context retrieved', {
      query: searchQuery,
      totalTokens,
      sourcesCount: enrichedSources.length
    });

    res.status(200).json({
      success: true,
      context: context.trim(),
      sources: enrichedSources,
      total_tokens: totalTokens
    });
  } catch (error) {
    logger.error('Context retrieval failed', {
      error: error.message,
      query: searchQuery
    });
    next(error);
  }
};

module.exports = {
  indexDocument,
  searchDocuments,
  retrieveContext
};
