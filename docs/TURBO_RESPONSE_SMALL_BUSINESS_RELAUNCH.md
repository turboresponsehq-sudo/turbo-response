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

## Professional positioning and public archive
- Original Turbo Systems design/CSS retained. Public copy now emphasizes increasing sales and productivity; six offerings: AI agents and assistants, business automation, business intelligence, sales/customer management, custom platforms and system integration.
- Retired public consumer marketing and new-case intake routes render a neutral archive notice. Their original component files remain in Git. Former business intake and contact routes redirect to the email consultation section. Existing client login, case, payment, agreement, admin, Creator and Amani routes remain registered.
- Suppressed the unverified shared floating chatbot on public business and retired pages; preserved prior chat behavior on existing Creator/client/admin routes and left Creator-specific chat components unchanged. Default search and social metadata now reflect the business brand.
- No new intake endpoint or production service changes. Business audit, voice, CRM and other integrations require isolated acceptance testing before activation. Preview is static; a passing build is not a runtime verification of backend functionality.
- Before production authorization: confirm existing-client navigation, review privacy/terms, verify server-side noindex/retirement behavior for legacy routes (implemented in production server fallback), verify business-only intake and mobile/browser appearance; review main-branch deployment impact.

## Flagship homepage restoration
- Restored original cinematic Home.tsx composition as BusinessHome.tsx, preserving Home.css, original founder/goggles image URL, orbital rings, particles, glow and motion. Original Home.tsx remains unchanged for archival purposes.
- Homepage headline: The Future of Business. Outcome: Increase sales. Increase productivity. Three capability pillars: Capture More Business, Automate the Way You Work, Make Better Business Decisions.
- /services and /turbo-systems keep the professional service catalog; homepage / is separate. Removed old unsupported portfolio counts from the public homepage. Inquiry CTA remains email-based; no old case API connected.
- New scoped CSS addresses mobile width and reduced-motion preference. Verify actual hero image loads from original external CDN, desktop/mobile appearance and link behavior before production launch.

## Business inquiry recovery
- Original TurboIntakeForm source archived unchanged; BusinessIntakeForm reuses its CSS/layout with business-only fields. /business-inquiry, /contact and /turbo-intake render the new form. Homepage and service CTAs link to it.
- POST /api/business-inquiry validates, rate-limits and saves to existing intake_leads with source turbo-business-inquiry. No consumer case creation, AI report, email, HubSpot sync or file upload. Existing operational event processing is reused. Owner-only intake read/update and Command Center details.
- Static preview explicitly simulates submission locally and sends nothing. Real persistence requires authorized backend deployment and isolated end-to-end testing. No production changes.

## Static preview route fix
- Frontend-only build emits route entry files for business inquiry, contact, turbo-intake, services and Turbo Systems, so direct requests can resolve without a static-host rewrite. Preview CTAs also use the guaranteed root entry with ?page=business-inquiry; production uses /business-inquiry. Preview remains non-persistent.
- Replaced Map iteration in inquiry throttling with forEach to satisfy the existing TypeScript compiler target.
