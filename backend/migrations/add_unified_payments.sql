-- Unified Payment System Migration
-- Handles both consumer case payments and business infrastructure payments

-- Table: payments
-- Stores all payment transactions for both service types
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  
  -- Service identification
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('consumer_case', 'business_infrastructure')),
  case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL, -- For consumer cases
  business_id INTEGER, -- For business audits (no FK since business_audits table may not exist yet)
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('paypal', 'cashapp', 'venmo')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Client information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(320),
  client_phone VARCHAR(50),
  
  -- Transaction metadata
  transaction_id VARCHAR(255), -- External payment provider transaction ID
  payment_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_payments_service_type (service_type),
  INDEX idx_payments_case_id (case_id),
  INDEX idx_payments_business_id (business_id),
  INDEX idx_payments_status (payment_status),
  INDEX idx_payments_created_at (created_at)
);

-- Add payment tracking to cases table (if column doesn't exist)
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded'));

ALTER TABLE cases
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2);

ALTER TABLE cases
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);

-- Create view for admin dashboard payment summary
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
  id,
  service_type,
  CASE 
    WHEN service_type = 'consumer_case' THEN CONCAT('Case #', case_id)
    WHEN service_type = 'business_infrastructure' THEN CONCAT('Business #', business_id)
  END AS service_reference,
  client_name,
  amount,
  payment_method,
  payment_status,
  created_at,
  completed_at
FROM payments
ORDER BY created_at DESC;
