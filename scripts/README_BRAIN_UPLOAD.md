# Brain System - Blueprint Upload Instructions

## 📄 Document Ready for Upload

**File:** `/home/ubuntu/consumer_defense_blueprint.md`  
**Size:** 60KB (1,949 lines)  
**Content:** Complete Consumer Defense System documentation

## 🔧 Prerequisites (Must Complete First)

### 1. Configure Supabase Environment Variables

Add these to Render's Environment tab for `turbo-response-backend`:

```
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**Where to get these:**
- Go to Supabase Dashboard → Project Settings → API
- Copy "Project URL" → `SUPABASE_URL`
- Copy "service_role key" (NOT anon key) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Create Database Table

Run this in Supabase SQL Editor:

```sql
CREATE TABLE brain_documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  source VARCHAR(50) DEFAULT 'upload',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brain_documents_created_at ON brain_documents(created_at DESC);
CREATE INDEX idx_brain_documents_archived ON brain_documents(is_archived);
```

### 3. Create Storage Bucket

Run this in Supabase SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('brain-docs', 'brain-docs', true)
ON CONFLICT (id) DO NOTHING;
```

Or create via Supabase Dashboard:
- Go to Storage → Create bucket
- Name: `brain-docs`
- Public: Yes

## 🚀 Upload Methods

### Method 1: Automated Script (Recommended)

```bash
cd /home/ubuntu/turbo-response-live
node scripts/upload-blueprint-to-brain.js
```

**What it does:**
- Reads `consumer_defense_blueprint.md`
- Uploads to Supabase `brain-docs` bucket
- Saves metadata to `brain_documents` table
- Returns document ID and public URL

### Method 2: API Endpoint (Alternative)

Use Thunder Client or curl:

```bash
curl -X POST https://turbo-response-backend.onrender.com/api/brain/upload \
  -H "x-access-token: TR-SECURE-2025" \
  -F "file=@/home/ubuntu/consumer_defense_blueprint.md" \
  -F "title=Consumer Defense System - Complete Blueprint" \
  -F "description=Complete system architecture and workflow documentation"
```

### Method 3: Manual Upload (Supabase Dashboard)

1. Go to Supabase Dashboard → Storage → brain-docs
2. Click "Upload file"
3. Select `consumer_defense_blueprint.md`
4. Manually insert metadata into `brain_documents` table

## ✅ Verification

After upload, verify with:

```bash
curl -X GET https://turbo-response-backend.onrender.com/api/brain/list \
  -H "x-access-token: TR-SECURE-2025"
```

Expected response:
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "title": "Consumer Defense System - Complete Blueprint",
      "file_url": "https://[project].supabase.co/storage/v1/object/public/brain-docs/...",
      "size_bytes": 61440,
      "created_at": "2025-11-22T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

## 🎯 What This Enables

Once uploaded, the Brain System will:

1. **RAG Integration** - AI can retrieve relevant sections when analyzing cases
2. **Knowledge Base** - Turbo AI can reference system architecture
3. **Documentation** - Admins can access complete system docs
4. **Training Data** - Future AI agents can learn from this blueprint

## 📝 Document Contents

The blueprint includes:

- ✅ All frontend pages (Home, Intake, Payment, Portal, Admin)
- ✅ Complete backend API routes
- ✅ Database schema and migrations
- ✅ AI integration (GPT-4o analysis, pricing engine)
- ✅ Payment flow and contract signing
- ✅ Client portal authentication
- ✅ Messaging system
- ✅ File upload and PDF conversion
- ✅ Email notifications
- ✅ Admin workflows

## 🔐 Security Notes

- The `brain-docs` bucket is **public** (files accessible via URL)
- Access to upload/delete requires `x-access-token: TR-SECURE-2025`
- Service role key has full database access - keep it secret
- Blueprint contains no sensitive data (system architecture only)

---

**Status:** Ready for upload once Supabase is configured  
**Next Step:** Complete Prerequisites 1-3, then run Method 1
