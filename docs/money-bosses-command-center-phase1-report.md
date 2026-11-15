# Money Bosses Command Center — Phase 1 report

## Branch and safety

Implemented on the dedicated branch `feature/money-bosses-command-center`, based on Turbo Response `main`. No production deployment, production database write, Turbo Response route change on the live service, or Creator Automations workflow change was performed.

The public Money Bosses website, Atlanta Archives scanner, QR system, MB Private portal, and MB–001 artwork remain separate. The new module is admin-only.

## Delivered

### Protected route and navigation

- Added protected route: `/admin/money-bosses`.
- Added a Money Bosses navigation action to `/admin/command-center`.
- Reused `AdminSessionGate`, `AdminAuthContext`, existing JWT/session behavior, and the current admin permission boundary.
- The module does not create a second login or customer registration system.

### Dashboard sections

The development dashboard includes:

- Overview
- Members
- Membership Cards
- Archive Content
- QR Destinations
- Wallets
- Benefits
- Announcements
- Integrations

The UI is responsive for desktop and narrow mobile widths. It is intentionally operational and restrained rather than a second public brand site.

### Preserved artwork

The original approved MB–001 Founding Member artwork was copied into the branch as a preserved reference and is now archived. The current active admin-module card is the supplied Premium Member portrait design. See `docs/money-bosses-premium-member-card-follow-up.md` for both checksums and paths.

The archived MB–001 artwork is stored at:

`client/public/money-bosses/archive/mb-001-founding-member-card-archived.jpg`

SHA-256:

`c43815a2eee80b3b75f9ed6321a7991305ab367157010bed2525bab8ca9d1a7e`

The source checksum matches the approved Money Bosses repository asset.

### Protected backend router

Added `server/routers/moneyBossesRouter.ts` and registered it in `server/routers.ts` as `moneyBosses`.

The router provides protected development endpoints for:

- overview/readiness;
- members list;
- archive artwork/video registry list;
- integration status.

When the migration is not applied, the router returns an explicit `migration_pending` state rather than inventing records.

### Dedicated migration

Added:

- `migrations/0026_create_money_bosses_command_center.sql`
- `migrations/0026_create_money_bosses_command_center.down.sql`

The migration creates only `mb_`-prefixed tables for memberships, membership events, wallet statuses, archive artwork/video registry, QR destinations, benefits, announcements, scan events, and integration readiness.

Member records include optional preferred names and profile-photo references, photo consent, deletion-request timestamps, soft deletion, and opaque credential-reference storage. Provider defaults are `not_configured`; no pass is issued.

## Validation

### Passed

- `pnpm build:frontend`
- `pnpm build:backend`
- Migration static contract review: 11 tables, reversible down migration, disabled wallet defaults, explicit privacy fields.
- Targeted migration tests in `server/moneyBossesCommandCenter.test.ts`.
- Frontend build includes `/admin/money-bosses` and the new dashboard module.
- `git diff --check`.

### Existing repository blockers

`pnpm check` is currently blocked by two pre-existing TypeScript errors outside the Money Bosses files:

- `server/modules/creator/creatorWorkspaceRoutes.ts:16`
- `server/modules/creator/routes.ts:917`

The full test suite has 88 passing tests and 4 skipped tests, with one existing Google Drive credential suite failing because this audit environment has no Google Drive test credentials. No Money Bosses test failure was observed.

### Non-production database review

The sandbox has no `psql`, `docker`, `pg_dump`, or non-production `DATABASE_URL` available. Therefore the migration was not executed against a live database in this environment. It was reviewed statically and with deterministic tests only. Applying it to a disposable staging database remains a required activation step before any production migration.

## Remaining activation dependencies

1. Disposable PostgreSQL staging database and migration owner approval.
2. Final role/permission decision for Money Bosses administrators.
3. Approved Shopify store domain, app type, scopes, customer/order access, signed webhooks, and reconciliation process.
4. Server-side membership eligibility and revocation service.
5. Apple Developer account, Pass Type ID, certificate, signing/update service.
6. Google Wallet issuer account, Cloud project, service account, Pass Class, and publishing access.
7. Samsung Wallet partner onboarding, card ID, CSR/encryption, and certification.
8. Approved Drive/content source configuration and media review.
9. Production branch review, migration review, focused staging QA, and explicit deployment approval.

## Not activated

- No Shopify connection.
- No wallet provider credentials.
- No membership issuance.
- No qualifying-purchase verification.
- No membership QR issuance.
- No wallet pass generation.
- No production deployment.
