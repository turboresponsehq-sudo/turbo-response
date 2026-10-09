-- Run once against the shared Creator Automations PostgreSQL instance as the
-- database administrator. Replace the password placeholder inside a protected
-- Render Shell session; do not commit or disclose the real secret.

CREATE ROLE amani_creator_automations_staging LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '<SET-IN-RENDER-SHELL>';

DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO amani_creator_automations_staging', current_database());
END $$;
GRANT USAGE ON SCHEMA amani_creator_automations TO amani_creator_automations_staging;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA amani_creator_automations TO amani_creator_automations_staging;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA amani_creator_automations TO amani_creator_automations_staging;

ALTER DEFAULT PRIVILEGES IN SCHEMA amani_creator_automations
  GRANT SELECT, INSERT, UPDATE ON TABLES TO amani_creator_automations_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA amani_creator_automations
  GRANT USAGE, SELECT ON SEQUENCES TO amani_creator_automations_staging;

-- Deliberately no permissions on public, Turbo Response tables, cases, payments,
-- portals, users, or other client data.
