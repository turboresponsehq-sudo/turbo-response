-- Turbo Brain RAG Pipeline - Database Migration
-- Creates brain_chunks table with vector embeddings support

-- Step 1: Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create brain_chunks table
CREATE TABLE IF NOT EXISTS brain_chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES brain_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique chunk index per document
  UNIQUE(document_id, chunk_index)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brain_chunks_document_id ON brain_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_brain_chunks_created_at ON brain_chunks(created_at DESC);

-- Step 4: Create vector similarity search index (IVFFlat for approximate nearest neighbor)
-- Note: This requires at least 1000 rows to be effective, so we'll create it but it will optimize over time
CREATE INDEX IF NOT EXISTS idx_brain_chunks_embedding 
  ON brain_chunks 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Step 5: Add indexed status column to brain_documents table
ALTER TABLE brain_documents 
  ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS chunk_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS indexing_status VARCHAR(50) DEFAULT 'pending';

-- Step 6: Create index on indexing_status for filtering
CREATE INDEX IF NOT EXISTS idx_brain_documents_indexing_status ON brain_documents(indexing_status);

-- Verification queries
SELECT 'Migration complete!' AS status;
SELECT COUNT(*) AS brain_documents_count FROM brain_documents;
SELECT COUNT(*) AS brain_chunks_count FROM brain_chunks;
