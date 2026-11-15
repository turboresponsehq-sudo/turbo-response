# Money Bosses Command Center — verified status

**Verified November 15, 2026. Development branch:** `feature/money-bosses-command-center` in `turboresponsehq-sudo/turbo-response`.

## Why it is missing from your live dashboard

The Money Bosses module exists in the Turbo Response development branch, not in the deployed production version. `origin/main` is still `3171692e9b21918b6cffda9c0ce867c5aff276c1`; its route definitions and the current public production JavaScript do not contain `/admin/money-bosses`. No Money Bosses branch has been merged or deployed by this task.

There was also a navigation gap: the earlier implementation added a link to `/admin/command-center`, whereas the URL you opened, `/admin`, serves the existing case dashboard. The development version now links to Money Bosses from **both** places, without removing the case dashboard or Creator Automations navigation.

**Earlier descriptions of a completed admin module overstated its operational completeness.** The protected route and administrative UI were implemented, but durable content management and delivery to the public scanner were not connected.

## Working development preview

[Open the Money Bosses Command Center development preview](https://3004-ikxczl2n4gl61dsmk7yof-a46ef21c.us5.manus.computer/admin/money-bosses/preview).

This is the **same MoneyBossesAdmin component** used by the protected admin route, running in an explicitly labeled local-preview mode. It is not a separate administrative platform. The preview loads only approved archive photographs and in-memory drafts; it makes no Money Bosses admin API requests and never loads customer records. Reloading or leaving the panel clears its drafts.

The actual route remains [the protected development admin route](https://3004-ikxczl2n4gl61dsmk7yof-a46ef21c.us5.manus.computer/admin/money-bosses). Anonymous visitors are sent to the existing `/admin/login?next=...` flow. The preview route is declared only when `import.meta.env.DEV` is true; it is excluded from the production route tree. No fake login session or new admin credential was created.

In **Archive Content**, choose **Use existing test clip**, choose a planned release time if desired, save the local draft, select an artwork and the draft, then choose **Assign local draft** and **Play with Sound**. The three references are Tony Tripp, Rod & Tre, and Cow Pac. This uses the existing labeled development MP4 with tone audio, not an approved customer video or an Instagram embed.

## What is completed

| Area | Verified implementation |
|---|---|
| Command Center placement | Money Bosses is inside the existing Turbo repository; links exist on both development admin dashboards. |
| Protection | The actual route uses `AdminSessionGate`; every Money Bosses backend procedure uses `adminProcedure`. Anonymous, ordinary-user and `amani_admin` callers are denied. The existing JWT/current-database-user verification bridge is reused. |
| Administrative UI | Overview, Members, Premium Member Card, Archive Content, QR Destinations, Wallets, Benefits, Announcements and Integrations sections exist. Not every section is operational CRUD. |
| Archive development workflow | Three approved artwork reference assets, local MP4 selection, local draft save/assignment, planned-release metadata and user-gesture sound playback are working in the preview. |
| Backend draft preparation | Protected draft INSERT and artwork/video mapping procedures exist, but persistence has not been validated against staging. HTTPS URLs without embedded credentials are required; Instagram destinations are rejected. |
| QR visibility | The panel identifies the unchanged official garment URL, the published Money Bosses Hub/scanner and the inactive 302 proposal. It cannot activate a redirect. |
| Wallet/membership boundary | Readiness displays exist; issuance, Shopify and membership verification remain disabled. |

## Development fixes made during this check

The blank preview had a real cause: browser module requests included an Origin header, and the existing CORS middleware returned HTTP 500 for the local port and forwarded HTTPS origin. Basic HTTP checks without that header had incorrectly appeared healthy. A narrow development-only origin helper now allows the configured port and one explicitly configured HTTPS origin; it returns no additions in production.

The existing `/admin` dashboard now uses same-origin APIs in development instead of falling back to the live production API. Existing production behavior is unchanged.

The archive panel was extracted and reused rather than creating another application. Draft fields now reset only after confirmed save, failure messages are sanitized, local media URLs are cleaned up on unmount, dates are converted from browser-local time to ISO UTC, and publication remains visibly disabled. Query errors no longer silently masquerade as successful data loading.

A separate staging migration, `0027_money_bosses_archive_release.sql`, adds planned release metadata to an already-existing video table. Adding a column only inside the original `CREATE TABLE IF NOT EXISTS` would not upgrade an older table. The baseline rollback now removes only its own migration marker. No migration was executed.

## What is still missing

| Launch dependency | Exact remaining work |
|---|---|
| Isolated PostgreSQL staging | This development process has no `DATABASE_URL`. No provided isolated PostgreSQL connection is available. Forward/rollback SQL was reviewed and contract-tested, but **not executed against a real database**. Production was not used. |
| Authenticated staging session | Staging has no configured JWT secret/current admin database identity. Authorization denial tests pass, but a real owner login against staging is not verified. |
| Durable video uploads | Current file selection creates a browser-local preview. A controlled object-storage upload service, access limits and media validation are not connected. |
| Registry seeding and editing | Approved artwork IDs must be seeded in staging. Durable story/body editing, rights approval and publish-state controls remain to be implemented. |
| Admin-to-public delivery | The admin database mappings do not yet feed the separately published Money Bosses scanner/Hub. A narrow approved-content API or versioned manifest, keyed by the existing artwork IDs, must connect them. No replacement recognition engine is required. |
| Scheduled releases | Release timestamps are metadata. An authorized publishing mechanism and rollback/versioning are not active. |
| Analytics and email | Remote QR/recognition/video analytics, aggregation and a consented email-capture service are not connected to this admin module. Local public-preview telemetry is not a central database. |
| QR controls | Durable editable destination records and live redirect deployment remain pending. The original asset/encoded URL and production routing remain unchanged. |
| Deferred membership | Verified eligibility, profile persistence/privacy controls, credentials, wallet providers and Shopify remain deferred. Benefits and Announcements are still placeholder sections rather than operating publishing interfaces. |

## Tests and observed results

**18 focused automated tests passed across four files.** These cover unauthorized roles, missing-storage responses, draft URL/date validation, route/navigation protection, original artwork keys and production-disabled development origin additions. Both frontend and backend builds passed.

The controlled HTTPS browser test saved an in-memory draft, assigned it to Tony Tripp and confirmed playback with `paused=false`, `muted=false`, and media readiness `4`. At a 390px viewport, document width was also 390px, with no horizontal overflow. The preview made zero Money Bosses API requests. The actual unauthenticated admin route redirected to login. No page errors were observed after the CORS fix. This is browser/mobile-width testing, not a physical iPhone/Android test or a persistence test.

Repository-wide TypeScript checking still reports two pre-existing Creator errors at `server/modules/creator/creatorWorkspaceRoutes.ts:16` and `server/modules/creator/routes.ts:917`; no Money Bosses-specific compiler errors were found. These unrelated workflows were not rewritten.

Evidence is recorded in `docs/evidence/money-bosses-command-center-check/`; focused tests and changed-file inventory are preserved with this branch.

## What must happen before the live dashboard can use it

First provide or authorize an isolated PostgreSQL staging environment and securely configure its existing admin authentication, without borrowing production data or secrets. Run the baseline and release upgrade, rollback, and repeat-forward tests there. Then connect durable video storage and the approved public content feed, and verify an authenticated owner workflow, publication controls and existing Turbo/Creator regressions.

Resolve the two existing compiler failures and review cross-module authentication/response hardening before release. After an explicit owner approval, merge the reviewed development branch and deploy through the existing Turbo Response release process. That authorized deployment would make the Money Bosses links visible on the live `/admin` and `/admin/command-center` pages. The garment-QR redirect is a separate exact-route change and requires its own approval.

**No production deployment, production migration, Shopify activation, wallet issuance, official QR change or redirect activation occurred.**

## Reproducing the development checks

Run the four focused tests with `pnpm vitest run server/moneyBossesCommandCenter.test.ts server/moneyBossesAdminBehavior.test.ts server/moneyBossesPreview.test.ts server/moneyBossesDevelopmentOrigins.test.ts`.

For the browser workflow, start the existing server with `PORT=3004 MONEY_BOSSES_DEV_ORIGIN=<your-exact-HTTPS-development-origin> pnpm dev`, then run `python3 scripts/money-bosses-preview-check.py`. That optional check requires local Python Playwright and Chromium; it defaults to localhost and accepts `MB_ADMIN_TEST_ORIGIN` for forwarded HTTPS testing. It creates local fixture drafts only and must never be pointed at production. The production CORS allowlist is unaffected.
