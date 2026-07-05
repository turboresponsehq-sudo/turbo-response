# Turbo Response Knowledge Base Architecture

## Overview

The Turbo Response Knowledge Base is the intelligence layer powering all AI features across the platform. It serves as the **control/governance layer** for document management, with clear separation of concerns between source, storage, processing, and retrieval.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GOVERNANCE LAYER                            │
│                  Turbo Response Knowledge Base                       │
│                    (MySQL/TiDB - Control)                           │
│  • Document metadata • Status tracking • Sync coordination          │
│  • Content hashing • Change detection • Audit trail                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↑
                    ┌─────────────┼─────────────┐
                    ↓             ↓             ↓
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Google Drive    │ │   Manual     │ │   xAI        │
        │  (Source of      │ │   Upload     │ │   Collections│
        │   Truth)         │ │   (Phase 1+) │ │   (Phase 2+) │
        └──────────────────┘ └──────────────┘ └──────────────┘
                    ↓             ↓             ↓
        ┌──────────────────────────────────────────────────┐
        │        PROCESSING LAYER (Phase 2)                │
        │  • Text extraction  • Chunking  • Embeddings     │
        └──────────────────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────────────────┐
        │      RETRIEVAL LAYER (Phase 2+)                  │
        │  • Supabase pgvector (Vector Search)             │
        │  • xAI Collections (Runtime Retrieval)           │
        └──────────────────────────────────────────────────┘
                              ↓
        ┌──────────────────────────────────────────────────┐
        │      CONSUMPTION LAYER (Phase 3+)                │
        │  • Dashboard AI Assistant                        │
        │  • Website Chatbot                               │
        │  • Voice Agent                                   │
        │  • Internal Business Assistant                   │
        │  • Future APIs                                   │
        └──────────────────────────────────────────────────┘
```

## Data Flow

### Phase 1: Document Ingestion

```
Google Drive Document
        ↓
Document Import Service
        ↓
Extract: Title, Category, Content, Metadata
        ↓
Calculate: SHA256 Content Hash
        ↓
Store in MySQL:
  - Metadata (title, category, source, etc.)
  - Extracted text content
  - Content hash (for change detection)
  - Status (active, archived, needs_review)
  - Timestamps
        ↓
Knowledge Base Ready
```

### Phase 2: Processing & Embeddings

```
Active Documents (status='active')
        ↓
Text Chunking Service
        ↓
Split into semantic chunks (512-1024 tokens)
        ↓
Embedding Service (OpenAI/xAI)
        ↓
Store in Supabase pgvector:
  - Vector embeddings
  - Chunk metadata
  - Reference to MySQL document
        ↓
Vector Search Ready
```

### Phase 2+: xAI Collections Sync

```
Documents with synced_to_xai=0
        ↓
xAI Collections Sync Service
        ↓
Upload to xAI Collections API
        ↓
Receive: xai_collection_id
        ↓
Update MySQL:
  - xai_collection_id
  - synced_to_xai = 1
  - last_synced_at = NOW()
        ↓
Runtime Retrieval Ready
```

## Database Schema

### knowledge_documents Table (20 columns)

| Column | Type | Purpose | Nullable |
|--------|------|---------|----------|
| `id` | INT | Primary key | NO |
| `title` | VARCHAR(500) | Document title | NO |
| `category` | VARCHAR(100) | Category (consumer_defense, turbo_response, sops, etc.) | NO |
| `subcategory` | VARCHAR(100) | Subcategory for organization | YES |
| `source` | VARCHAR(50) | Legacy source field | NO |
| `source_system` | ENUM | Origin (google_drive, upload, xai_collection, manual) | NO |
| `sourceUrl` | VARCHAR(1000) | Link to original document | YES |
| `fileType` | VARCHAR(50) | File type (pdf, docx, md, etc.) | YES |
| `content` | LONGTEXT | Extracted text content | YES |
| `summary` | TEXT | AI-generated summary | YES |
| `status` | ENUM | Status (active, archived, needs_review) | NO |
| `isProcessed` | INT | Flag: processed for embeddings | NO |
| `adminNotes` | TEXT | Admin annotations | YES |
| `last_synced_at` | TIMESTAMP | Last xAI Collections sync | YES |
| `xai_collection_id` | VARCHAR(255) | External xAI Collections ID | YES |
| `synced_to_xai` | INT | Flag: synced to xAI (0/1) | NO |
| `content_hash` | VARCHAR(64) | SHA256 hash for change detection | YES |
| `workspace_id` | INT | Workspace ID (multi-tenant) | YES |
| `dateAdded` | TIMESTAMP | Creation timestamp | NO |
| `updatedAt` | TIMESTAMP | Last update timestamp | NO |

## Key Features

### 1. Change Detection

The `content_hash` field stores a SHA256 hash of document content. This enables:
- Detecting when a Google Drive document has been updated
- Avoiding unnecessary reprocessing
- Preventing duplicate syncs to xAI Collections
- Audit trail of document changes

**Implementation:**
```typescript
calculateContentHash(content: string): string
  → SHA256(content) → 64-character hex string

hasContentChanged(docId: number, newContent: string): boolean
  → Compare new hash with stored hash
  → Return true if different
```

### 2. Multi-Source Document Management

The `source_system` enum tracks document origin:
- `google_drive` — Imported from Google Drive (Phase 1)
- `upload` — Manually uploaded (Phase 1+)
- `xai_collection` — Synced from xAI Collections (Phase 2+)
- `manual` — Manually created (Phase 1+)

This enables:
- Tracking document provenance
- Different processing workflows per source
- Audit trail of document lifecycle
- Future bi-directional sync with xAI

### 3. xAI Collections Sync Coordination

Fields for xAI Collections integration:
- `synced_to_xai` — Flag indicating sync status (0 = pending, 1 = synced)
- `xai_collection_id` — External collection ID from xAI API
- `last_synced_at` — Timestamp of last sync

This enables:
- Tracking which documents are synced
- Identifying pending syncs
- Updating documents in xAI after changes
- Audit trail of sync events

### 4. Multi-Tenant Foundation

The `workspace_id` field prepares for future multi-tenant support:
- Each document can belong to a workspace
- Enables per-workspace knowledge bases
- Supports future client/organization separation
- Maintains data isolation

## Governance Model

### Control Layer (MySQL)
- **Responsibility:** Document metadata, status, sync coordination
- **Authority:** Single source of truth for document state
- **Durability:** Persistent, backed up, auditable
- **Latency:** Milliseconds (local database)

### Source Layer (Google Drive)
- **Responsibility:** Original document storage
- **Authority:** Source of truth for content
- **Durability:** Google Drive backup and versioning
- **Latency:** Seconds (API calls)

### Runtime Layer (xAI Collections)
- **Responsibility:** Fast retrieval for AI agents
- **Authority:** Derived from MySQL (not source of truth)
- **Durability:** Managed by xAI
- **Latency:** Milliseconds (optimized for inference)

### Processing Layer (Supabase pgvector)
- **Responsibility:** Vector search and semantic retrieval
- **Authority:** Derived from MySQL content
- **Durability:** Managed by Supabase
- **Latency:** Milliseconds (vector similarity search)

## Workflow: Document Lifecycle

### 1. Import (Phase 1)

```
User: "Import documents from Google Drive"
  ↓
System: List folders and files
  ↓
User: Select documents
  ↓
System: Extract text and metadata
  ↓
System: Calculate content_hash
  ↓
System: Store in MySQL with status='needs_review'
  ↓
Admin: Review and approve
  ↓
System: Update status='active'
```

### 2. Processing (Phase 2)

```
Scheduled Job: "Process active documents"
  ↓
Query: SELECT * FROM knowledge_documents WHERE status='active' AND isProcessed=0
  ↓
For each document:
  - Split content into chunks
  - Generate embeddings
  - Store in Supabase pgvector
  - Update isProcessed=1
```

### 3. Sync to xAI (Phase 2+)

```
Scheduled Job: "Sync pending documents to xAI Collections"
  ↓
Query: SELECT * FROM knowledge_documents WHERE synced_to_xai=0 AND status='active'
  ↓
For each document:
  - Call xAI Collections API
  - Receive xai_collection_id
  - Update: synced_to_xai=1, xai_collection_id=..., last_synced_at=NOW()
```

### 4. Update Detection (Phase 2+)

```
Scheduled Job: "Check for Google Drive updates"
  ↓
For each google_drive document:
  - Download latest version
  - Calculate new content_hash
  - Compare with stored content_hash
  ↓
If changed:
  - Update content in MySQL
  - Set isProcessed=0 (re-process)
  - Set synced_to_xai=0 (re-sync)
  - Trigger Phase 2 & 3 workflows
```

## Integration Points

### Admin Dashboard
- View all documents
- Filter by category, status, source
- Search by title/content
- Mark for review
- Archive/delete
- Trigger manual sync

### AI Features (Phase 3+)
- Dashboard Assistant: Query knowledge base for context
- Website Chatbot: Retrieve relevant documents
- Voice Agent: Use xAI Collections for fast retrieval
- Internal Assistant: Access all knowledge

### External Systems
- **Google Drive:** Source of truth (read-only)
- **xAI Collections:** Runtime retrieval (write)
- **Supabase:** Vector search (write)
- **HubSpot:** CRM/action layer (independent)

## Security & Privacy

- **Access Control:** Workspace-based isolation (future)
- **Audit Trail:** All changes logged with timestamps
- **Data Retention:** Configurable per document
- **Encryption:** At rest (database) and in transit (HTTPS)
- **Compliance:** GDPR-ready with workspace deletion

## Performance Considerations

- **Content Hash:** O(1) lookup for change detection
- **Vector Search:** O(log n) with pgvector indexing
- **xAI Retrieval:** O(1) with collection ID
- **Batch Processing:** Nightly jobs for embeddings/sync
- **Caching:** Future: Redis for frequent queries

## Future Enhancements

1. **Bi-directional Sync:** Update Google Drive from xAI Collections
2. **Versioning:** Track document versions over time
3. **Permissions:** Role-based access control per document
4. **Workflows:** Approval workflows for sensitive documents
5. **Analytics:** Track usage and retrieval patterns
6. **Integrations:** Slack, Teams, Notion connectors
7. **Webhooks:** Real-time Google Drive change notifications
8. **Compression:** Store embeddings more efficiently

## Deployment

### Phase 1 (Current)
- ✅ MySQL schema with all fields
- ✅ Admin page for document management
- ✅ Google Drive import workflow
- ✅ Content hash calculation
- ✅ Change detection logic

### Phase 2 (Next)
- [ ] Text chunking service
- [ ] Embedding generation
- [ ] Supabase pgvector integration
- [ ] Vector search implementation

### Phase 2+ (Later)
- [ ] xAI Collections sync
- [ ] Runtime retrieval optimization
- [ ] AI agent integration

### Phase 3+ (Future)
- [ ] Dashboard AI assistant
- [ ] Website chatbot
- [ ] Voice agent
- [ ] Internal business assistant
