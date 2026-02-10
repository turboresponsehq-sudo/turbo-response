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
