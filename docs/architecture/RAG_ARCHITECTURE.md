# 🧠 Turbo Brain RAG Architecture

## Overview
Retrieval-Augmented Generation (RAG) pipeline for semantic search across uploaded documents.

---

## Architecture Components

### 1. Document Processing Pipeline
```
PDF Upload → Text Extraction → Chunking → Embedding → Vector Storage
```

### 2. Retrieval Pipeline
```
User Query → Embedding → Vector Search → Top-K Chunks → Context Assembly → LLM Response
```

---

## Database Schema

### Table: `brain_chunks`
Stores document chunks with vector embeddings (requires pgvector extension)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE brain_chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES brain_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brain_chunks_document_id ON brain_chunks(document_id);
CREATE INDEX idx_brain_chunks_embedding ON brain_chunks USING ivfflat (embedding vector_cosine_ops);
```

### Table: `brain_documents` (Already Exists)
Metadata for uploaded documents - no changes needed.

---

## Services

### 1. PDF Text Extraction (`src/services/pdfExtractor.js`)
- Use `pdf-parse` library
- Extract raw text from PDF files
- Handle multi-page documents
- Return full text content

### 2. Document Chunking (`src/services/documentChunker.js`)
- Split text into 500-1000 token chunks
- Use sentence boundaries (avoid mid-sentence splits)
- Add overlap between chunks (100 tokens)
- Track chunk index and metadata

### 3. Embeddings Generation (`src/services/embeddings.js`)
- Use OpenAI `text-embedding-3-small` model
- Batch embed chunks (max 100 per request)
- Dimension: 1536
- Store vectors in PostgreSQL

### 4. Vector Search (`src/services/vectorSearch.js`)
- Cosine similarity search
- Return top-K most relevant chunks
- Include document metadata
- Score threshold filtering

---

## API Endpoints

### POST `/api/brain/index/:id`
**Purpose:** Process uploaded document and generate embeddings

**Flow:**
1. Fetch document from Supabase storage
2. Extract text from PDF
3. Chunk text into segments
4. Generate embeddings for each chunk
5. Store chunks + embeddings in database
6. Update document status to "indexed"

**Response:**
```json
{
  "success": true,
  "document_id": 123,
  "chunks_created": 45,
  "status": "indexed"
}
```

---

### POST `/api/brain/search`
**Purpose:** Semantic search across all indexed documents

**Request:**
```json
{
  "query": "What are the IRS audit procedures?",
  "top_k": 5,
  "min_score": 0.7
}
```

**Flow:**
1. Generate embedding for query
2. Perform vector similarity search
3. Return top-K chunks with scores
4. Include source document metadata

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "chunk_id": 789,
      "document_id": 123,
      "document_title": "IRS Audit Guide 2024",
      "content": "IRS audit procedures begin with...",
      "score": 0.92,
      "chunk_index": 3
    }
  ]
}
```

---

### GET `/api/brain/retrieve`
**Purpose:** Get relevant context for LLM prompt injection

**Query Params:**
- `query`: Search query
- `max_tokens`: Maximum total tokens to return (default: 2000)

**Flow:**
1. Search for relevant chunks
2. Assemble context within token limit
3. Format for LLM injection
4. Return structured context

**Response:**
```json
{
  "success": true,
  "context": "Based on IRS Audit Guide 2024: IRS audit procedures begin with...",
  "sources": [
    {
      "document_id": 123,
      "title": "IRS Audit Guide 2024",
      "chunk_count": 3
    }
  ],
  "total_tokens": 1850
}
```

---

## Turbo Agent Integration

### System Prompt Enhancement
```javascript
const systemPrompt = `
You are Turbo, an AI assistant for Turbo Response HQ.

KNOWLEDGE BASE ACCESS:
You have access to a curated knowledge base of legal documents, guides, and case studies.
When answering questions, you will receive relevant context from these documents.

CONTEXT (if available):
${retrievedContext}

INSTRUCTIONS:
- Use the provided context to answer questions accurately
- Cite source documents when referencing specific information
- If context is insufficient, acknowledge limitations
- Prioritize knowledge base information over general knowledge
`;
```

### Agent Workflow
1. User sends message to Turbo agent
2. Backend searches Brain documents for relevant context
3. Inject top-K chunks into system prompt
4. LLM generates response using retrieved context
5. Return response with source citations

---

## Technology Stack

- **Vector Database:** PostgreSQL + pgvector extension
- **Embeddings Model:** OpenAI text-embedding-3-small (1536 dimensions)
- **PDF Processing:** pdf-parse
- **Chunking:** Custom sentence-aware splitter
- **Similarity Metric:** Cosine similarity
- **Storage:** Supabase (documents) + PostgreSQL (vectors)

---

## Performance Considerations

### Indexing
- Process documents asynchronously (queue-based)
- Batch embed chunks (100 per request)
- Update progress status in real-time

### Search
- Use IVFFlat index for fast approximate search
- Cache frequent queries
- Limit top-K to 10 chunks max
- Set minimum similarity threshold (0.7)

### Token Management
- Track token counts per chunk
- Respect LLM context window limits
- Prioritize higher-scoring chunks when assembling context

---

## Migration Plan

### Phase 1: Database Setup
1. Enable pgvector extension in Supabase
2. Create brain_chunks table
3. Create vector indexes

### Phase 2: Services Implementation
1. PDF text extraction
2. Document chunking
3. Embeddings generation
4. Vector search

### Phase 3: API Routes
1. Index endpoint
2. Search endpoint
3. Retrieve endpoint

### Phase 4: Agent Integration
1. Update Turbo agent system prompt
2. Add context retrieval to agent workflow
3. Test end-to-end RAG pipeline

---

## Testing Strategy

### Unit Tests
- PDF extraction accuracy
- Chunking logic (overlap, boundaries)
- Embedding generation
- Vector search precision

### Integration Tests
- Full indexing pipeline
- Search relevance
- Agent context injection
- Performance benchmarks

### User Acceptance Tests
- Upload document → Index → Search → Verify results
- Agent query → Retrieve context → Generate response
- Multi-document search accuracy

---

## Success Metrics

- **Indexing Speed:** < 30 seconds per 50-page document
- **Search Latency:** < 500ms for top-10 results
- **Relevance Score:** > 0.8 for top-3 results
- **Agent Response Quality:** Measurable improvement with RAG vs. without

---

**Next Steps:**
1. Enable pgvector in Supabase
2. Run database migration
3. Implement services
4. Build API routes
5. Integrate with agents
6. Test and deploy
