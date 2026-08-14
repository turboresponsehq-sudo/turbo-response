-- Production-safe additive fields for idempotent Mission Control intelligence.
-- No existing business record is copied, changed, or deleted.

ALTER TABLE turbo_signals
  ADD COLUMN IF NOT EXISTS source_event_key varchar(255),
  ADD COLUMN IF NOT EXISTS source_entity_type varchar(50),
  ADD COLUMN IF NOT EXISTS source_entity_id integer;

ALTER TABLE mission_tasks
  ADD COLUMN IF NOT EXISTS source_event_key varchar(255),
  ADD COLUMN IF NOT EXISTS source_entity_type varchar(50),
  ADD COLUMN IF NOT EXISTS source_entity_id integer;

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS legacy_case_id integer;

CREATE UNIQUE INDEX IF NOT EXISTS uq_turbo_signals_source_event_key
  ON turbo_signals (source_event_key)
  WHERE source_event_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_mission_tasks_source_event_key
  ON mission_tasks (source_event_key)
  WHERE source_event_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pipeline_opportunities_signal_id
  ON pipeline_opportunities (signal_id)
  WHERE signal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workspaces_legacy_case_id
  ON workspaces (legacy_case_id)
  WHERE legacy_case_id IS NOT NULL;
