# Turbo Response — Small-Business Relaunch (preview branch)

## Objective
Reuse the existing Turbo Systems front-end as the public-facing small-business operations experience for Turbo Response, without rebuilding the application or disturbing the consumer-rights backend.

## Changes
- New homepage: existing TurboSystems component, with its original visuals and layout preserved and service copy tailored to small businesses.
- /turbo-systems and /services point to the restored small-business service experience.
- Prior homepage and services content preserved at /legacy-home and /legacy-services.
- Consumer solutions and all backend routes remain intact, but consumer-rights services are no longer promoted from the new homepage.
- New service focus: intake/lead capture, follow-ups, CRM, AI assistants, reporting, and system integrations.
- Front-end inquiry CTAs use the existing public business email. The old /turbo-intake form and /api/turbo-intake backend still classify inquiries as offense cases and must not be reused for small-business inquiries without a separate review.
- No deployment or edits to main, Amani, Creator Automations, or the original consumer backend from this branch.

## Before public launch
1. Check preview visuals on desktop and mobile.
2. Decide whether to implement a new business-only intake endpoint, separate from offense/case records.
3. Review sales copy, service boundaries, privacy/terms, and any planned pricing.
4. Merge only after verification and review; the main branch is watched by other Render services.

## Original source reused
client/src/pages/TurboSystems.tsx and TurboSystems.css.
