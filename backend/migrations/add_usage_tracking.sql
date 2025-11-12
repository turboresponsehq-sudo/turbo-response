-- AI Usage Tracking Migration
-- Tracks AI analysis runs and costs for admin monitoring

-- Table: ai_usage_logs
-- Records every AI analysis run with cost estimation
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive', -- comprehensive, letter_generation
  tokens_used INTEGER,
  estimated_cost DECIMAL(10, 4), -- Cost in USD
  model_used VARCHAR(50) DEFAULT 'gpt-4',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_usage_created_at (created_at),
  INDEX idx_usage_case_id (case_id)
);

-- Table: admin_settings
-- Stores admin configuration like monthly spending cap
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default monthly cap (NULL = unlimited)
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('monthly_spending_cap', NULL)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default cap warning threshold (80% of cap)
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('cap_warning_threshold', '0.8')
ON CONFLICT (setting_key) DO NOTHING;
