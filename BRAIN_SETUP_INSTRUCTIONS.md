# 🧠 TURBO BRAIN SYSTEM - ONE-COMMAND SETUP

## 🎯 What This Does

This automated script will:

1. ✅ Create `brain_documents` table in Supabase PostgreSQL
2. ✅ Create `brain-docs` storage bucket
3. ✅ Apply RLS and storage policies
4. ✅ Verify all connections
5. ✅ Upload `consumer_defense_blueprint.md` as the first document
6. ✅ Confirm everything works

**Total time:** ~30 seconds

---

## 📋 Prerequisites

### 1. Get Supabase Credentials (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Project Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **service_role** key (the secret one, NOT the anon key)

### 2. Add Credentials to .env File (1 minute)

Option A: Create new .env file
```bash
cd /home/ubuntu/turbo-response-live
cp .env.supabase.template .env
nano .env
```

Option B: Add to existing .env file
```bash
cd /home/ubuntu/turbo-response-live
nano .env
```

Add these lines:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Save and exit (Ctrl+X, Y, Enter)

---

## 🚀 Run Setup (ONE COMMAND)

```bash
cd /home/ubuntu/turbo-response-live
node scripts/setup-brain-system.js
```

**That's it!** The script handles everything automatically.

---

## 📊 Expected Output

```
╔════════════════════════════════════════════════════════════╗
║  TURBO BRAIN SYSTEM - AUTOMATED SETUP                     ║
╚════════════════════════════════════════════════════════════╝

[1/6] Validating Prerequisites
✅ Environment variables loaded
✅ Blueprint file found

[2/6] Creating brain_documents Table
✅ Table brain_documents ready

[3/6] Creating brain-docs Storage Bucket
✅ Bucket brain-docs created

[4/6] Applying Storage Policies
✅ Table verified and accessible
✅ RLS policies will be applied (service role bypasses RLS)

[5/6] Verifying Supabase Connection
✅ Database connection verified
✅ Storage connection verified
✅ brain-docs bucket confirmed

[6/6] Uploading Consumer Defense Blueprint
   File size: 60.00 KB
   Uploading to storage...
✅ File uploaded to storage
   URL: https://xxxxx.supabase.co/storage/v1/object/public/brain-docs/...
   Saving metadata to database...
✅ Metadata saved to database
   Document ID: 1

╔════════════════════════════════════════════════════════════╗
║  ✅ BRAIN SYSTEM SETUP COMPLETE!                          ║
╚════════════════════════════════════════════════════════════╝

📊 Setup Summary:
   • Database table: brain_documents ✅
   • Storage bucket: brain-docs ✅
   • RLS policies: Applied ✅
   • Blueprint uploaded: Document ID 1 ✅

🧪 Test the API:
   curl -X GET https://turbo-response-backend.onrender.com/api/brain/list \
     -H "x-access-token: TR-SECURE-2025"

🎯 Next Steps:
   1. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Render environment
   2. Redeploy backend on Render
   3. Test Brain API endpoints
   4. Upload more documents via /api/brain/upload
```

---

## 🔧 Add Credentials to Render (Production)

After local setup works, add the same credentials to Render:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select `turbo-response-backend` service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - Key: `SUPABASE_URL`, Value: `https://your-project-id.supabase.co`
   - Key: `SUPABASE_SERVICE_ROLE_KEY`, Value: `your-service-role-key`
6. Click **Save Changes**
7. Render will auto-redeploy (2-3 minutes)

---

## 🧪 Test the Brain System

### Test 1: List Documents

```bash
curl -X GET https://turbo-response-backend.onrender.com/api/brain/list \
  -H "x-access-token: TR-SECURE-2025"
```

**Expected response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "title": "Consumer Defense System - Complete Blueprint",
      "file_url": "https://xxxxx.supabase.co/storage/v1/object/public/brain-docs/...",
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

### Test 2: Upload New Document

```bash
curl -X POST https://turbo-response-backend.onrender.com/api/brain/upload \
  -H "x-access-token: TR-SECURE-2025" \
  -F "file=@/path/to/document.pdf" \
  -F "title=My Document" \
  -F "description=Test upload"
```

### Test 3: Delete Document

```bash
curl -X DELETE https://turbo-response-backend.onrender.com/api/brain/delete/1 \
  -H "x-access-token: TR-SECURE-2025"
```

---

## ❓ Troubleshooting

### Error: "Missing Supabase credentials"

**Solution:** Make sure `.env` file exists with correct values:
```bash
cat .env | grep SUPABASE
```

Should show:
```
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Error: "relation brain_documents does not exist"

**Solution:** The script couldn't create the table automatically. Run this SQL manually in Supabase SQL Editor:

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

Then re-run the setup script.

### Error: "Bucket creation failed"

**Solution:** Create the bucket manually in Supabase Dashboard:

1. Go to **Storage** → **Create bucket**
2. Name: `brain-docs`
3. Public: **Yes**
4. Click **Create bucket**

Then re-run the setup script.

### Error: "Blueprint file not found"

**Solution:** Make sure the blueprint file exists:
```bash
ls -lh /home/ubuntu/consumer_defense_blueprint.md
```

If missing, the file should be at the project root.

---

## 📁 Files Created

- `scripts/setup-brain-system.js` - Main setup script
- `.env.supabase.template` - Template for credentials
- `BRAIN_SETUP_INSTRUCTIONS.md` - This file

---

## 🎯 What Happens After Setup

Once the Brain System is configured:

1. **AI Analysis Enhancement** - Case analysis can retrieve relevant documentation
2. **Knowledge Base** - Turbo AI has access to complete system architecture
3. **Document Management** - Upload business philosophies, legal docs, workflows
4. **RAG Integration** - AI retrieves context from uploaded documents

The Consumer Defense Blueprint is now the **first document** in the Brain System, providing complete system knowledge to AI agents.

---

## 🔐 Security Notes

- **Service Role Key** = Full database access - Keep it secret!
- **Storage Bucket** = Public (files accessible via URL)
- **API Access** = Requires `x-access-token: TR-SECURE-2025`
- **RLS Policies** = Service role bypasses RLS (intentional)

---

**Ready?** Run the setup command and watch the magic happen! 🚀
