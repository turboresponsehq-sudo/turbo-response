-- Create resource_requests table for grant and resource matching system
CREATE TABLE IF NOT EXISTS resource_requests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  resources TEXT[] NOT NULL,
  income_level TEXT NOT NULL,
  household_size TEXT NOT NULL,
  description TEXT NOT NULL,
  demographics TEXT[],
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_resource_requests_status ON resource_requests(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_resource_requests_created_at ON resource_requests(created_at DESC);
