-- Create client_contracts table for storing signed agreements
CREATE TABLE IF NOT EXISTS client_contracts (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  client_email VARCHAR(320) NOT NULL,
  client_name TEXT NOT NULL,
  ip_address VARCHAR(45),
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  agreement_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add index for faster lookups by case_id
CREATE INDEX IF NOT EXISTS idx_client_contracts_case_id ON client_contracts(case_id);

-- Add contract_signed field to cases table
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS contract_signed BOOLEAN DEFAULT FALSE;

-- Add index for contract_signed
CREATE INDEX IF NOT EXISTS idx_cases_contract_signed ON cases(contract_signed);
