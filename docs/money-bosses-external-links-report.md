# Money Bosses — external link scanning ready in development

## Result

The existing Money Bosses Admin Center now supports a separate per-artwork external-link destination. Instagram, YouTube and other public HTTPS links are accepted for external navigation. The previous MP4 input is preserved, not repurposed: uploaded-video playback and its original validation remain intact.

In Archive Content, select an original artwork, enter External destination URL and Link label, click Save link draft, select Approved to use for artwork scans, then Publish link in development. Save alone does not change what scanners open. After publishing, subsequent recognition fetches the current server publication and opens that exact URL in the same tab after ARCHIVE UNLOCKED. No popup, iframe, media download, scanner-code edit, reference-photo replacement or QR change is required. Unpublish artwork link disables the published experience and preserves the safe Hub fallback.

## Tested

The actual existing authenticated Admin Center form saved and published a changed Instagram destination. The public database feed matched the form, and the same panel fit a 390-pixel mobile viewport without horizontal overflow. Evidence: docs/evidence/money-bosses-external-links/actual-admin-ui.json and desktop/mobile screenshots.

Real PostgreSQL tests confirmed saved link readback from a new request, different destinations for the three artwork IDs, draft isolation, edit/republish, and unpublish. Six genuine ORB recognition tests—three original photograph queries at each of 390-pixel iPhone and 412-pixel Android widths—opened the exact assigned Instagram, YouTube and other HTTPS destinations in the same tab. The supplied Reel URL was preserved with its query string. Recognition responses were not mocked; external destination documents were stubbed only after the browser's actual navigation request, so provider login/redirects would not obscure dispatch. This tests correct destination routing, not external-site availability or playback.

Public app: 60 tests passed, TypeScript and static build passed. Backend extension: 96 focused tests passed, including 48 new link-validation/publication tests. Admin frontend/backend builds passed; no new Money Bosses TypeScript errors. Two existing unrelated Creator TypeScript errors remain. The narrow 0029 migration was applied only to isolated local PostgreSQL at 127.0.0.1:55432.

## Preserved and pending

The original three reference photographs, ORB engine, official clothing QR image, encoded URL and production redirect are unchanged. Premium Member cards, wallet architecture, MP4 upload/storage and other Command Center workflows remain preserved. All changes are on the existing development branches only.

Ready for development demonstration and owner-managed link editing, NOT deployed live. Production still requires separate approval, a durable production database/public content API configuration, and physical iPhone/Android camera testing. Instagram/YouTube may require login or open their apps and control playback/sound themselves. The earlier development Vite refresh/loading issue is not claimed fixed; initial navigation and actual link controls were verified in this change. No original MP4 is required for the link-only experience.
