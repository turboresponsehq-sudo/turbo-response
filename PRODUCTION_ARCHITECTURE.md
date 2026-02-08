# Production Architecture (Render)

**Last Updated:** Feb 8, 2026

## Render Services (3 Active)

1. **turbo-response-backend** (Node.js)
   - Backend API server
   - Handles all /api/* routes
   - Connected to turbo-response-db

2. **turboresponsehq-staging** (Static Site)
   - Frontend React app
   - Serves turboresponsehq.ai domain

3. **turbo-response-db** (PostgreSQL 17)
   - Production database
   - Connected to backend

## Domain Configuration

- **turboresponsehq.ai** → Points to turboresponsehq-staging (frontend)
- Backend API calls go to turbo-response-backend.onrender.com

## Critical Issues (Feb 8, 2026)

### 1. CORS Errors
- Frontend (turboresponsehq.ai) cannot reach backend
- Backend needs to allow turboresponsehq.ai origin

### 2. Screenshot Upload 404
- Endpoint not found or misconfigured
- Check /api/trpc/screenshots.list route

### 3. Brain Delete 400
- "Invalid document ID" error
- ID type mismatch or validation issue

## Deployment Flow

1. Code changes pushed to GitHub (turboresponsehq-sudo/turbo-response)
2. Render auto-deploys from main branch
3. Verify on turboresponsehq.ai

## API Keys & Secrets

Managed via Render dashboard environment variables.
