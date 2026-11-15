# Money Bosses content workflow — current development status

## Completed

The existing Turbo Response Money Bosses module was extended on feature/money-bosses-command-center, not rebuilt as a separate admin platform. Story/video drafts, artwork assignments and immutable approved release snapshots now persist in isolated local PostgreSQL. Uploaded H.264/AAC MP4 files are stored server-side outside Git and public/static folders, not in browser memory. The existing authenticated admin panel now supports actual upload, editing, draft saves, release approval, publish and unpublish operations.

The existing Money Bosses scanner development app reads the live published-content feed at runtime using the same original three artwork identifiers and unchanged ORB engine/reference photographs. Published stories appear at the existing Archive Hub. The existing full-screen player accepts the selected published video, preserves Play with Sound, replay/pause/close, and uses a safe unassigned/offline fallback. Official clothing QR bytes, encoded URL and production redirect have not changed. Membership cards and wallet work remain saved and inactive.

## Verified tests

Original migrations 0026 and 0027 passed forward, rollback and forward again against the free isolated PostgreSQL cluster at 127.0.0.1:55432. The new 0028 publishing extension also passed forward/rollback/forward; baseline artworks remained present after its rollback. No production database was used.

57 focused backend/authorization tests passed. 12 opt-in real PostgreSQL/HTTP integration tests passed, covering upload validation/cleanup, private previews/current-role revocation, saved drafts, immutable publication isolation, scheduling/expiry, unpublish, media byte ranges and concurrent releases. The public Money Bosses app passed 46 tests and its TypeScript/static build. Turbo frontend/backend builds passed. Two pre-existing Creator-module TypeScript errors remain unrelated to Money Bosses; no Creator workflow was altered to suppress them.

The current real authenticated HTTP test confirms saved stories/videos can be read back, changing the next draft does not change the published snapshot, unpublish removes the public feed/media, and published MP4 streaming returns HTTP 206 for byte ranges. The latest test evidence is docs/evidence/money-bosses-durable-content/api-persistence-test.json.

## Not finished / not claimed

Final integrated browser acceptance remains incomplete. The same authenticated Admin Center renders and its saved registry is visible, but a development Vite page-refresh/module-loading issue intermittently produces a blank page in the automated browser. The full new runtime-feed scan-to-video/browser-restart journey is therefore NOT yet claimed as passed. Native video playback and genuine recognition were verified in earlier development phases; this does not substitute for the new connected journey.

Uploaded files and database records survive browser closure because they are server-side. A final server-restart readback and physical iPhone/Android camera acceptance are still pending. The isolated sandbox is a test environment, not permanent production storage.

## Launch dependencies

An approved production PostgreSQL/database configuration with backups and durable private media storage (persistent volume or object storage) is required. Production API/public feed routing, final real-phone testing, and an explicit deployment approval are still necessary. No paid service, Shopify, wallet/member issuance, production deployment or official QR redirect was activated.
