-- Create admin_cases table
CREATE TABLE IF NOT EXISTS admin_cases (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  description TEXT,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for admin_cases
CREATE INDEX IF NOT EXISTS idx_admin_cases_category ON admin_cases(category);
CREATE INDEX IF NOT EXISTS idx_admin_cases_status ON admin_cases(status);
CREATE INDEX IF NOT EXISTS idx_admin_cases_created_at ON admin_cases(created_at);

-- Create admin_case_documents table (separate from case_documents)
CREATE TABLE IF NOT EXISTS admin_case_documents (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES admin_cases(id) ON DELETE CASCADE,
  file_key VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  note TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for admin_case_documents
CREATE INDEX IF NOT EXISTS idx_admin_case_documents_case_id ON admin_case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_admin_case_documents_uploaded_at ON admin_case_documents(uploaded_at);

-- Verify tables were created
SELECT 'admin_cases table created' AS status, COUNT(*) AS row_count FROM admin_cases;
SELECT 'admin_case_documents table created' AS status, COUNT(*) AS row_count FROM admin_case_documents;
