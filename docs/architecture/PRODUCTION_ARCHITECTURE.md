# Production Architecture (Render)

**Last Updated:** Feb 8, 2026

## Render Services (3 Active)

1. **turbo-response-backend** (srv-d49k7rs9c44c73bnku40)
   - Node.js web service (Standard plan)
   - Repo: turboresponsehq-sudo/turbo-response (main branch)
   - Domain: turboresponsehq.ai
   - Internal: turbo-response-backend:10000
   - Handles all /api/* routes + serves frontend
   - Connected to turbo-response-db

2. **turboresponsehq-staging** (srv-d49i48fdiees73a7tm4g)
   - Node.js web service (Starter plan)
   - Repo: turboresponsehq-sudo/turbo-response (feat/admin-auth branch)
   - URL: https://turboresponsehq-staging.onrender.com
   - Used for testing admin features

3. **turbo-response-db** (dpg-d49jde15pdvs73cuts60-a)
   - PostgreSQL 17 (Basic-256mb)
   - Region: Virginia (US East)
   - Status: Available
   - Connected to both backend services

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
