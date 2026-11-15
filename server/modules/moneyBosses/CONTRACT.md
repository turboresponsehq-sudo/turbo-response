# Money Bosses durable content API

Backend-only persistence and release snapshots. Credentials and membership remain disabled; no membership, Shopify, wallet, email, production, deployment, or paid-service calls are performed. Original approved artwork files/checksums are never rewritten.

## Parent mount and runtime

Import `registerMoneyBossesContentRoutes` from `server/modules/moneyBosses/routes.ts` and call `registerMoneyBossesContentRoutes(app)` **before SPA/static fallback** in the parent-owned server entrypoint. Existing `moneyBosses` tRPC router stays mounted in `server/routers.ts`.

Existing installed dependencies suffice: multer, pg, drizzle-orm, zod. Runtime needs `ffprobe` (FFmpeg), PostgreSQL migrations 0026 → 0027 → 0028, a dedicated absolute `MB_ARCHIVE_STORAGE_DIR` outside Git/static directories on durable private storage, and `MB_ARCHIVE_PREVIEW_SECRET` at least 32 characters (fallback JWT_SECRET). No migrations/deployment run automatically.

## Protected tRPC: `trpc.moneyBosses.*`

Every procedure uses existing `adminProcedure`, requiring an authenticated current admin user. Legacy JWT Bearer auth resolves current database identity; there is no bypass.

- **`archiveContent({limit?:number})`** returns `{database,ready,artworks,videos,stories,releases,assignments,credentialsEnabled:false,membershipEnabled:false}`. Original snake_case video/artwork shapes remain compatible. IDs in artworks, videos, assignments, stories, releases are normalized to numbers (media/snapshot UUIDs stay strings). Artwork rows additionally include `story_title`, `story_body`, `story_subtitle`, `story_era`, `story_location`. Videos include `source_note`, `audio_rights_status`, `content_approved`, `media_id`, `release_at`, existing `media_url` and status. `assignments:[{artwork_id,video_id,is_default}]` drives pure draft selection; `releases` is retained snapshot history with active pointer metadata.
- **`saveArchiveStory({artworkId,storyTitle,storyBody})`** returns `{database,ready,saved,story?}`. Saves editable story draft, preserving other draft metadata. Does not change published content.
- **`updateArchiveVideo({videoId,label,mediaUrl?,mediaId?,sourceNote?,releaseAt?:ISO|null,audioApproved?:boolean,contentApproved?:boolean})`** returns `{database,ready,saved,video?}`. Omitted source/notes/release/approvals preserve existing draft values. Changing media resets approvals unless explicitly reconfirmed in that save. `releaseAt:null` clears schedule. Labels and source notes are draft metadata, not release edits.
- **`createArchiveVideoDraft({label,mediaUrl?,mediaId?,sourceNote?,releaseAt?:ISO})`** returns `{database,ready,created,video?}` on success. Exactly one media source. Existing HTTPS mediaUrl draft input and snake_case returned video shape remain supported. Missing DB preserves exact old `{database:"migration_pending",created:false}` shape.
- **`assignArchiveVideo({artworkId,videoId,isDefault?:boolean})`** returns `{database,ready,assigned}` on success. Setting default clears other defaults for that artwork atomically. Missing DB preserves old `{database:"migration_pending",assigned:false}` shape. **`removeArchiveVideoAssignment({artworkId,videoId})`** returns `{database,ready,removed}`.
- **`publishArchiveArtwork({artworkId,videoId?,approval:true,releaseAt?:ISO|null,expiresAt?:ISO|null})`** returns `{database,ready,published,snapshotId?,publication?}`. Final explicit approval is required, as are nonempty saved story title/body and saved `content_approved:true` + `audio_rights_status:"approved"` on all selected videos. `videoId` selects that assigned video only; omitted selects all assigned videos. Snapshot captures story/video metadata immutably and switches current publication transactionally. Publishing does not implicitly save editor state. Windows are start-inclusive/end-exclusive; video-specific release time is also enforced.
- **`unpublishArchiveArtwork({artworkId})`** returns `{database,ready,unpublished}`. Disables public story and uploaded media access immediately for new requests. Immutable history remains retained.
- **`createArchiveMediaPreview({mediaId})`** is a mutation returning `{database,ready,url?,expiresAt?}`. Five-minute sensitive ticket URL, checked against issuing user's current DB admin role at each request. Never persist/log the preview URL.

Additional aliases: `saveArchiveStoryDraft({artworkId,title,subtitle?,body,era?,location?,displayOrder?,recognitionEnabled?})` saves full richer story metadata; `updateArchiveVideoDraft` aliases update and also accepts `audioRightsStatus:"pending_review"|"approved"|"blocked"`; `publishArchiveStory` and `unpublishArchiveStory` alias corresponding artwork procedures.

New APIs without DB/migration return `database:"migration_pending",ready:false` and false mutation success/empty collections; they never claim persistence. Existing membership/integration read-only procedures are unchanged.

## Upload

**`POST /api/money-bosses/uploads`**, authenticated cookie or `Authorization: Bearer <admin_session>`. FormData must contain exactly one `file` and no other fields, max 100 MiB. Origin must match request host, or explicitly configured `MONEY_BOSSES_DEV_ORIGIN` in development; requests without Origin support CLI clients. Never spoof authenticated origin/auth headers in production.

Actual MP4 ISO-BMFF signature, ffprobe container/stream validation, one H.264 video and optional AAC audio are required. Unsupported audio/video, renamed non-MP4, malformed, oversized media are rejected. ffprobe has network protocols disabled and MOV external data references disabled. Random exclusive filenames, 0700 directory and 0600 files, outside Git/static. Invalid/oversized/interrupted uploads are cleaned; private drafts are never served statically.

HTTP 201:

```json
{"database":"ready","ready":true,"credentialsEnabled":false,"membershipEnabled":false,"mediaId":"uuid","mediaUrl":"/api/money-bosses/media/uuid","previewUrl":"/api/money-bosses/media/uuid?ticket=...","media":{"id":"uuid","mimeType":"video/mp4","sizeBytes":1234,"durationSeconds":2,"videoCodec":"h264","audioCodec":"aac"}}
```

Save **mediaId** (preferred) or stable **mediaUrl**, never previewUrl. Error JSON `{error:string}`: 401 missing/invalid identity, 403 wrong/revoked admin or disallowed Origin, 400 malformed/unsupported media/form, 413 oversized, 429 concurrent upload limit, 503 storage/DB/signing unavailable.

External HTTPS destinations may be saved but are never fetched/proxied by server. No Instagram, JavaScript, URL credentials, localhost/private/IP literal hosts, nonstandard ports, or unsafe local paths. Exact stable uploaded paths are permitted; paths containing preview tickets/traversal are not.

## Public scanner feed

**`GET /api/money-bosses/content`**, no auth, no-store. Minimal frontend shape:

```json
{"version":1,"schemaVersion":1,"database":"ready","ready":true,"credentialsEnabled":false,"membershipEnabled":false,"items":[{"artworkId":"tony-tripp","version":1,"story":{"title":"Published title","body":"Published body"},"video":{"url":"/api/money-bosses/media/uuid","label":"Approved video"}}],"artworks":[],"videoDestinations":{"tony-tripp":{"url":"/api/money-bosses/media/uuid","label":"Approved video","status":"approved"}}}
```

`artworks` actually contains the detailed approved entries (omitted above for brevity): `{id:stableKey,artworkId:numericDbId,snapshotId,version,subject,label,image,sha256,alt,title,subtitle,body,era,location,displayOrder,recognitionEnabled,publishedAt,releaseAt,expiresAt,videos:[{id,label,url,mediaId,isDefault,releaseAt}]}`.

Only enabled, currently released/nonexpired snapshots appear for original stable keys `tony-tripp`, `rod-tre`, `cow-pac`. Future video URLs are omitted until video release, so item.video can be null. Detailed image/checksum/alt are the exact approved source references. No drafts, source notes, admin/member identity, storage paths or credential data enter the feed. Saving next drafts never changes this snapshot. Missing DB/migration returns ready:false with empty items/artworks/videoDestinations.

**`GET /api/money-bosses/media/:id`** streams only files referenced by current active publications with eligible story/video windows. Scheduled/future/unpublished files return 404. Supports single byte Range: 206/Content-Range; invalid or multipart Range 416. HEAD supported. Optional `?ticket=...` supplies admin preview instead; invalid/expired/revoked ticket is 403 even if file happens to be public. No arbitrary URL proxy, no-store and nosniff on all responses.

## Verification and limits

Focused behavior tests: `pnpm exec vitest run server/modules/moneyBosses/content.behavior.test.ts`.

Opt-in real DB/HTTP tests: source private local runtime.env, then `MB_RUN_INTEGRATION=1 pnpm exec vitest run server/modules/moneyBosses/content.integration.test.ts`. Test code refuses every DB except `127.0.0.1:55432/money_bosses_staging`. It restores pretest draft/publication state and deletes its test admin; immutable historical test snapshots and successfully uploaded test media remain retained in staging. Do not run concurrently with a staging demonstration because the fixed three artwork publications are exercised temporarily.

Eventual deployment requires a durable volume; ephemeral disk is not persistence across host replacements. Historical release/media retention is intentional; no destructive cleanup endpoint is exposed. External destinations' availability/codecs are not server-verified because outbound fetching is forbidden. Existing active download streams are not forcibly terminated by unpublish, but subsequent requests/ranges are denied. No new services or automatic deployment/membership operations.
