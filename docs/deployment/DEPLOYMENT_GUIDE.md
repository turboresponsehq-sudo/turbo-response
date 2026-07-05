# Turbo Response - Deployment Guide

## ✅ Build System Restructure Complete

**Date:** November 19, 2025  
**Status:** Production-Ready  
**Architecture:** Unified Backend + Frontend Deployment

---

## 📋 What Changed

### **New Files:**
1. **`build.sh`** - Bulletproof build script with validation
2. **`serve-frontend.js`** - Frontend serving module (bundled into dist/server.js)
3. **`DEPLOYMENT_GUIDE.md`** - This file

### **Modified Files:**
1. **`package.json`** - Updated build scripts to use `build.sh`
2. **`vite.config.ts`** - Output directory changed to `dist-frontend`
3. **`src/server.js`** - Uses `serve-frontend.js` module

---

## 🏗️ Build Pipeline

The new build system uses a single shell script (`build.sh`) that:

1. **Cleans** all output directories (`dist/`, `dist-frontend/`)
2. **Builds frontend** with Vite → outputs to `dist-frontend/`
3. **Builds backend** with esbuild → outputs to `dist/`
4. **Copies frontend** from `dist-frontend/*` to `dist/public/`
5. **Validates** final structure (checks for required files)
6. **Cleans up** temporary `dist-frontend/` directory

### **Build Commands:**
```bash
# Production build (recommended)
pnpm run build:full

# Or directly
./build.sh

# Individual builds (for development)
pnpm run build:frontend  # Frontend only
pnpm run build:backend   # Backend only
```

---

## 📁 Final Output Structure

After running `./build.sh`, the `dist/` folder will contain:

```
dist/
├── server.js              # Bundled Express backend (108.2kb)
│                          # Includes serve-frontend.js code
├── migrations/            # Database migrations
│   ├── 001_fix_category_constraint.mjs
│   ├── 002_pricing_suggestion_to_text.mjs
│   └── run-migrations.mjs
└── public/                # React frontend (1.5MB total)
    ├── index.html         # Main HTML file (360kb)
    ├── _redirects         # Netlify-style redirects (not used)
    ├── index_original.html # Backup HTML
    └── assets/            # CSS + JS bundles (1.2MB)
        ├── index-BC3t6-4B.css  (160kb)
        └── index-ByUSWuzQ.js   (991kb)
```

---

## 🚀 Render Deployment Configuration

### **Service Type:** Web Service

### **Build Command:**
```bash
pnpm install && pnpm run build:full
```

### **Start Command:**
```bash
node dist/server.js
```

### **Environment Variables:**
All existing environment variables remain unchanged:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `PORT` (auto-set by Render to 10000)
- All other existing env vars

---

## ✅ Deployment Checklist

### **Before Deployment:**
- [x] Build script created (`build.sh`)
- [x] Package.json updated
- [x] Local build tested successfully
- [x] Output structure validated
- [x] serve-frontend.js bundled correctly

### **On Render:**
1. Go to **turbo-response-backend** service
2. Navigate to **Settings**
3. Update **Build Command** to: `pnpm install && pnpm run build:full`
4. Verify **Start Command** is: `node dist/server.js`
5. Click **Save Changes**
6. Go to **Manual Deploy** → **Clear build cache & deploy**

### **After Deployment:**
1. Check logs for: `✓ BUILD SUCCESSFUL`
2. Verify server starts: `🚀 Turbo Response API running on port 10000`
3. **NO ENOENT errors** should appear
4. Test routes:
   - `https://turboresponsehq.ai/` → Homepage
   - `https://turboresponsehq.ai/admin` → Admin (not 404)
   - `https://turboresponsehq.ai/intake` → Intake form (not 404)
   - `https://turboresponsehq.ai/api/health` → JSON response

---

## 🔍 How It Works

### **Path Resolution:**
```javascript
// In serve-frontend.js (bundled into dist/server.js)
const publicPath = path.join(__dirname, 'public');

// When dist/server.js runs on Render:
// __dirname = /opt/render/project/src/dist
// publicPath = /opt/render/project/src/dist/public ✅
```

### **Static File Serving:**
1. Express serves files from `dist/public/` using `express.static()`
2. For non-API routes (e.g., `/admin`, `/intake`), returns `dist/public/index.html`
3. React Router loads and handles client-side routing
4. API routes (e.g., `/api/auth/login`) still return JSON

### **Build Validation:**
The `build.sh` script validates:
- ✅ `dist/server.js` exists
- ✅ `dist/public/index.html` exists
- ✅ `dist/migrations/run-migrations.mjs` exists
- ✅ `dist/public/assets/` directory exists with files

If any validation fails, the build exits with error code 1.

---

## 🐛 Troubleshooting

### **Issue: ENOENT errors in production**
**Cause:** Frontend files not copied to `dist/public/`  
**Solution:** Verify build command is `pnpm run build:full` (not `build:frontend`)

### **Issue: 404 on routes like /admin**
**Cause:** SPA fallback not working  
**Solution:** Check that `serve-frontend.js` is bundled into `dist/server.js`

### **Issue: Build fails on Render**
**Cause:** `build.sh` not executable or missing dependencies  
**Solution:** Ensure `chmod +x build.sh` was committed to git

### **Issue: Assets not loading (404 on CSS/JS)**
**Cause:** `dist/public/assets/` directory missing  
**Solution:** Run `./build.sh` locally and verify assets are copied

---

## 📊 Build Performance

**Local Build Time:** ~5-6 seconds
- Frontend (Vite): ~5s
- Backend (esbuild): <10ms
- File operations: <100ms

**Output Sizes:**
- Backend: 108.2kb (gzipped: ~30kb)
- Frontend: 1.5MB (gzipped: ~380kb)
- Total: 1.6MB

---

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Build logs show `✓ BUILD SUCCESSFUL`
- ✅ Server logs show `🚀 Turbo Response API running on port 10000`
- ✅ No ENOENT errors in logs
- ✅ Homepage loads at `https://turboresponsehq.ai/`
- ✅ Direct route access works (e.g., `/admin`, `/intake`)
- ✅ API endpoints return JSON (e.g., `/api/health`)

---

## 📝 Maintenance

### **To Add New Routes:**
1. Add route in `client/src/App.tsx`
2. Create page component in `client/src/pages/`
3. No server-side changes needed (SPA fallback handles it)

### **To Update Build:**
1. Modify `build.sh` if needed
2. Test locally: `./build.sh`
3. Commit and push
4. Redeploy on Render

### **To Debug Build Issues:**
```bash
# Run build with verbose output
./build.sh

# Check output structure
tree -L 3 dist/

# Verify file sizes
du -sh dist/*
```

---

## 🔐 Security Notes

- Frontend files are served as static assets (no server-side rendering)
- API routes require authentication (handled by Express middleware)
- Environment variables are not exposed to frontend
- CORS is configured for same-origin requests only

---

**End of Deployment Guide**

*Last Updated: November 19, 2025*
