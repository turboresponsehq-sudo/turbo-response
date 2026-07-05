# AI Usage Tracking Migration Instructions

## Problem
Backend is crashing with error: `relation "ai_usage_logs" does not exist`

## Solution
Run the migration script to create the missing table.

---

## ✅ EXECUTION INSTRUCTIONS

### Step 1: Open Render Shell

1. Go to Render Dashboard: https://dashboard.render.com
2. Select service: **turbo-response-backend** (or your backend service name)
3. Click **"Shell"** tab in the top navigation
4. Wait for shell to connect

### Step 2: Run Migration Command

Copy and paste this EXACT command into the Render Shell:

```bash
node backend/run-usage-tracking-migration.js
```

### Step 3: Verify Success

You should see output like this:

```
🚀 Starting AI Usage Tracking Migration...

📄 Loaded migration: /opt/render/project/src/backend/migrations/add_usage_tracking.sql
📏 SQL length: XXX characters

🔌 Connecting to database...
✅ Connected to database

⚙️  Executing migration SQL...
✅ Migration executed successfully

🔍 Verifying tables...
✅ Tables verified:
   - admin_settings
   - ai_usage_logs

✅ Admin settings initialized:
   - cap_warning_threshold: 0.8
   - monthly_spending_cap: NULL

🎉 Migration completed successfully!
   The backend should now start without errors.

🔌 Database connection closed
```

### Step 4: Restart Backend Service

After migration completes:

1. Go back to Render Dashboard
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
3. OR just click **"Restart"** button
4. Wait for service to restart (~30 seconds)

### Step 5: Verify Fix

1. Visit https://turboresponsehq.ai/admin/case/11
2. Page should load without 502 error
3. Click "Run AI Analysis" button
4. Should work without crashing

---

## ⚠️ Troubleshooting

### If you see "Tables already exist"
This is SAFE. The migration was already run. Backend should work now.

### If you see "DATABASE_URL not set"
The Render Shell should have DATABASE_URL automatically. If not:
1. Check Environment Variables in Render Dashboard
2. Ensure DATABASE_URL is set
3. Restart the shell

### If migration fails with connection error
1. Check database is running
2. Verify DATABASE_URL is correct
3. Check database firewall allows Render connections

---

## 📊 What This Migration Does

Creates 2 tables:

### 1. `ai_usage_logs`
Tracks every AI analysis run with cost estimation:
- case_id (references cases table)
- analysis_type (comprehensive, letter_generation)
- tokens_used
- estimated_cost (in USD)
- model_used (default: gpt-4)
- created_at

### 2. `admin_settings`
Stores admin configuration:
- monthly_spending_cap (NULL = unlimited)
- cap_warning_threshold (default: 0.8 = 80%)

---

## 🔄 After Migration

The backend will:
- ✅ Start without errors
- ✅ Log AI usage to ai_usage_logs table
- ✅ Track costs for admin monitoring
- ✅ Support future spending cap features

---

## 📞 Need Help?

If migration fails, send me:
1. Full error message from Render Shell
2. Screenshot of Render logs
3. Database connection status

I'll diagnose and provide fix immediately.
