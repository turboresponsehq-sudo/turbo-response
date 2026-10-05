# Amani Creator Automations — Render Environment Contract

The Amani feature is **closed by default**. It may be prepared in source control without accepting public traffic.

## Required to enable public Amani inquiry capture

```dotenv
AMANI_INQUIRY_CAPTURE_ENABLED=true
AMANI_ALLOWED_ORIGINS=https://<amani-staging-host>,https://amanimansur.info,https://www.amanimansur.info
AMANI_INTERNAL_TEST_TOKEN=<staging-only secret used with the X-Amani-Internal-Test header>
```

## Optional shared HubSpot contact-and-note handoff

```dotenv
AMANI_HUBSPOT_SYNC_ENABLED=true
# Existing shared secret; do not add it to source control:
HUBSPOT_PRIVATE_APP_TOKEN=<existing shared token>
```

## Optional visitor confirmation and internal notification

```dotenv
AMANI_EMAIL_SENDING_ENABLED=true
AMANI_EMAIL_FROM=<approved Amani sender address>
AMANI_INTERNAL_NOTIFICATION_EMAIL=<approved internal recipient>
# Existing technical transport settings; never commit their values:
EMAIL_USER=<smtp username>
EMAIL_PASSWORD=<smtp app password>
```

Behavior when enabled:

1. Amani inquiry stores in `amani_relationships`, `amani_opportunities`, and `amani_opportunity_events`.
2. A contact is matched by normalized email in the existing shared HubSpot account.
3. The existing contact is updated or one contact is created.
4. A structured Amani inquiry note is attached to the contact.
5. Amani remains the relationship owner in Amani’s internal records.
6. No deal, pipeline, task, email, or payment is created by this first release.

## Internal-test guard

Internal test inquiries are stored but do not sync to HubSpot unless explicitly enabled:

```dotenv
AMANI_HUBSPOT_SYNC_INTERNAL_TESTS=true
```

## Not enabled in this release

- Live visitor confirmation email
- Amani owner assignment in HubSpot
- Deal creation
- Automated follow-up sequences
- Calendar booking
- Payments or contracts

These remain gated until owners, pipeline, message copy, and notifications are formally approved.
