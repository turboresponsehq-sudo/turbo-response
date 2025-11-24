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

/**
 * Start bulk indexing of all unindexed documents
 * POST /api/brain/index/bulk
 */
const bulkIndexDocuments = async (req, res, next) => {
  try {
    // Get all unindexed documents
    const result = await query(
      `SELECT id, title, file_url 
       FROM brain_documents 
       WHERE indexing_status IN ('pending', 'failed') OR indexing_status IS NULL
       ORDER BY created_at ASC`
    );

    const unindexedDocs = result.rows;

    if (unindexedDocs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No documents to index',
        total: 0,
        indexed: 0
      });
    }

    logger.info('Starting bulk indexing', {
      totalDocuments: unindexedDocs.length
    });

    // Process documents asynchronously (don't wait for completion)
    // This prevents request timeout for large batches
    processBulkIndexing(unindexedDocs).catch(error => {
      logger.error('Bulk indexing background process failed', {
        error: error.message
      });
    });

    res.status(202).json({
      success: true,
      message: 'Bulk indexing started',
      total: unindexedDocs.length,
      status: 'processing'
    });
  } catch (error) {
    logger.error('Bulk indexing start failed', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Background process for bulk indexing
 * Processes documents in batches to avoid overwhelming the system
 */
async function processBulkIndexing(documents) {
  const batchSize = 5; // Process 5 documents at a time
  let indexed = 0;
  let failed = 0;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    logger.info('Processing batch', {
      batchStart: i,
      batchSize: batch.length,
      totalDocuments: documents.length
    });

    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map(doc => indexSingleDocument(doc.id, doc.file_url, doc.title))
    );

    // Count successes and failures
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        indexed++;
        logger.info('Document indexed', {
          documentId: batch[index].id,
          title: batch[index].title
        });
      } else {
        failed++;
        logger.error('Document indexing failed', {
          documentId: batch[index].id,
          title: batch[index].title,
          error: result.reason?.message
        });
      }
    });

    // Small delay between batches to avoid rate limits
    if (i + batchSize < documents.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  logger.info('Bulk indexing completed', {
    total: documents.length,
    indexed,
    failed
  });
}

/**
 * Index a single document (helper for bulk indexing)
 */
async function indexSingleDocument(documentId, fileUrl, title) {
  try {
    // Update status to 'indexing'
    await query(
      'UPDATE brain_documents SET indexing_status = $1 WHERE id = $2',
      ['indexing', documentId]
    );

    // Extract text from PDF
    const { text, pages } = await extractTextFromPDFUrl(fileUrl);

    if (!text || text.trim().length === 0) {
      await query(
        'UPDATE brain_documents SET indexing_status = $1 WHERE id = $2',
        ['failed', documentId]
      );
      throw new Error('No text content found in document');
    }

    // Chunk the document
    const chunks = chunkDocument(text, {
      maxTokens: 800,
      overlapTokens: 100
    });

    if (chunks.length === 0) {
      await query(
        'UPDATE brain_documents SET indexing_status = $1 WHERE id = $2',
        ['failed', documentId]
      );
      throw new Error('Failed to chunk document');
    }

    // Generate embeddings for chunks
    const chunksWithEmbeddings = await generateChunkEmbeddings(chunks);

    // Delete existing chunks (if re-indexing)
    await deleteDocumentChunks(documentId);

    // Store chunks with embeddings
    const chunksStored = await storeChunkEmbeddings(documentId, chunksWithEmbeddings);

    // Update document status to 'indexed'
    await query(
      `UPDATE brain_documents 
       SET indexing_status = $1, 
           indexed_at = NOW(), 
           chunk_count = $2 
       WHERE id = $3`,
      ['indexed', chunksStored, documentId]
    );

    return {
      documentId,
      title,
      pages,
      chunks: chunksStored
    };
  } catch (error) {
    // Update status to 'failed'
    await query(
      'UPDATE brain_documents SET indexing_status = $1 WHERE id = $2',
      ['failed', documentId]
    );
    throw error;
  }
}

/**
 * Get bulk indexing status
 * GET /api/brain/index/status
 */
const getIndexingStatus = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
         indexing_status,
         COUNT(*) as count
       FROM brain_documents
       GROUP BY indexing_status`
    );

    const statusCounts = {};
    result.rows.forEach(row => {
      statusCounts[row.indexing_status || 'pending'] = parseInt(row.count);
    });

    const totalResult = await query('SELECT COUNT(*) as total FROM brain_documents');
    const total = parseInt(totalResult.rows[0].total);

    res.status(200).json({
      success: true,
      total,
      status: statusCounts,
      indexed: statusCounts.indexed || 0,
      pending: (statusCounts.pending || 0) + (statusCounts.null || 0),
      indexing: statusCounts.indexing || 0,
      failed: statusCounts.failed || 0
    });
  } catch (error) {
    logger.error('Failed to get indexing status', {
      error: error.message
    });
    next(error);
  }
};

module.exports = {
  indexDocument,
  searchDocuments,
  retrieveContext,
  bulkIndexDocuments,
  getIndexingStatus
};
