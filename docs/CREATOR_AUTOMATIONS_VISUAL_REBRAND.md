# Creator Automations — visual rebrand

## Scope
Keep the existing application, routes, API endpoints, CRM, PostgreSQL, authentication, client portals, and integrations. New atmospheric black/amber/muted rose presentation, no solid ring, restrained typography. No fabricated metrics, client logos or endorsements. Existing offers/pricing unchanged; inconsistent chatbot quoted prices replaced with scope-based guidance.

## Route inventory
- /zakhybuildsai — actual homepage; real portfolio assets and same CTA endpoints.
- /zakhybuildsai/services, /automation-services, /portfolio — existing pages retained, hero/brand copy and accent refresh.
- /creator/start — same payload keys, option values, consent, POST /api/creator/leads; visual and label changes only. Static preview blocks submissions explicitly.
- /admin/zakhy/add-contact — same admin gate and categories/contact endpoints; recolor only. Isolated /preview/contact-design renders a sample-only form and never requests or saves contacts; production route remains guarded.
- /zakhybuildsai/links/ — existing static mobile link hub, images, social/CTA destinations retained, warm dark styling.
- Public Turbo guided chatbot — preserve conversation step logic, intake source query and link, broaden language. This is guided FAQ, not a new live AI integration.
- Remaining CRM dashboard, client portals, digital card, learning page, showcase, individual client designs and other legacy public paths: inventory/visual QA before any further migration. No data/auth changes.

## Preview
Build with VITE_CREATOR_REBRAND_PREVIEW=true pnpm run build:frontend then node scripts/write-creator-rebrand-preview-routes.mjs. This build is design-only, not a live CRM. Public project demos may still point to existing production client pages; do not submit real information in preview. Keep existing production URLs. No domain, merge, production deployment or paid API requests authorized. Visual and functional QA pending.

## Additional pass
- Digital networking card /zakhy/connect now matches the warm dark identity, preserving existing portrait, vCard and QR destinations, and existing production local-contact storage behavior. Preview blocks saving and explicitly labels demo.
- Existing client project links in the portfolio continue to open their established URLs rather than unbuilt static preview paths. Suppressed legacy consumer chat on /creator/start; Creator home chat retains its original guided behavior.

## Desktop hero and commercial narrative revision
- Reference-based composition: one-line wordmark, centered hero, a wide diffused amber-to-rose curved light field (SVG blur + grain), a single prominent inquiry CTA, restrained capability row and a brand identity strip in place of fictional client logos/metrics.
- New headline: Create the narrative. Grow the business. Positioning: For the creators of the future. Supporting copy ties media, digital platforms and AI systems to customers, sales and productivity. Section copy explains commercial outcomes, not just technical features.
- Only homepage presentation and shared stylesheet additions; no service pricing, routes, API, CRM or database changes. Desktop reference match and mobile rendering need visual verification.
