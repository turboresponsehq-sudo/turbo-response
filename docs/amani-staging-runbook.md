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
2. Apply `drizzle/migrations/0017_create_amani_creator_automations.sql` to the **staging** PostgreSQL database only.
3. Set `AMANI_INQUIRY_CAPTURE_ENABLED=true`.
4. Set `AMANI_ALLOWED_ORIGINS` to the exact Amani staging frontend origin only.
5. Keep `AMANI_HUBSPOT_SYNC_ENABLED=false` during the first database-only submission check.
6. Configure the Amani frontend `VITE_AMANI_API_URL` with the exact shared-backend staging origin.
7. Deploy the frontend staging branch and test all public routes.
8. Set `AMANI_INTERNAL_TEST_TOKEN` in the backend staging environment, then submit one request using the protected `X-Amani-Internal-Test` header and a clearly marked internal-test identity. Verify Amani-scoped relationship, opportunity, and event records.
9. Enable `AMANI_HUBSPOT_SYNC_ENABLED=true`, then submit one new internal test only if `AMANI_HUBSPOT_SYNC_INTERNAL_TESTS=true` has been intentionally approved for the test.
10. Verify one shared HubSpot contact plus one structured Amani note. Do not create a deal, assign a HubSpot owner, or use the Turbo Response deal pipeline.
11. Keep `AMANI_EMAIL_SENDING_ENABLED=false` unless sender and internal recipient values are approved.

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
