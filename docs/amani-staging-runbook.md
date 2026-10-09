# Amani Creator Automations — Staging Runbook

## Boundary

Amani is a **Creator Automations client**. These steps must never use Turbo Response consumer cases, legal workflows, payment paths, or client portals.

## Deployment topology

| Component | Repository | Branch | Render service | Purpose |
|---|---|---|---|---|
| Amani frontend | `turboresponsehq-sudo/amani-mansur-web` | `staging` | `amani-mansur-web` | Amani-only branded site and intake UI |
| Shared backend staging | `turboresponsehq-sudo/turbo-response` | `feat/amani-shared-inquiries` | Existing shared-backend staging service or approved staging clone | Scoped `/api/creator/amani/*` API |

## Staging apply order

1. Set a new `ADMIN_PASSWORD_HASH` and `ADMIN_EMAIL` in the backend staging service. Do not reuse the retired credential.
2. Apply `drizzle/migrations/0017_create_amani_creator_automations.sql` to the approved shared PostgreSQL instance. It creates only the `amani_creator_automations` schema and its additive tables.
3. In a protected Render Shell session, create the restricted `amani_creator_automations_staging` role and grants from `docs/amani-database-role.sql`; store its database URL only in the separate Amani staging API service.
4. Set `AMANI_INQUIRY_CAPTURE_ENABLED=true`.
5. Set `AMANI_ALLOWED_ORIGINS` to the exact Amani staging frontend origin only.
6. Keep `AMANI_HUBSPOT_SYNC_ENABLED=false` during the first database-only submission check.
7. Configure the Amani frontend `VITE_AMANI_API_URL` with the exact shared-backend staging origin.
8. Deploy the frontend staging branch and test all public routes.
9. Set `AMANI_INTERNAL_TEST_TOKEN` in the backend staging environment, then submit one request using the protected `X-Amani-Internal-Test` header and a clearly marked internal-test identity. Verify Amani-scoped relationship, opportunity, and event records.
10. Enable `AMANI_HUBSPOT_SYNC_ENABLED=true`, then submit one new internal test only if `AMANI_HUBSPOT_SYNC_INTERNAL_TESTS=true` has been intentionally approved for the test.
11. Verify one shared HubSpot contact plus one structured Amani note. Do not create a deal, assign a HubSpot owner, or use the Turbo Response deal pipeline.
12. Keep `AMANI_EMAIL_SENDING_ENABLED=false` unless sender and internal recipient values are approved.

## Required staging checks

- `GET /api/creator/amani/health` reports capture enabled.
- A malformed request returns `400` with field-level errors.
- A honeypot-filled request returns success without persisting an opportunity.
- A repeated `clientSubmissionId` does not create a second opportunity.
- Five requests from one source window are allowed; the next request returns `429`.
- A normal request stores `creator_client_key = amani`, relationship owner `AMANI`, and one `inquiry_submitted` event.
- HubSpot handoff is contact-by-email plus structured note only.
- Email is suppressed and logged until approved.

## Production guardrail

Do not alter `amanimansur.info` DNS or move the Manus-hosted site until these staging checks pass and the production cutover is approved.
