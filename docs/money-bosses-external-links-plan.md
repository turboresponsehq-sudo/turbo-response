# Per-artwork external links — minimal development extension

Add optional external URL/label fields to the existing persisted artwork draft and immutable publication snapshot. The existing authenticated Money Bosses Archive Content panel gets a small link editor with Save link draft, Publish link in development, and clear/unpublish controls. No new admin platform, membership changes, media download, embed or video-upload work.

Instagram, YouTube and other public HTTPS URLs are permitted for external navigation only. Existing uploaded MP4 playback remains unchanged. Link edits are drafts until explicitly published; active publications are resolved by the scanner at recognition time so subsequent scans use new links without code, artwork or QR changes. The existing ARCHIVE UNLOCKED animation runs first, followed by same-tab navigation rather than a popup, avoiding mobile popup blocking. Missing/unpublished links retain the Hub fallback.

Test isolated PostgreSQL save/readback, draft/publication isolation, edit/republish/unpublish and current admin authorization. Test genuine ORB recognition against the existing three references in mobile-sized browser contexts and capture the exact navigation URL; this proves link dispatch, not external provider login, availability, playback, or physical-phone camera acceptance. No production deployment or garment QR redirect changes.
