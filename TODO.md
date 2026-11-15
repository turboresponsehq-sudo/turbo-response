
## Phase 2 operational foundation

- Added development-only Premium Member profile/photo editor with rectangular crop, repositioning, zoom, removal, and disabled verified save.
- Added Archive Content local video preview, draft HTTPS destination registration, artwork assignment, and user-gesture playback controls.
- Kept Instagram, Shopify, wallet issuance, production database, official QR, and public customer experiences unchanged.
- Isolated PostgreSQL staging was not available; migration forward/rollback remain pending.
- Focused tests and frontend/backend builds pass; unrelated repository-wide TypeScript and Google Drive credential blockers remain.

## Command Center visibility correction

- [x] Verify the Money Bosses module exists only on feature/money-bosses-command-center, and compare with origin/main without merging or deploying.
- [x] Add a Money Bosses entry on /admin as well as the existing /admin/command-center entry; preserve existing navigation destinations and workflows.
- [x] Keep /admin/money-bosses protected by the existing AdminSessionGate and server adminProcedure. Add an explicit development-only preview of the SAME component with no customer records or live mutation calls; never bypass authentication on the actual admin route.
- [x] Correct confirmed draft-validation, error-state, file cleanup, and draft-scheduling defects; distinguish local preview from database persistence and live publishing.
- [x] Demonstrate archive references, local MP4 preview, draft assignment and scheduled-release metadata; keep official QR and public scanner unchanged. Report durable uploads, public registry feed, story persistence, scheduling activation, analytics and real database testing honestly as pending where not connected.
- [x] Run focused behavioral tests and builds; identify any unrelated repository-wide TypeScript failures; provide preview/report/changed-file evidence and push only this development branch.

## Durable Atlanta Archives content workflow

- [ ] Free isolated PostgreSQL staging on localhost only; run baseline, upgrade, rollback and forward again without production connections. Prove story/media/draft/release persistence after browser refresh and server restart.
- [ ] Extend existing authenticated Money Bosses module for MP4 upload, story/video edits, saves, artwork assignment, explicit approval/publish and unpublish. Draft edits must not leak to published content; releases must be versioned and scheduling enforced without live deployment.
- [ ] Store validated uploaded video bytes server-side outside Git/static directories, protect unpublished media, provide safe byte-range playback and clean failed uploads; document production durable object storage and backup requirements honestly.
- [ ] Existing public scanner consumes published feed at runtime using unchanged artwork IDs/references and QR. Genuine ORB recognition → ARCHIVE UNLOCKED → published video → tap Play with Sound → close to same Hub. Published stories shown at the Hub; missing/removed/offline content falls back safely.
- [ ] Test existing admin permissions, upload validation, drafts/private media exclusion, snapshot isolation, persistence, range playback, mobile layout and full scan/video workflow. Preserve membership features for later. Save only development branches; no production deployment/official QR/redirect changes.

## Per-artwork external link scanning

- [x] Small existing-admin extension: assign Instagram, YouTube and other public HTTPS external URLs per original artwork; persist drafts, explicitly publish, edit and republish without code/artwork/QR replacement.
- [x] Preserve original ORB/reference photographs and ARCHIVE UNLOCKED; open the assigned published URL in the same tab, no embed, download or popup. Keep uploaded MP4 features and safe no-destination fallback unchanged.
- [x] Test isolated DB persistence/draft isolation and genuine recognition-to-exact-link navigation at iPhone/Android widths; distinguish this from physical phone, external provider login and video playback tests.
- [x] Save existing development branches only. No production deployment, official QR or redirect changes, membership or wallet activation.

## First-campaign launch readiness

- [x] Audit the existing V4 website, scanner, Hub, Command Center content module, database and external-link publishing without rebuilding or new features.
- [x] Diagnose and resolve the intermittent development blank page; verify repeated refresh/direct entry without weakening real admin authentication or modifying production serving.
- [x] Make the existing artwork → paste URL → save → approve → publish controls clear and primary; preserve existing MP4 and membership work for later.
- [x] Recheck all three original photograph recognitions, exact mobile-width link dispatch, safe missing/unpublished fallback, and isolation of changed drafts until explicit approval/publishing.
- [x] Confirm isolated database persistence, backup/restore and production requirements; no paid service, production migration/deployment, official QR change or redirect activation.
- [x] Deliver working development access, concise test/limitation evidence, exact blockers, conditional costs, short launch checklist and reversible rollback plan with GO/NOT READY recommendation.
