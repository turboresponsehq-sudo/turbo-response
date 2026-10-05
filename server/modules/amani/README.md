# Amani Creator Automations Module

This module supports **Amani Mansur as a Creator Automations client**.

## Scope

- Amani website inquiry capture
- One relationship record per email within the `amani` client key
- Opportunity records, internal routing metadata, and event history
- Optional shared HubSpot contact deduplication plus structured-note handoff

## Non-scope

- Turbo Response consumer intake, cases, portals, payments, or legal workflows
- Separate CRM creation
- Unapproved email, booking, payment, or contract automation

## Ownership principle

`relationship_owner` defaults to `AMANI`. A technical or other internal handoff can change `implementation_owner` and `handoff_destination` without creating a duplicate contact or losing Amani’s relationship history.
