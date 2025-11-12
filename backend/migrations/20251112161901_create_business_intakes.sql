CREATE TABLE IF NOT EXISTS business_intakes (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50),
  business_name VARCHAR(255),
  website_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  link_in_bio TEXT,
  what_you_sell TEXT,
  ideal_customer TEXT,
  biggest_struggle TEXT,
  short_term_goal TEXT,
  long_term_vision TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_business_intakes_email ON business_intakes(email);
CREATE INDEX idx_business_intakes_status ON business_intakes(status);
CREATE INDEX idx_business_intakes_created_at ON business_intakes(created_at DESC);
