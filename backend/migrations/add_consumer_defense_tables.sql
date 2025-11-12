-- Add Consumer Defense AI System Tables
-- Based on commit 4f611d3 from turbo-response-repo

-- Case Analysis Table
CREATE TABLE IF NOT EXISTS case_analyses (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  violations TEXT, -- JSON array of violations found
  laws_cited TEXT, -- JSON array of applicable laws
  recommended_actions TEXT, -- JSON array of recommended actions
  urgency_level VARCHAR(20), -- low, medium, high, critical
  estimated_value DECIMAL(10,2), -- Estimated case value
  success_probability DECIMAL(3,2), -- 0-1 probability
  pricing_suggestion DECIMAL(10,2), -- Suggested service price
  summary TEXT, -- Executive summary
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(case_id)
);

-- Draft Letters Table
CREATE TABLE IF NOT EXISTS draft_letters (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  letter_type VARCHAR(50) NOT NULL, -- cease_desist, dispute, demand, appeal
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, under_review, approved, sent, rejected
  ai_analysis TEXT, -- JSON string with violations, laws cited, etc.
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Notifications Table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- new_case, high_value, urgent, review_needed
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_analyses_case_id ON case_analyses(case_id);
CREATE INDEX IF NOT EXISTS idx_draft_letters_case_id ON draft_letters(case_id);
CREATE INDEX IF NOT EXISTS idx_draft_letters_status ON draft_letters(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_case_id ON admin_notifications(case_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON admin_notifications(priority);
