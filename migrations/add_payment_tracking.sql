-- Add payment tracking columns to cases table

-- Payment status: unpaid, payment_pending (client confirmed), paid (admin verified)
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid' 
CHECK (payment_status IN ('unpaid', 'payment_pending', 'paid'));

-- Payment method: cashapp, venmo, paypal, manual
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);

-- Timestamp when client clicked "I've Completed Payment"
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP;

-- Timestamp when admin verified payment
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP;

-- Admin ID who verified the payment
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS payment_verified_by INTEGER;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_cases_payment_status ON cases(payment_status);

-- Create index for payment confirmation date
CREATE INDEX IF NOT EXISTS idx_cases_payment_confirmed_at ON cases(payment_confirmed_at);
