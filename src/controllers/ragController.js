/**
 * RAG (Retrieval-Augmented Generation) Controller
 * Uses Supabase for all database operations
 */

const { getSupabaseDB } = require('../services/supabase/client');
const { extractTextFromPDFUrl } = require('../services/pdfExtractor');
const { chunkDocument } = require('../services/documentChunker');
const { generateChunkEmbeddings, generateEmbedding } = require('../services/embeddings');
const { storeChunkEmbeddings, searchSimilarChunks, deleteDocumentChunks } = require('../services/vectorSearch');
const logger = require('../utils/logger');

const indexDocument = async (req, res, next) => {
  const documentId = req.params.id;
  const sb = getSupabaseDB();

  try {
    const { data: docs, error: fetchError } = await sb
      .from('brain_documents')
      .select('id, title, file_url, mime_type')
      .eq('id', documentId)
      .single();

    if (fetchError || !docs) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await sb.from('brain_documents').update({ indexing_status: 'indexing' }).eq('id', documentId);

    logger.info('Starting document indexing', { documentId, title: docs.title });

    const { text } = await extractTextFromPDFUrl(docs.file_url);

    if (!text || text.trim().length === 0) {
      await sb.from('brain_documents').update({ indexing_status: 'failed' }).eq('id', documentId);
      return res.status(400).json({ success: false, message: 'No text content found' });
    }

    const chunks = chunkDocument(text, { maxTokens: 800, overlapTokens: 100 });

    if (chunks.length === 0) {
      await sb.from('brain_documents').update({ indexing_status: 'failed' }).eq('id', documentId);
      return res.status(400).json({ success: false, message: 'Failed to chunk document' });
    }

    const chunksWithEmbeddings = await generateChunkEmbeddings(chunks);
    await deleteDocumentChunks(documentId);
    const chunksStored = await storeChunkEmbeddings(documentId, chunksWithEmbeddings);

    await sb.from('brain_documents').update({
      indexing_status: 'indexed',
      indexed_at: new Date().toISOString(),
      chunk_count: chunksStored
    }).eq('id', documentId);

    logger.info('Document indexed successfully', { documentId, chunks: chunksStored });

    res.status(200).json({
      success: true,
      message: 'Document indexed successfully',
      documentId,
      chunks: chunksStored
    });
  } catch (error) {
    logger.error('Indexing failed', { documentId, error: error.message });
    await sb.from('brain_documents').update({ indexing_status: 'failed' }).eq('id', documentId).catch(() => {});
    next(error);
  }
};

const searchDocuments = async (req, res, next) => {
  const { query: searchQuery, top_k = 5, min_score = 0.7 } = req.body;

  if (!searchQuery) {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  try {
    const queryEmbedding = await generateEmbedding(searchQuery);
    const results = await searchSimilarChunks(queryEmbedding, { topK: parseInt(top_k), minScore: parseFloat(min_score) });

    if (results.length > 0) {
      const docIds = [...new Set(results.map(r => r.documentId))];
      const sb = getSupabaseDB();
      const { data: docsData } = await sb.from('brain_documents').select('id, title, file_url').in('id', docIds);

      const docsMap = {};
      (docsData || []).forEach(doc => { docsMap[doc.id] = doc; });

      const enrichedResults = results.map(result => ({
        chunk_id: result.chunkId,
        document_id: result.documentId,
        document_title: docsMap[result.documentId]?.title || 'Unknown',
        document_url: docsMap[result.documentId]?.file_url || null,
        content: result.content,
        score: result.score,
        chunk_index: result.chunkIndex
      }));

      return res.status(200).json({ success: true, query: searchQuery, results: enrichedResults });
    }

    res.status(200).json({ success: true, query: searchQuery, results: [] });
  } catch (error) {
    logger.error('Search failed', { error: error.message, query: searchQuery });
    next(error);
  }
};

const retrieveContext = async (req, res, next) => {
  const { query: searchQuery, max_tokens = 2000 } = req.query;

  if (!searchQuery) {
    return res.status(400).json({ success: false, message: 'Query parameter is required' });
  }

  try {
    const queryEmbedding = await generateEmbedding(searchQuery);
    const results = await searchSimilarChunks(queryEmbedding, { topK: 10, minScore: 0.7 });

    if (results.length === 0) {
      return res.status(200).json({ success: true, context: '', sources: [], total_tokens: 0 });
    }

    let context = '';
    let totalTokens = 0;
    const sources = new Map();

    for (const result of results) {
      const chunkTokens = Math.ceil(result.content.length / 4);
      if (totalTokens + chunkTokens > max_tokens) break;

      context += result.content + '\n\n';
      totalTokens += chunkTokens;

      if (!sources.has(result.documentId)) {
        sources.set(result.documentId, { document_id: result.documentId, chunk_count: 0 });
      }
      sources.get(result.documentId).chunk_count++;
    }

    const sb = getSupabaseDB();
    const docIds = Array.from(sources.keys());
    const { data: docsData } = await sb.from('brain_documents').select('id, title, file_url').in('id', docIds);

    const enrichedSources = Array.from(sources.values()).map(source => {
      const doc = (docsData || []).find(d => d.id === source.document_id);
      return {
        document_id: source.document_id,
        document_title: doc?.title || 'Unknown',
        document_url: doc?.file_url || null,
        chunk_count: source.chunk_count
      };
    });

    res.status(200).json({
      success: true,
      context,
      sources: enrichedSources,
      total_tokens: totalTokens
    });
  } catch (error) {
    logger.error('Context retrieval failed', { error: error.message });
    next(error);
  }
};

const bulkIndexDocuments = async (req, res, next) => {
  try {
    const sb = getSupabaseDB();
    const { data, error } = await sb
      .from('brain_documents')
      .select('id, title, file_url')
      .or('indexing_status.in.(pending,failed),indexing_status.is.null')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(200).json({ success: true, message: 'No documents to index', total: 0 });
    }

    logger.info('Starting bulk indexing', { totalDocuments: data.length });

    processBulkIndexing(data).catch(error => {
      logger.error('Bulk indexing background process failed', { error: error.message });
    });

    res.status(202).json({
      success: true,
      message: 'Bulk indexing started',
      total: data.length,
      status: 'processing'
    });
  } catch (error) {
    logger.error('Bulk indexing start failed', { error: error.message });
    next(error);
  }
};

async function processBulkIndexing(documents) {
  const batchSize = 5;
  let indexed = 0;
  let failed = 0;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(doc => indexSingleDocument(doc.id, doc.file_url, doc.title))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        indexed++;
        logger.info('Document indexed', { documentId: batch[index].id });
      } else {
        failed++;
        logger.error('Document indexing failed', { documentId: batch[index].id, error: result.reason?.message });
      }
    });

    if (i + batchSize < documents.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  logger.info('Bulk indexing completed', { total: documents.length, indexed, failed });
}

async function indexSingleDocument(documentId, fileUrl, title) {
  const sb = getSupabaseDB();
  
  try {
    await sb.from('brain_documents').update({ indexing_status: 'indexing' }).eq('id', documentId);

    const { text } = await extractTextFromPDFUrl(fileUrl);

    if (!text || text.trim().length === 0) {
      await sb.from('brain_documents').update({ indexing_status: 'failed' }).eq('id', documentId);
      throw new Error('No text content found');
    }

    const chunks = chunkDocument(text, { maxTokens: 800, overlapTokens: 100 });

    if (chunks.length === 0) {
      await sb.from('brain_documents').update({ indexing_status: 'failed' }).eq('id', documentId);
      throw new Error('Failed to chunk document');
    }

    const chunksWithEmbeddings = await generateChunkEmbeddings(chunks);
    await deleteDocumentChunks(documentId);
    const chunksStored = await storeChunkEmbeddings(documentId, chunksWithEmbeddings);

    await sb.from('brain_documents').update({
      indexing_status: 'indexed',
      indexed_at: new Date().toISOString(),
      chunk_count: chunksStored
    }).eq('id', documentId);

    return { success: true, chunks: chunksStored };
  } catch (error) {
    await sb.from('brain_documents').update({ indexing_status: 'failed' }).eq('id', documentId).catch(() => {});
    throw error;
  }
}

const getIndexingStatus = async (req, res, next) => {
  try {
    const sb = getSupabaseDB();
    const { data: allDocs, error } = await sb.from('brain_documents').select('indexing_status');

    if (error) throw error;

    const statusCounts = {};
    (allDocs || []).forEach(doc => {
      const status = doc.indexing_status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const total = allDocs?.length || 0;
    const indexed = statusCounts['indexed'] || 0;
    const pending = (statusCounts['pending'] || 0) + (statusCounts[null] || 0);
    const processing = statusCounts['indexing'] || 0;
    const failedCount = statusCounts['failed'] || 0;

    res.status(200).json({
      success: true,
      status: {
        total,
        indexed,
        pending,
        processing,
        failed: failedCount
      }
    });
  } catch (error) {
    logger.error('Status check failed', { error: error.message });
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
