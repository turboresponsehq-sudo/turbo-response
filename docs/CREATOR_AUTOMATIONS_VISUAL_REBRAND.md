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

## Next Era flagship homepage
- Used Black Future's source-level design principles (cinematic image, oversized editorial headline, animated grid and orbital depth) and project sources as references. Existing repository Atlanta skyline and portfolio assets were verified in the tree; no third-party image requests or new paid assets.
- New hero: The future belongs to those who create. Brand statement: Create / Influence / Innovate / Grow. Portfolio is moved directly beneath hero; visual capability sections connect media, platforms, intelligent systems and bottom-line outcomes.
- Separate scoped CSS, original routes and existing Turbo guided chat, entry packages, lead intake, admin tools and backend preserved. Project links point to existing production demos. No new revenue claims or endorsements. Mobile/desktop visual QA and CI required before merge.

## Approved black/red/gold homepage revision
- Replaced the orbital treatment with the approved Create. Automate. Grow. hero composition, bold italic lettering and original black/red/white/gold palette. The header and footer use a vector trace of the approved logo, with corrected Creator Automations spelling and no trademark claim. No portraits, cars, college logos or affiliation claims in hero.
- Existing high-resolution Atlanta skyline image reused; it is not the exact bridge photograph in the generated concept. Actual approved reference image is not available as a separately uploaded clean background asset. Mobile layout is responsive and text remains HTML, not baked into an image.
- Existing navigation destinations, guided chatbot, portfolio, entry packages and intake preserved. New hero links to existing services and portfolio; Build with us uses the existing intake. No API/database or production changes. Visual review and CI required before merge.
