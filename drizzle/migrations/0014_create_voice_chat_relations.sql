-- Phase 3: enable existing Voice/Chat persistence in production without seeding data.
-- These relations match the existing Drizzle schema and intentionally carry no
-- foreign keys so legacy records and historical tables remain untouched.

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER,
  category VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  summary TEXT,
  "messageCount" INTEGER NOT NULL DEFAULT 0,
  "evidenceCount" INTEGER NOT NULL DEFAULT 0,
  "convertedToLead" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  "conversationId" INTEGER NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  "conversationId" INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50),
  "bestTimeToCall" VARCHAR(20),
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  notes TEXT,
  category VARCHAR(50),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_uploads (
  id SERIAL PRIMARY KEY,
  "conversationId" INTEGER NOT NULL,
  "fileKey" VARCHAR(500) NOT NULL,
  "fileUrl" TEXT NOT NULL,
  filename VARCHAR(255),
  "mimeType" VARCHAR(100),
  "fileSize" INTEGER,
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages ("conversationId");
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id ON leads ("conversationId");
CREATE INDEX IF NOT EXISTS idx_evidence_uploads_conversation_id ON evidence_uploads ("conversationId");
