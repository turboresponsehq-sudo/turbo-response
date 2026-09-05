-- Creator Lead Capture maintenance — migration 0018
-- Adds an additive internal-test marker to Creator leads only.
-- No consumer tables, events, or authentication records are changed.

BEGIN;

SELECT pg_advisory_xact_lock(hashtext('creator-internal-test-leads-0018'));

ALTER TABLE creator_leads
  ADD COLUMN IF NOT EXISTS is_internal_test BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE creator_leads
SET is_internal_test = TRUE,
    updated_at = NOW()
WHERE id IN (1, 2, 3, 4, 5);

CREATE INDEX IF NOT EXISTS idx_creator_leads_internal_test_submitted
  ON creator_leads (is_internal_test, submitted_at DESC);

INSERT INTO schema_migrations (migration_name)
SELECT '0018_creator_internal_test_leads'
WHERE NOT EXISTS (
  SELECT 1
  FROM schema_migrations
  WHERE migration_name = '0018_creator_internal_test_leads'
);

COMMIT;
