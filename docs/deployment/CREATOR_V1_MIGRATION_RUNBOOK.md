# Creator Lead Capture V1 — Migration Runbook

**Status:** Prepared only. This runbook must not be executed until the Creator V1 deployment and database migration are explicitly approved.

## Source of truth

The production PostgreSQL database has an application-owned `public.schema_migrations` ledger with columns `id`, `migration_name`, and `applied_at`. Its applied records are the production ledger of record. The Drizzle `meta/_journal.json` is not reliable for production migration state because it declares MySQL migrations and ends at 0011.

The PostgreSQL create-only migration files 0012–0016 are visibly applied in production: their tables exist, but they do not appear in `schema_migrations`. This means they were applied outside the ledger (manually or by another deployment mechanism); the ledger does not prove which. Do not attempt to replay them.

The Creator V1 migration is deliberately a new application-owned SQL migration:

```text
migrations/0017_create_creator_lead_capture.sql
```

It creates only four new `creator_*` tables, their constraints, and indexes. It does not alter, update, delete, or query consumer workflow tables.

## Preflight — read only

In the Render **turbo-response-backend** Web Shell, run the following. These commands are read-only.

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -P pager=off -c "
  SELECT migration_name, applied_at
  FROM schema_migrations
  WHERE migration_name = '0017_create_creator_lead_capture'
  LIMIT 1;

  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'creator_leads',
      'creator_lead_events',
      'creator_lead_notes',
      'creator_follow_up_tasks'
    )
  ORDER BY table_name;
"
```

**Expected before the first execution:** zero ledger rows and zero `creator_*` tables. If either result is different, stop; do not run the migration a second time without inspecting the difference.

## Backup before migration

Immediately before the migration, open the Render database **Recovery** tab and use **Create export**. Wait for the export to complete and record its timestamp. Render retains logical database exports for at least seven days. The database also offers Point-in-Time Recovery for any timestamp in the prior seven days.

Do not create an export prematurely—create it directly before the approved migration so it contains the latest consumer data.

## Apply exactly once

After the Creator V1 code is approved and available in the Render service source tree, run:

```bash
cd ~/project/src
psql "$DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -f migrations/0017_create_creator_lead_capture.sql
```

The file has one PostgreSQL transaction. `ON_ERROR_STOP=1` prevents a partial continuation after an error. The migration itself acquires a transaction-scoped advisory lock, uses `CREATE ... IF NOT EXISTS`, and records `0017_create_creator_lead_capture` into the production ledger only after all new tables, indexes, and constraints succeed.

**Do not run `pnpm run db:push`.** Its Drizzle migration journal is incompatible with the production migration history.

## Post-apply verification — read only

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -P pager=off -c "
  SELECT migration_name, applied_at
  FROM schema_migrations
  WHERE migration_name = '0017_create_creator_lead_capture'
  LIMIT 1;

  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'creator_leads',
      'creator_lead_events',
      'creator_lead_notes',
      'creator_follow_up_tasks'
    )
  ORDER BY table_name;
"
```

Expected: one ledger row and all four tables. Then conduct a single controlled Creator Intake submission on the approved Creator route and confirm that only `creator_leads` and `creator_lead_events` receive records.

## Failure and rollback procedure

If `psql` reports an error, stop immediately. Because the file uses `BEGIN`/`COMMIT`, a failure before `COMMIT` rolls back its own transaction and no migration ledger row should exist. Use the preflight query above to confirm that state.

If a verified post-commit issue requires reversal before any real Creator data is accepted, run the following **only after explicit approval**:

```sql
BEGIN;
DROP TABLE IF EXISTS creator_follow_up_tasks;
DROP TABLE IF EXISTS creator_lead_notes;
DROP TABLE IF EXISTS creator_lead_events;
DROP TABLE IF EXISTS creator_leads;
DELETE FROM schema_migrations
WHERE migration_name = '0017_create_creator_lead_capture';
COMMIT;
```

Do not use `DROP` after real Creator data has been accepted. In that case, preserve the data and use the Render logical export or Point-in-Time Recovery only under an explicit recovery decision, because database recovery affects the entire PostgreSQL database—not just Creator V1.

## Phase 2 — Creator email delivery

Creator email delivery is isolated in `server/modules/creator`. It uses the existing SMTP credentials (`EMAIL_USER` and `EMAIL_PASSWORD`) only as a transport mechanism. It never reuses Turbo Response customer-facing sender, recipient, or link configuration.

Set the following Creator-specific variables in Render before any future email-enable approval:

```text
ZAKHY_EMAIL_FROM=
ZAKHY_ADMIN_EMAIL=
ZAKHY_FRONTEND_URL=
CREATOR_EMAIL_SENDING_ENABLED=false
```

Keep `CREATOR_EMAIL_SENDING_ENABLED=false` during development, deployment, and suppression testing. With the gate closed, a Creator inquiry is saved normally and only an `email_suppressed` event is written to `creator_lead_events`; no SMTP connection or message delivery occurs. When a separately approved release sets the gate to `true`, the module validates all five delivery variables (including the two transport credentials), sends the Zakhy-branded admin notification and creator confirmation independently, and records delivery or failure events only in `creator_lead_events`.

Email errors are non-transactional and never undo an already saved Creator lead. Do not enable the gate until sender, admin recipient, and Creator frontend URL have been reviewed and approved.
