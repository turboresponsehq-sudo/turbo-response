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
