# Bulk Indexing Guide for Turbo Brain System

## Overview

The bulk indexing endpoint processes all existing unindexed documents in your Brain System, enabling RAG (Retrieval-Augmented Generation) functionality without re-uploading files.

---

## API Endpoints

### 1. Start Bulk Indexing

**POST** `/api/brain/index/bulk`

Starts background processing of all unindexed documents.

**Headers:**
```
x-access-token: YOUR_ACCESS_TOKEN
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Bulk indexing started",
  "total": 150,
  "status": "processing"
}
```

**Example cURL:**
```bash
curl -X POST https://turboresponsehq.ai/api/brain/index/bulk \
  -H "x-access-token: YOUR_ACCESS_TOKEN"
```

---

### 2. Check Indexing Status

**GET** `/api/brain/index/status`

Returns current indexing status for all documents.

**Headers:**
```
x-access-token: YOUR_ACCESS_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "total": 150,
  "status": {
    "indexed": 120,
    "pending": 20,
    "indexing": 5,
    "failed": 5
  },
  "indexed": 120,
  "pending": 20,
  "indexing": 5,
  "failed": 5
}
```

**Example cURL:**
```bash
curl https://turboresponsehq.ai/api/brain/index/status \
  -H "x-access-token: YOUR_ACCESS_TOKEN"
```

---

## How It Works

### Background Processing
- Bulk indexing runs **asynchronously** in the background
- The API returns immediately with `202 Accepted`
- Documents are processed in **batches of 5** to avoid overwhelming the system
- Each batch has a **2-second delay** to prevent OpenAI API rate limits

### Processing Steps (Per Document)
1. **Extract text** from PDF using pdf-parse
2. **Chunk document** into 800-token segments with 100-token overlap
3. **Generate embeddings** using OpenAI text-embedding-3-small (1536 dimensions)
4. **Store chunks** with embeddings in `brain_chunks` table
5. **Update status** to `indexed` with chunk count and timestamp

### Status Transitions
```
pending → indexing → indexed (success)
                  → failed (error)
```

---

## Monitoring Progress

### Option 1: Poll Status Endpoint
```bash
# Check status every 30 seconds
watch -n 30 'curl -s https://turboresponsehq.ai/api/brain/index/status \
  -H "x-access-token: YOUR_TOKEN" | jq'
```

### Option 2: Check Render Logs
1. Go to Render Dashboard → turbo-response-backend
2. Click **Logs** tab
3. Look for:
   - `Starting bulk indexing` - Initial start
   - `Processing batch` - Batch progress
   - `Document indexed` - Individual successes
   - `Bulk indexing completed` - Final summary

---

## Troubleshooting

### Failed Documents

If some documents fail to index, check:

1. **File accessibility** - Ensure Supabase URLs are publicly accessible
2. **PDF format** - Some PDFs are scanned images (no extractable text)
3. **OpenAI API limits** - Check if you hit rate limits

**Re-index failed documents:**
```bash
curl -X POST https://turboresponsehq.ai/api/brain/index/bulk \
  -H "x-access-token: YOUR_TOKEN"
```
(Only processes documents with status `pending` or `failed`)

### Check Individual Document
```sql
-- In Supabase SQL Editor
SELECT id, title, indexing_status, chunk_count, indexed_at
FROM brain_documents
WHERE indexing_status = 'failed'
ORDER BY created_at DESC;
```

---

## Performance

### Expected Processing Time
- **Small PDFs** (1-10 pages): ~5-10 seconds each
- **Medium PDFs** (10-50 pages): ~15-30 seconds each
- **Large PDFs** (50+ pages): ~30-60 seconds each

### Batch Size
- Default: **5 documents per batch**
- Delay between batches: **2 seconds**
- For 150 documents: ~15-30 minutes total

---

## After Indexing

Once documents are indexed:

1. **Turbo AI agents** automatically search Brain documents when users ask questions
2. **Relevant context** is injected into agent responses
3. **Source citations** are included in responses

Test it:
```bash
# Ask Turbo a question that should trigger Brain search
curl -X POST https://turboresponsehq.ai/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are my rights under FCRA?"
  }'
```

Check logs for:
```
Brain context retrieved { chunksFound: 3, sources: 2 }
```

---

## Database Schema

### brain_documents table
```sql
- id (serial)
- title (text)
- file_url (text)
- indexing_status (varchar) -- 'pending', 'indexing', 'indexed', 'failed'
- indexed_at (timestamp)
- chunk_count (integer)
- created_at (timestamp)
```

### brain_chunks table
```sql
- id (serial)
- document_id (integer) -- FK to brain_documents
- chunk_index (integer)
- content (text)
- embedding (vector(1536))
- token_count (integer)
- created_at (timestamp)
```

---

## Next Steps

After bulk indexing completes:

1. ✅ Verify all documents are indexed (check status endpoint)
2. ✅ Test RAG retrieval with sample questions
3. ✅ Monitor Turbo agent responses for Brain context usage
4. ✅ Add more documents as needed (auto-indexed on upload)
