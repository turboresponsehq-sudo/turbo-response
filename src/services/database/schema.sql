-- Turbo Response Database Schema
-- All statements are idempotent (safe to run multiple times)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cases table (intake submissions)
CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('eviction', 'debt', 'irs', 'wage', 'medical', 'benefits', 'auto', 'consumer')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  
  -- Contact information
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  
  -- Case details
  case_details TEXT NOT NULL,
  amount DECIMAL(10, 2),
  deadline DATE,
  documents JSONB DEFAULT '[]',
  
  -- AI Blueprint
  blueprint_generated BOOLEAN DEFAULT FALSE,
  blueprint_content TEXT,
  blueprint_generated_at TIMESTAMP,
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_amount DECIMAL(10, 2),
  payment_plan VARCHAR(50),
  stripe_payment_id VARCHAR(255),
  
  -- Source/Session Tracking (Gap 2: Intelligence Capture)
  referrer_url TEXT,                                 -- Where visitor came from
  utm_source TEXT,                                   -- Marketing source
  utm_medium TEXT,                                   -- Marketing medium
  utm_campaign TEXT,                                 -- Marketing campaign
  landing_page TEXT,                                 -- First page visited
  device_type TEXT,                                  -- mobile/desktop/tablet
  session_id TEXT,                                   -- Session identifier
  visitor_id TEXT,                                   -- Persistent visitor ID
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource requests table (grant/resource intake submissions)
-- Source of truth for all intake form submissions
CREATE TABLE IF NOT EXISTS resource_requests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  resources TEXT,                                    -- JSON array of selected resource types
  income_level TEXT,                                 -- Selected income bracket
  household_size TEXT,                               -- Household count
  description TEXT NOT NULL,                         -- Free-text situation description
  demographics TEXT,                                 -- JSON array of demographic tags
  status TEXT DEFAULT 'new'                          -- Workflow: new/reviewed/matched/closed/spam/deleted
    CHECK (status IN ('new', 'reviewed', 'matched', 'closed', 'spam', 'deleted')),
  ip_address TEXT,                                   -- Client IP for audit/rate-limit tracking
  honeypot_triggered BOOLEAN DEFAULT FALSE,          -- Spam flag (honeypot field was filled)
  deleted_at TIMESTAMP WITH TIME ZONE,               -- Soft delete timestamp
  deleted_by TEXT,                                   -- Who deleted (admin email)
  delete_reason TEXT,                                -- Why deleted
  
  -- Source/Session Tracking (Gap 2: Intelligence Capture)
  referrer_url TEXT,                                 -- Where visitor came from
  utm_source TEXT,                                   -- Marketing source
  utm_medium TEXT,                                   -- Marketing medium
  utm_campaign TEXT,                                 -- Marketing campaign
  landing_page TEXT,                                 -- First page visited
  device_type TEXT,                                  -- mobile/desktop/tablet
  session_id TEXT,                                   -- Session identifier
  visitor_id TEXT,                                   -- Persistent visitor ID
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- File uploads metadata (Gap 5: Upload Intelligence)
-- Tracks every file upload with entity linkage and metadata
CREATE TABLE IF NOT EXISTS file_uploads (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,                         -- cases, resource_requests, chat_sessions, etc.
  entity_id INTEGER NOT NULL,                        -- ID of the related entity
  file_name TEXT NOT NULL,                           -- Original filename
  file_size INTEGER,                                 -- Size in bytes
  mime_type TEXT,                                    -- MIME type (image/png, application/pdf, etc.)
  storage_path TEXT NOT NULL,                        -- Where file is stored (S3 path, local path, etc.)
  storage_url TEXT,                                  -- Public URL if applicable
  uploaded_by TEXT,                                  -- User email or 'anonymous'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Login audit trail (Gap 4: Security + Intelligence)
-- Tracks every login attempt for security and user behavior intelligence
CREATE TABLE IF NOT EXISTS login_audit (
  id SERIAL PRIMARY KEY,
  user_type TEXT NOT NULL,                           -- admin, user, visitor
  email TEXT NOT NULL,                               -- Email used for login attempt
  success BOOLEAN NOT NULL,                          -- TRUE if login succeeded
  ip_address TEXT,                                   -- Client IP
  user_agent TEXT,                                   -- Browser/device info
  failure_reason TEXT,                               -- Why login failed (if applicable)
  session_id TEXT,                                   -- Session ID if login succeeded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Intelligence outcomes table (Gap 3: Feedback Loop)
-- Records every outcome/feedback for every action to make the system smarter
CREATE TABLE IF NOT EXISTS intelligence_outcomes (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,                         -- cases, resource_requests, chat_sessions, etc.
  entity_id INTEGER NOT NULL,                        -- ID of the related entity
  outcome_type TEXT NOT NULL,                        -- match_applied, match_approved, case_won, letter_sent, chat_converted, etc.
  outcome_details JSONB,                             -- Structured details about the outcome
  confidence_score DECIMAL(3, 2),                    -- 0.00-1.00 confidence in this outcome
  recorded_by TEXT,                                  -- admin email or 'system'
  notes TEXT,                                        -- Free-text notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat sessions table (Floating Chat Widget intelligence capture)
-- Stores every visitor chat session with metadata
CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,              -- UUID for this session
  visitor_id TEXT NOT NULL,                      -- Persistent visitor ID (localStorage)
  page_url TEXT NOT NULL,                        -- Page where chat was opened
  referrer_url TEXT,                             -- Where visitor came from
  device_type TEXT,                              -- mobile/desktop
  user_agent TEXT,                               -- Full UA string
  ip_address TEXT,                               -- Client IP
  status TEXT DEFAULT 'active'                   -- active/completed/abandoned
    CHECK (status IN ('active', 'completed', 'abandoned')),
  message_count INTEGER DEFAULT 0,               -- Number of messages in this session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table (Floating Chat Widget intelligence capture)
-- Stores every message (user + AI) in every chat session
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,                         -- Message text
  tokens_used INTEGER DEFAULT 0,                 -- Tokens consumed (if using external AI)
  model TEXT,                                    -- AI model used (if applicable)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_chat_history_case_id ON chat_history(case_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_requests_status ON resource_requests(status);
CREATE INDEX IF NOT EXISTS idx_resource_requests_email ON resource_requests(email);
CREATE INDEX IF NOT EXISTS idx_resource_requests_created_at ON resource_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor_id ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_login_audit_email ON login_audit(email);
CREATE INDEX IF NOT EXISTS idx_login_audit_created_at ON login_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_outcomes_entity ON intelligence_outcomes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_outcomes_type ON intelligence_outcomes(outcome_type);

-- Create updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at (idempotent using DO block)
DO $$
BEGIN
  -- Trigger for users table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Trigger for cases table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_cases_updated_at'
  ) THEN
    CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
