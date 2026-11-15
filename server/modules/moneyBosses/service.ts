import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { ARTWORK_REFERENCES, flags, mediaIdSchema, mediaPath, isSafeExternalVideoUrl, type StableKey } from "./validation";
import { badRequest, contentDb, normalizeStory, normalizeVideo, notFound, pending, ready, rows } from "./database";

async function requireArtwork(db: any, artworkId: number) {
  const a = rows(await db.execute(sql`SELECT id, stable_key FROM mb_archive_artworks WHERE id=${artworkId} AND deleted_at IS NULL`))[0];
  if (!a || !Object.hasOwn(ARTWORK_REFERENCES, a.stable_key)) notFound("Original archive artwork not found");
  return a;
}
async function lockStory(tx: any, artworkId: number) {
  const artwork = await requireArtwork(tx, artworkId);
  const story = rows(await tx.execute(sql`SELECT * FROM mb_content_story_drafts WHERE artwork_id=${artworkId} FOR UPDATE`))[0];
  if (!story) notFound("Story draft not found");
  return { artwork, story };
}
async function resolveMedia(db: any, input: {mediaUrl?: string; mediaId?: string}) {
  let id = input.mediaId;
  if (input.mediaUrl?.startsWith("/api/money-bosses/media/")) {
    const parsed = mediaIdSchema.safeParse(input.mediaUrl.slice("/api/money-bosses/media/".length));
    if (!parsed.success) badRequest("Invalid media ID");
    id = parsed.data;
  }
  if (id) {
    const media = rows(await db.execute(sql`SELECT id FROM mb_content_media WHERE id=${id}`))[0];
    if (!media) notFound("Uploaded archive media not found");
    return { mediaId: id, mediaUrl: mediaPath(id) };
  }
  if (!input.mediaUrl || !isSafeExternalVideoUrl(input.mediaUrl)) badRequest("Unsafe external video URL");
  return { mediaId: null, mediaUrl: input.mediaUrl };
}
export async function archiveContent(limit = 50) {
  const db = await contentDb();
  if (!db) return { ...pending, ...flags, artworks: [], videos: [], stories: [], releases: [] };
  const artworks = rows(await db.execute(sql`
    SELECT a.id,a.stable_key,a.title,a.source_asset_id,a.source_checksum,a.recognition_enabled,a.approved,a.updated_at,
      d.title AS story_title,d.subtitle AS story_subtitle,d.body AS story_body,d.era AS story_era,d.location AS story_location
    FROM mb_archive_artworks a LEFT JOIN mb_content_story_drafts d ON d.artwork_id=a.id
    WHERE a.deleted_at IS NULL ORDER BY a.updated_at DESC LIMIT ${limit}
  `)).map(a => ({ ...a, id: Number(a.id) }));
  const videos = rows(await db.execute(sql`SELECT id,label,media_url,media_id,status,audio_rights_status,content_approved,source_note,release_at,created_at,updated_at FROM mb_archive_videos ORDER BY updated_at DESC LIMIT ${limit}`)).map(normalizeVideo);
  const stories = rows(await db.execute(sql`
    SELECT d.*,a.stable_key,p.snapshot_id,p.enabled,s.release_at,s.expires_at,s.published_at
    FROM mb_content_story_drafts d JOIN mb_archive_artworks a ON a.id=d.artwork_id
    LEFT JOIN mb_content_publications p ON p.artwork_id=d.artwork_id LEFT JOIN mb_content_snapshots s ON s.id=p.snapshot_id
    WHERE a.deleted_at IS NULL ORDER BY d.display_order,a.stable_key
  `)).map(normalizeStory);
  const releases = rows(await db.execute(sql`SELECT s.id AS snapshot_id,s.artwork_id,s.version,s.published_at,s.release_at,s.expires_at,(p.snapshot_id=s.id AND p.enabled) AS active FROM mb_content_snapshots s LEFT JOIN mb_content_publications p ON p.artwork_id=s.artwork_id ORDER BY s.published_at DESC LIMIT ${limit}`)).map(r => ({ ...r, artwork_id: Number(r.artwork_id) }));
  const assignments = rows(await db.execute(sql`SELECT artwork_id,video_id,is_default FROM mb_archive_artwork_videos ORDER BY artwork_id,video_id`)).map(a => ({...a, artwork_id:Number(a.artwork_id),video_id:Number(a.video_id)}));
  return { ...ready, ...flags, artworks, videos, stories, releases, assignments };
}
export async function saveStory(input: any, actorId: number, minimal = false) {
  const db = await contentDb();
  if (!db) return { ...pending, saved: false };
  return db.transaction(async tx => {
    const { artwork, story } = await lockStory(tx, input.artworkId);
    const value = minimal ? { ...story, title: input.storyTitle, body: input.storyBody } : { title: input.title, body: input.body, subtitle: input.subtitle, era: input.era, location: input.location, display_order: input.displayOrder, recognition_enabled: input.recognitionEnabled };
    const r = rows(await tx.execute(sql`
      UPDATE mb_content_story_drafts SET title=${value.title},subtitle=${value.subtitle},body=${value.body},era=${value.era},location=${value.location},display_order=${value.display_order},recognition_enabled=${value.recognition_enabled},updated_by_user_id=${actorId},updated_at=NOW()
      WHERE artwork_id=${input.artworkId} RETURNING *
    `))[0];
    return { ...ready, saved: true, story: normalizeStory({ ...r, stable_key: artwork.stable_key }) };
  });
}
export async function createVideo(input: any) {
  const db = await contentDb();
  // Keep exact pre-existing no-DB draft failure shape.
  if (!db) return { database: "migration_pending" as const, created: false };
  const source = await resolveMedia(db, input);
  const r = rows(await db.execute(sql`INSERT INTO mb_archive_videos(label,media_url,media_id,status,audio_rights_status,source_note,release_at)
    VALUES(${input.label},${source.mediaUrl},${source.mediaId},'draft','pending_review',${input.sourceNote || null},${input.releaseAt || null}) RETURNING *`))[0];
  return { ...ready, created: true, video: normalizeVideo(r) };
}
export async function updateVideo(input: any) {
  const db = await contentDb();
  if (!db) return { ...pending, saved: false };
  return db.transaction(async tx => {
    const old = rows(await tx.execute(sql`SELECT * FROM mb_archive_videos WHERE id=${input.videoId} FOR UPDATE`))[0];
    if (!old) notFound("Archive video not found");
    const source = input.mediaUrl || input.mediaId ? await resolveMedia(tx, input) : { mediaId: old.media_id, mediaUrl: old.media_url };
    const changed = source.mediaId !== old.media_id || source.mediaUrl !== old.media_url;
    const audio = input.audioRightsStatus ?? (input.audioApproved === undefined ? (changed ? "pending_review" : old.audio_rights_status) : input.audioApproved ? "approved" : "pending_review");
    const approved = input.contentApproved ?? (changed ? false : old.content_approved);
    const r = rows(await tx.execute(sql`UPDATE mb_archive_videos SET label=${input.label},media_url=${source.mediaUrl},media_id=${source.mediaId},source_note=${input.sourceNote === undefined ? old.source_note : input.sourceNote || null},release_at=${input.releaseAt === undefined ? old.release_at : input.releaseAt},audio_rights_status=${audio},content_approved=${approved},status='draft',updated_at=NOW() WHERE id=${input.videoId} RETURNING *`))[0];
    return { ...ready, saved: true, video: normalizeVideo(r) };
  });
}
export async function assignVideo(input: any, remove = false) {
  const db = await contentDb();
  if (!db) return remove ? { ...pending, removed: false } : { database: "migration_pending" as const, assigned: false };
  await db.transaction(async tx => {
    await lockStory(tx, input.artworkId);
    if (!rows(await tx.execute(sql`SELECT id FROM mb_archive_videos WHERE id=${input.videoId}`))[0]) notFound("Archive video not found");
    if (remove) {
      await tx.execute(sql`DELETE FROM mb_archive_artwork_videos WHERE artwork_id=${input.artworkId} AND video_id=${input.videoId}`);
    } else {
      if (input.isDefault) await tx.execute(sql`UPDATE mb_archive_artwork_videos SET is_default=FALSE WHERE artwork_id=${input.artworkId}`);
      await tx.execute(sql`INSERT INTO mb_archive_artwork_videos(artwork_id,video_id,is_default) VALUES(${input.artworkId},${input.videoId},${input.isDefault ?? true}) ON CONFLICT(artwork_id,video_id) DO UPDATE SET is_default=EXCLUDED.is_default`);
    }
  });
  return remove ? { ...ready, removed: true } : { ...ready, assigned: true };
}
export async function publishStory(input: any, actorId: number) {
  const db = await contentDb();
  if (!db) return { ...pending, published: false };
  if (input.approval !== true) badRequest("Explicit publication approval is required");
  const releaseAt = input.releaseAt ?? null, expiresAt = input.expiresAt ?? null;
  if (expiresAt && new Date(expiresAt).getTime() <= (releaseAt ? new Date(releaseAt).getTime() : Date.now())) badRequest("Expiry must be after release time");
  return db.transaction(async tx => {
    const { artwork, story } = await lockStory(tx, input.artworkId);
    if (!story.title.trim() || !story.body.trim()) badRequest("Save a story title and body before publishing");
    const selected = rows(await tx.execute(sql`
      SELECT v.*,av.is_default FROM mb_archive_videos v JOIN mb_archive_artwork_videos av ON av.video_id=v.id
      WHERE av.artwork_id=${input.artworkId} ${input.videoId ? sql`AND v.id=${input.videoId}` : sql``}
      ORDER BY av.is_default DESC,v.id FOR UPDATE OF v
    `));
    if (!selected.length) badRequest("Assign at least one video before publishing");
    if (selected.some(v => v.status === "retired" || !v.content_approved || v.audio_rights_status !== "approved")) badRequest("Every selected video needs saved content and audio-rights approval");
    const videos = [];
    for (const v of selected) {
      const source = await resolveMedia(tx, { mediaId: v.media_id || undefined, mediaUrl: v.media_id ? undefined : v.media_url });
      videos.push({ id: Number(v.id), label: v.label, url: source.mediaUrl, mediaId: source.mediaId, isDefault: v.is_default, releaseAt: v.release_at ? new Date(v.release_at).toISOString() : null });
    }
    const payload = { stableKey: artwork.stable_key, title: story.title, subtitle: story.subtitle, body: story.body, era: story.era, location: story.location, displayOrder: story.display_order, recognitionEnabled: story.recognition_enabled, videos };
    const version = Number(rows(await tx.execute(sql`SELECT COALESCE(MAX(version),0)+1 AS version FROM mb_content_snapshots WHERE artwork_id=${input.artworkId}`))[0].version);
    const snapshotId = randomUUID();
    const publication = rows(await tx.execute(sql`INSERT INTO mb_content_snapshots(id,artwork_id,version,payload,approved_by_user_id,release_at,expires_at) VALUES(${snapshotId},${input.artworkId},${version},${JSON.stringify(payload)}::jsonb,${actorId},${releaseAt},${expiresAt}) RETURNING id,version,published_at,release_at,expires_at`))[0];
    // Multiple assigned draft videos can reuse one uploaded file. Its first eligible release wins.
    const mediaReleases = new Map<string, string | null>();
    for (const v of videos) if (v.mediaId) {
      const existing = mediaReleases.get(v.mediaId);
      if (!mediaReleases.has(v.mediaId) || v.releaseAt === null || (existing !== null && new Date(v.releaseAt).getTime() < new Date(existing!).getTime())) mediaReleases.set(v.mediaId, v.releaseAt);
    }
    for (const [mediaId, mediaRelease] of Array.from(mediaReleases.entries())) {
      await tx.execute(sql`INSERT INTO mb_content_snapshot_media(snapshot_id,media_id,release_at) VALUES(${snapshotId},${mediaId},${mediaRelease})`);
    }
    await tx.execute(sql`INSERT INTO mb_content_publications(artwork_id,snapshot_id,enabled) VALUES(${input.artworkId},${snapshotId},TRUE) ON CONFLICT(artwork_id) DO UPDATE SET snapshot_id=EXCLUDED.snapshot_id,enabled=TRUE,updated_at=NOW()`);
    return { ...ready, published: true, snapshotId, publication };
  });
}
export async function unpublishStory(artworkId: number) {
  const db = await contentDb();
  if (!db) return { ...pending, unpublished: false };
  await db.transaction(async tx => { await lockStory(tx, artworkId); await tx.execute(sql`UPDATE mb_content_publications SET enabled=FALSE,updated_at=NOW() WHERE artwork_id=${artworkId}`); });
  return { ...ready, unpublished: true };
}
export function snapshotToPublic(row: any, now: Date) {
  const p = row.payload;
  if (!p || !Object.hasOwn(ARTWORK_REFERENCES, p.stableKey)) return null;
  // Explicit allowlist: draft notes, actor IDs, filesystem paths, members never leave here.
  const videos = (Array.isArray(p.videos) ? p.videos : []).filter((v: any) => !v.releaseAt || new Date(v.releaseAt).getTime() <= now.getTime())
    .map((v: any) => ({ id: Number(v.id), label: v.label, url: v.mediaId ? mediaPath(v.mediaId) : v.url, mediaId: v.mediaId ?? null, isDefault: Boolean(v.isDefault), releaseAt: v.releaseAt ?? null }));
  return { id: p.stableKey, artworkId: Number(row.artwork_id), snapshotId: row.id, version: Number(row.version), ...ARTWORK_REFERENCES[p.stableKey as StableKey], title: p.title, subtitle: p.subtitle, body: p.body, era: p.era, location: p.location, displayOrder: p.displayOrder, recognitionEnabled: p.recognitionEnabled, publishedAt: row.published_at, releaseAt: row.release_at, expiresAt: row.expires_at, videos };
}
export async function publicContent() {
  const db = await contentDb();
  const envelope = { schemaVersion: 1, version: 1, ...flags };
  if (!db) return { ...envelope, ...pending, artworks: [], items: [], videoDestinations: {} };
  // DB timestamp is also passed to mapper: scheduling decisions use one shared clock per response.
  const result = rows(await db.execute(sql`SELECT s.*,NOW() AS feed_now FROM mb_content_publications p JOIN mb_content_snapshots s ON s.id=p.snapshot_id JOIN mb_archive_artworks a ON a.id=p.artwork_id WHERE p.enabled AND a.deleted_at IS NULL AND (s.release_at IS NULL OR s.release_at<=NOW()) AND (s.expires_at IS NULL OR s.expires_at>NOW()) ORDER BY (s.payload->>'displayOrder')::int,a.stable_key`));
  const artworks = result.map(r => snapshotToPublic(r, new Date(r.feed_now))).filter((r): r is NonNullable<ReturnType<typeof snapshotToPublic>> => r !== null);
  const videoDestinations: Record<string, any> = {};
  const items = artworks.map(a => {
    const first = a.videos.find((v: any) => v.isDefault) ?? a.videos[0];
    if (first) videoDestinations[a.id] = { url: first.url, label: first.label, status: "approved" };
    return { artworkId: a.id, version: a.version, story: { title: a.title, body: a.body }, video: first ? { url: first.url, label: first.label } : null };
  });
  return { ...envelope, ...ready, artworks, items, videoDestinations };
}
export async function mediaCurrentlyPublished(db: any, mediaId: string) {
  return Boolean(rows(await db.execute(sql`SELECT 1 FROM mb_content_snapshot_media sm JOIN mb_content_publications p ON p.snapshot_id=sm.snapshot_id JOIN mb_content_snapshots s ON s.id=p.snapshot_id JOIN mb_archive_artworks a ON a.id=p.artwork_id WHERE sm.media_id=${mediaId} AND p.enabled AND a.deleted_at IS NULL AND (s.release_at IS NULL OR s.release_at<=NOW()) AND (s.expires_at IS NULL OR s.expires_at>NOW()) AND (sm.release_at IS NULL OR sm.release_at<=NOW()) LIMIT 1`))[0]);
}
