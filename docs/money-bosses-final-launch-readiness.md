# Money Bosses — final launch readiness

**GO for owner development testing. NOT READY for public campaign launch yet.** No production changes, QR replacement or redirect activation occurred. Membership, wallets and Shopify remain preserved and on hold.

## Verified

| Area | Result |
|---|---|
| Blank-page issue | Proven cause: sandbox HTTPS proxy returned HTTP 429 for Vite's many development modules. Explicit development-only bundled mode now serves the **same protected Admin Center** with fewer requests. **14/14 HTTPS refresh, direct-entry, login and session checks passed.** Normal HMR/production serving remain unchanged. Host-wide proxy limits still apply. |
| Owner workflow | **Select artwork → paste URL → Save link draft → approve → Publish.** Actual controls and mobile layout passed. Optional story/video tools are collapsed, not deleted. |
| Recognition | **6/6 genuine tests**, three original photographs at iPhone/Android widths, opened their exact assigned Instagram/YouTube/HTTPS links after ARCHIVE UNLOCKED. Engine, photos and official QR unchanged. |
| Release safety | Draft changes kept the old published URL until approval/publication. Unpublish removed the release. Unassigned/offline content provided a safe return to the unified Hub. |
| Persistence/security | Isolated PostgreSQL readback and private backup/restore passed. Latest rollback/reapply tested on a disposable clone only. Anonymous mutations rejected; public feed excluded private member/admin fields. |
| Existing site | V4 navigation, mobile menu/Escape, Hub and preserved card preview passed at 390, 412 and 1440 pixels. |
| Checks | Public: **60 tests**, typecheck/build passed. Admin: **103 focused tests**, frontend/backend builds passed. Two pre-existing Creator TypeScript errors remain; no new Money Bosses diagnostics. |

**Limitations:** no physical iPhone/Android camera test. Provider pages were stubbed after genuine navigation; external login/app-opening/playback is not certified. The isolated DB excludes unrelated business data, so these tests do not certify all Turbo/Creator workflows. Email capture/analytics are local previews, not campaign services.

## Exact launch blockers

1. **Published host is stale.** Reuse the existing Money Bosses host, but integrate the tested per-artwork runtime/feed instead of its older global Reel handoff. Configure an approved read-only production feed proxy or narrowly authorized HTTPS/CORS connection; the localhost proxy is development-only.
2. **Approved PostgreSQL migration/backup procedure.** Verify existing production baseline, capacity and restore coverage, then approve ordered root migrations **0026–0029**. The legacy MySQL Drizzle journal omits them: **do not use `db:push` for launch**. Production DB was not inspected or migrated.
3. **Shared-server release acceptance.** Verify existing owner access, configured secrets, HTTPS/JSON routing and Turbo/Creator regression checks; resolve/review the two existing Creator diagnostics. Keep sample/private membership assets out of the public campaign build.
4. **Final content and actual phones.** Approve all three campaign URLs—current YouTube/homepage assignments are test destinations—and validate garment recognition/camera permission on iPhone Safari and Android Chrome.
5. **Official QR handoff remains inactive.** The original QR still opens the legacy Turbo scanner. Its exact-path reversible 302 requires separate approval after the above gates pass.

## Five-step launch checklist

- [ ] Confirm existing hosting/PG capacity, backup retention and accepted rollback releases.
- [ ] Validate ordered migrations and existing owner login on production-like staging.
- [ ] Approve the existing admin/public runtime-and-feed release; no redesign or new platform.
- [ ] Publish approved URLs and complete phone, publication-isolation and business-regression acceptance.
- [ ] Separately approve/test original QR → exact 302 → Hub → scanner → assigned link.

**Estimate:** roughly **1–2 days after infrastructure/content/device approvals are available**, not a guaranteed date. **Extra cost may be $0** if existing hosting, PostgreSQL and backup coverage suffice; quotas/billing were not inspected. No new domain, MP4 storage/CDN, Shopify or wallet service is needed for this link-only campaign.

## Rollback

Unpublish an affected artwork, or restore its previous approved URL and republish. Roll back to recorded accepted admin/public builds while retaining database/content history. If the QR 302 is later activated, disable/remove **only** its exact `/atlanta-archives` handler to restore the preserved legacy scanner; clearing its target variable alone is insufficient. Never run destructive down migrations on the live shared DB. Data recovery requires an approved isolated restore/cutover.
