# Durable Atlanta Archives content — development plan

Extend the existing Turbo Response Money Bosses router and Archive Content panel on feature/money-bosses-command-center. Do not create another admin system. Public scanner integration remains in the existing money-bosses development branch; do not deploy either branch.

Use an isolated PostgreSQL cluster in the sandbox on loopback port 55432 for real migration, rollback, persistence and admin tests. This is free local staging, not production or an external paid resource. Store uploaded MP4 bytes outside Git and public/static directories on the server filesystem for development; they survive browser and process restarts. Production requires an approved durable object-storage adapter and managed database backups; sandbox disk is not advertised as permanent production hosting.

## Structure

Existing moneyBossesRouter/adminProcedure owns authorization and content mutation endpoints. New server/modules/moneyBosses content service owns draft storage, validated uploads, immutable published snapshots and public feed filtering. Existing MoneyBossesArchivePanel owns upload/edit/save/publish/unpublish UI. PostgreSQL migrations remain namespaced and reversible. Media routes expose only authorized previews or currently published media, with HTTP byte-range playback. Existing public scanner/player consume a configured runtime public feed keyed by the original artwork IDs; recognition engine/reference photographs and official QR never change.

Draft editing must not change published output. Publishing requires explicit administrator approval and records an immutable snapshot. Public feed returns only currently authorized releases and no private member data. Unpublish removes the experience; missing content or network errors produce a safe Hub/player fallback. Preferred scheduled release time is enforced in feed retrieval, without a paid worker or new unattended service. No membership/Shopify/wallet activation.

Use a generated, isolated development admin fixture with the existing login/JWT/database-role checks for automated staging tests, not production credentials. Keep fixture secrets outside Git, local-only and never print them in reports. The real admin route remains authenticated; a staging access handoff uses existing login, never an auth bypass.
