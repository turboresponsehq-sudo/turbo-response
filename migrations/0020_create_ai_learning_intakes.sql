-- AI Learning Intake — migration 0020
-- Additive only: isolated from Creator Leads and Creator Intake.
BEGIN;

SELECT pg_advisory_xact_lock(hashtext('ai-learning-intake-0020'));

CREATE TABLE IF NOT EXISTS ai_learning_intakes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(100),
  experience VARCHAR(80) NOT NULL,
  learning_interests JSONB NOT NULL,
  goal TEXT NOT NULL,
  learning_style VARCHAR(80) NOT NULL,
  anything_else TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_learning_intakes_submitted
  ON ai_learning_intakes (submitted_at);

CREATE INDEX IF NOT EXISTS idx_ai_learning_intakes_email
  ON ai_learning_intakes (email);

INSERT INTO schema_migrations (migration_name)
SELECT '0020_create_ai_learning_intakes'
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations
  WHERE migration_name = '0020_create_ai_learning_intakes'
);

COMMIT;
