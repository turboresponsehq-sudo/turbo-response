# 🚀 BRAIN SYSTEM - QUICK START

## ONE-COMMAND SETUP

### Step 1: Get Supabase Credentials (2 min)

1. Go to https://supabase.com/dashboard
2. Select your project → **Settings** → **API**
3. Copy:
   - **Project URL**
   - **service_role** key (secret, not anon)

### Step 2: Add to .env (30 sec)

```bash
cd /home/ubuntu/turbo-response-live
nano .env
```

Add these lines:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 3: Run Setup (30 sec)

```bash
node scripts/setup-brain-system.js
```

**Done!** ✅

---

## What It Does

- Creates `brain_documents` table
- Creates `brain-docs` storage bucket  
- Uploads Consumer Defense Blueprint
- Verifies everything works

---

## Test It

```bash
curl https://turbo-response-backend.onrender.com/api/brain/list \
  -H "x-access-token: TR-SECURE-2025"
```

Should return the uploaded blueprint document.

---

## Add to Render (Production)

1. Render Dashboard → `turbo-response-backend` → **Environment**
2. Add same two variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Save (auto-redeploys)

---

**Need help?** See `BRAIN_SETUP_INSTRUCTIONS.md` for full details.
