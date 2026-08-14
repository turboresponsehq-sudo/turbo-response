-- Google OAuth connection for the single canonical Turbo Response Drive folder.
-- Stores only encrypted refresh-token material; no document data is inserted here.

CREATE TABLE IF NOT EXISTS google_drive_oauth_connections (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  refresh_token_ciphertext TEXT NOT NULL,
  scopes TEXT NOT NULL,
  folder_id VARCHAR(255) NOT NULL,
  authorized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS google_drive_oauth_states (
  state_hash CHAR(64) PRIMARY KEY,
  initiated_by_user_id INTEGER,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_drive_oauth_states_expires_at
  ON google_drive_oauth_states (expires_at);
