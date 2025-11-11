# Turbo Response Backend API

Complete REST API backend for Turbo Response - AI-Powered Consumer Defense platform.

## Features

- **Authentication** - JWT-based user authentication with bcrypt password hashing
- **AI Blueprint Generation** - OpenAI GPT-4 powered legal response blueprints
- **AI Chat** - Contextual AI assistant for case guidance
- **Payment Processing** - Stripe integration with webhook handling
- **Admin Dashboard** - Complete case management and analytics
- **Case Management** - Intake submission, tracking, and status updates

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **AI:** OpenAI GPT-4 Turbo
- **Payments:** Stripe
- **Authentication:** JWT + bcrypt

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Intake & Cases
- `POST /api/intake/submit` - Submit new case
- `GET /api/cases` - Get user's cases (requires auth)
- `GET /api/cases/:case_id` - Get case details (requires auth)

### AI Features
- `POST /api/blueprint/generate` - Generate AI blueprint (requires auth)
- `GET /api/blueprint/:case_id` - Get existing blueprint (requires auth)
- `POST /api/chat` - Send chat message (requires auth)
- `GET /api/chat/history/:case_id` - Get chat history (requires auth)

### Payment
- `POST /api/payment/create-checkout` - Create Stripe checkout (requires auth)
- `POST /api/payment/webhook` - Stripe webhook handler
- `GET /api/payment/status/:case_id` - Get payment status (requires auth)

### Admin (requires admin role)
- `GET /api/admin/submissions` - Get all submissions
- `GET /api/admin/submissions/:id` - Get submission details
- `PATCH /api/admin/submissions/:id` - Update submission
- `DELETE /api/admin/submissions/:id` - Delete submission
- `GET /api/admin/stats` - Get dashboard statistics

## Environment Variables

Required environment variables:

```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
FRONTEND_URL=https://your-frontend-url.com
```

## Deployment on Render

### Step 1: Create Web Service

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** turbo-response-api
   - **Region:** Oregon (US West)
   - **Branch:** main
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 2: Add Environment Variables

Add all required environment variables in the Render dashboard under "Environment" tab.

### Step 3: Connect Database

Link your PostgreSQL database instance to the web service.

### Step 4: Deploy

Click "Create Web Service" and Render will automatically:
1. Install dependencies
2. Initialize database schema
3. Start the API server

## Database Schema

The database schema is automatically initialized on first deployment. Tables include:

- `users` - User accounts
- `cases` - Case submissions and details
- `chat_history` - AI chat conversation history
- `admin_logs` - Admin activity tracking

## Development

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Production Build
```bash
npm start
```

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Admin role verification
- Stripe webhook signature verification
- SQL injection protection via parameterized queries
- CORS configured for frontend domain only

## Support

For issues or questions, contact the development team.
