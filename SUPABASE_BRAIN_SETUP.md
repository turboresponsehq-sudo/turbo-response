# Turbo Brain System - Supabase Setup Guide

## Phase 1: Supabase Configuration

### Step 1: Run SQL Setup in Supabase

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the contents of `supabase-setup.sql`
5. Click "Run" to execute

This will create:
- `brain_documents` table with all required columns
- Indexes for performance
- Row Level Security (RLS) policies

### Step 2: Create Storage Bucket

1. In Supabase Dashboard, go to "Storage"
2. Click "New bucket"
3. Configure:
   - **Name:** `brain-docs`
   - **Public:** ❌ No (keep private)
   - **File size limit:** 50MB
   - **Allowed MIME types:** 
     - application/pdf
     - text/plain
     - application/msword
     - application/vnd.openxmlformats-officedocument.wordprocessingml.document

4. Click "Create bucket"

### Step 3: Set Storage Policies

After creating the bucket, set up access policies:

1. Click on the `brain-docs` bucket
2. Go to "Policies" tab
3. Add a new policy:
   - **Policy name:** Service role full access
   - **Allowed operation:** All (SELECT, INSERT, UPDATE, DELETE)
   - **Target roles:** service_role
   - **Policy definition:**
     ```sql
     true
     ```

### Step 4: Add Environment Variables to Render

1. Go to your Render dashboard
2. Select your backend service (`turbo-response-backend`)
3. Go to "Environment" tab
4. Add these two variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these values:**
- Go to Supabase Dashboard → Project Settings → API
- **SUPABASE_URL:** Project URL
- **SUPABASE_SERVICE_ROLE_KEY:** service_role key (under "Project API keys")

⚠️ **Important:** Use the `service_role` key, NOT the `anon` key!

### Step 5: Deploy to Render

The code is ready to deploy. After adding the environment variables:

1. Trigger a manual deployment in Render
2. Wait for deployment to complete (2-3 minutes)
3. Check logs for: `[Supabase] Client initialized for Turbo Brain System`

---

## Phase 2: Testing the Brain System

### Upload a Document

```bash
curl -X POST https://turbo-response-backend.onrender.com/api/brain/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "title=IRS Audit Defense Strategy" \
  -F "description=Complete guide for IRS audit responses"
```

**Response:**
```json
{
  "success": true,
  "document": {
    "id": 1,
    "title": "IRS Audit Defense Strategy",
    "description": "Complete guide for IRS audit responses",
    "file_url": "https://your-project.supabase.co/storage/v1/object/public/brain-docs/1234567890_document.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 524288,
    "created_at": "2025-11-21T..."
  }
}
```

### List All Documents

```bash
curl https://turbo-response-backend.onrender.com/api/brain/upload/list?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "title": "IRS Audit Defense Strategy",
      "description": "Complete guide for IRS audit responses",
      "file_url": "https://...",
      "mime_type": "application/pdf",
      "size_bytes": 524288,
      "relevance_score": null,
      "is_outdated": false,
      "is_duplicate": false,
      "is_archived": false,
      "usage_count": 0,
      "last_used_at": null,
      "created_at": "2025-11-21T...",
      "updated_at": "2025-11-21T..."
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

---

## Architecture Notes

✅ **Supabase (Brain System Only):**
- Document storage (brain-docs bucket)
- Document metadata (brain_documents table)
- Future: AI embeddings, semantic search

✅ **Render PostgreSQL (Core Business Data):**
- Cases table
- Clients table
- Authentication
- All existing functionality

❌ **No Changes to Existing Data:**
- Cases stay on Render
- Client portal unchanged
- Authentication unchanged
- Zero breaking changes

---

## Next Steps

After Phase 1 is deployed and tested:
- Phase 2: Add DELETE and PATCH endpoints
- Phase 3: Add semantic search with embeddings
- Phase 4: Build admin UI for document management
- Phase 5: Integrate Brain documents into AI responses
