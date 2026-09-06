# Zakhy Live Visitor V1 — Migration Runbook

**Status:** Prepared; production execution is blocked until the fresh Render logical export is downloadable and verified.

## Migration history finding

The production application-owned PostgreSQL ledger is the source of truth. The Drizzle journal is a MySQL journal ending at 0011 and must not be used for production migration execution. The repository contains Creator Lead Capture at `0017_create_creator_lead_capture.sql` and Creator internal-test maintenance at `0018_creator_internal_test_leads.sql`. Therefore Live Visitor V1 is correctly numbered `0019_create_zakhy_live_visitor_v1.sql`.

## Scope

Migration 0019 creates only:

- `zakhy_visitor_sessions`
- `zakhy_visitor_events`

It does not modify consumer tables, Creator tables, authentication tables, email configuration, or Telegram configuration.

## Required backup

Immediately before execution, create a fresh logical export from the Render PostgreSQL Recovery page and verify that the new export has a downloadable `.dir.tar.gz` file. Record the completion timestamp without recording credentials.

## Read-only preflight

Run through the approved authenticated PostgreSQL client bridge or Render Web Shell, without printing `DATABASE_URL`:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -P pager=off -c "
  SELECT migration_name, applied_at
  FROM schema_migrations
  WHERE migration_name IN (
    '0017_create_creator_lead_capture',
    '0018_creator_internal_test_leads',
    '0019_create_zakhy_live_visitor_v1'
  )
  ORDER BY migration_name
  LIMIT 10;

  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('zakhy_visitor_sessions', 'zakhy_visitor_events')
  ORDER BY table_name
  LIMIT 10;
"
```

Expected before execution: no `0019` ledger row and neither visitor table exists. Existing Creator rows/tables may be present and must remain unchanged.

## Execute once

After the application deployment candidate is available and the backup and preflight both pass:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/0019_create_zakhy_live_visitor_v1.sql
```

Do not run `pnpm run db:push`.

## Postflight

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -P pager=off -c "
  SELECT migration_name, applied_at
  FROM schema_migrations
  WHERE migration_name = '0019_create_zakhy_live_visitor_v1'
  LIMIT 1;

  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('zakhy_visitor_sessions', 'zakhy_visitor_events')
  ORDER BY table_name
  LIMIT 10;
"
```

Expected: one ledger row and exactly the two new visitor tables. Then verify a controlled visitor session and heartbeat, protected dashboard authentication, Creator Intake linking, and no writes to consumer or Creator lead tables.

## Telegram gate

Keep `ZAKHY_TELEGRAM_ALERTS_ENABLED=false` or unset. No Telegram bot token or chat ID should be configured during this phase, and no Telegram message should be sent.

## Rollback

If execution fails before commit, the migration transaction rolls back. Stop and verify no ledger row or visitor tables remain. Any post-commit rollback requires separate explicit approval because it affects collected visitor data.
