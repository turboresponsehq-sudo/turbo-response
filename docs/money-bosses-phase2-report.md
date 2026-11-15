# Money Bosses Phase 2 — Operational Foundation

## Development status

Phase 2 is implemented on `feature/money-bosses-command-center` in the existing Turbo Response repository. No production deployment, production database write, Shopify connection, official QR modification, wallet issuance, or Creator Automations change was made.

Development preview route:

`/admin/command-center` → **Money Bosses**

Direct development route:

`/admin/money-bosses`

Both routes returned HTTP 200 in the isolated development server on port 3004.

## Database and staging

The current sandbox has no `DATABASE_URL`, `PGHOST`, `PGPORT`, or `PGDATABASE`. It also has no `psql`, `pg_isready`, Docker, or Podman executable. No isolated PostgreSQL staging environment is available, so the forward migration and rollback were not executed anywhere. Production was not touched.

The existing migration and rollback remain prepared for a disposable PostgreSQL environment. The migration is covered by deterministic static tests for table names, rollback coverage, privacy fields, Premium Member defaults, provider-disabled defaults, and scanner/membership event separation.

## Premium Member editor

The protected Members section now includes a development-only profile editor with:

- optional preferred display name;
- local profile-photo selection;
- rectangular crop frame;
- horizontal and vertical repositioning;
- zoom control;
- optional photo removal;
- local preview application;
- disabled verified-profile save until the membership service exists.

The editor does not expose public member information and does not persist unverified data.

The approved tall Premium Member portrait card remains the active card reference. The previous Founding Member artwork remains archived and is not used as the active customer-facing design.

## Atlanta Archives content manager

The protected Archive Content section now supports:

- local approved video-file selection for preview;
- HTTPS media destination registration as a draft;
- artwork-to-video assignment through a separate database mapping;
- user-gesture video playback with native controls and sound support;
- explicit draft and migration-pending states;
- no Instagram embedding or Instagram interface;
- no scanner-code changes.

Local file selection is preview-only until approved storage is connected. The backend draft mutation stores only HTTPS destinations after the migration is available, with `draft` and `pending_review` defaults.

## Wallet readiness

Apple Wallet, Google Wallet, and Samsung Wallet remain visible as readiness-only providers. Credentials, certificates, partner approvals, membership eligibility verification, issuance, update, and revocation services remain disabled.

## Validation

Passed:

- targeted Money Bosses migration tests: 3/3;
- frontend production build;
- backend production build;
- `git diff --check`;
- development route checks for `/admin/command-center`, `/admin/money-bosses`, and `/admin/login`.

The repository-wide TypeScript check still has the two unrelated pre-existing errors in `server/modules/creator/creatorWorkspaceRoutes.ts:16` and `server/modules/creator/routes.ts:917`. The missing Google Drive environment credentials also continue to block that existing integration test suite.

## Remaining blockers

1. Disposable isolated PostgreSQL staging environment for forward and rollback execution.
2. Approved member verification service before any profile persistence or membership issuance.
3. Approved object storage and media review workflow before video files can be uploaded durably.
4. Shopify account and integration approval, which remains explicitly on hold.
5. Apple, Google, and Samsung provider accounts, certificates, credentials, and approvals.
6. Focused staging QA and explicit production approval.
