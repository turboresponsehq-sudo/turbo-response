CREATE TABLE IF NOT EXISTS zakhy_visitor_sessions (
  id BIGSERIAL PRIMARY KEY,
  visitor_token VARCHAR(128) NOT NULL,
  session_token VARCHAR(128) NOT NULL,
  entry_route VARCHAR(500) NOT NULL,
  current_route VARCHAR(500) NOT NULL,
  referrer VARCHAR(1000),
  source VARCHAR(100),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  device_type VARCHAR(20) NOT NULL,
  returning BOOLEAN NOT NULL DEFAULT FALSE,
  creator_lead_id BIGINT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT zakhy_visitor_sessions_visitor_token_unique UNIQUE (visitor_token),
  CONSTRAINT zakhy_visitor_sessions_session_token_unique UNIQUE (session_token)
);

CREATE INDEX IF NOT EXISTS idx_zakhy_visitor_sessions_last_seen
  ON zakhy_visitor_sessions (last_seen_at);
CREATE INDEX IF NOT EXISTS idx_zakhy_visitor_sessions_creator_lead
  ON zakhy_visitor_sessions (creator_lead_id);

CREATE TABLE IF NOT EXISTS zakhy_visitor_events (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES zakhy_visitor_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  route VARCHAR(500) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zakhy_visitor_events_session_created
  ON zakhy_visitor_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_zakhy_visitor_events_type_created
  ON zakhy_visitor_events (event_type, created_at);

-- Rollback (manual, only if explicitly approved):
-- DROP TABLE IF EXISTS zakhy_visitor_events;
-- DROP TABLE IF EXISTS zakhy_visitor_sessions;
