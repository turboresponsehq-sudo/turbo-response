import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const mocked = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("../../db", () => ({ getDb: mocked.getDb }));
import { moneyBossesRouter } from "../../routers/moneyBossesRouter";
import { archiveContent, publicContent, snapshotToPublic } from "./service";
import { DEFAULT_EXTERNAL_DESTINATION_LABEL, isSafeArchiveDestinationUrl, isSafeExternalVideoUrl, publishArchiveDestinationSchema, saveArchiveDestinationSchema } from "./validation";

const caller = (role: string | null = "admin") => moneyBossesRouter.createCaller({ user: role ? { id: 7, role } as any : null, req: {} as any, res: {} as any });
const instagram = "https://www.instagram.com/reel/approved/?utm_source=qr#archive";
const youtube = "https://www.youtube.com/watch?v=archive&t=30#details";
beforeEach(() => { mocked.getDb.mockReset(); mocked.getDb.mockResolvedValue(null); });

// In-memory SQL harness only: never connects to or modifies any staging database.
function unitDb(options: { migrated?: boolean; body?: string; videos?: any[] } = {}) {
  const dialect = new PgDialect();
  const state = {
    migrated: options.migrated ?? true,
    draft: { artwork_id: 1, title: "Tony Tripp", subtitle: "", body: options.body ?? "", era: "", location: "", display_order: 0, recognition_enabled: true, external_url: null as string | null, external_label: null as string | null },
    snapshots: [] as any[], active: null as string | null, enabled: false,
    videos: options.videos ?? [], queries: [] as { sql: string; params: any[] }[],
  };
  const execute = vi.fn(async (query: any) => {
    const q = dialect.sqlToQuery(query), text = q.sql.replace(/\s+/g, " ").trim(), p = q.params;
    state.queries.push({ sql: text, params: p });
    const result = (rows: any[]) => ({ rows });
    if (text.includes("to_regclass(")) return result([{ publication: "mb_content_publications", media: "mb_content_media", drafts: "mb_content_story_drafts" }]);
    if (text.includes("information_schema.columns")) return result([{ destinations_ready: state.migrated }]);
    if (text.startsWith("SELECT id, stable_key FROM mb_archive_artworks")) return result(p[0] === 1 ? [{ id: 1, stable_key: "tony-tripp" }] : []);
    if (text.startsWith("SELECT * FROM mb_content_story_drafts")) return result([{ ...state.draft }]);
    if (text.startsWith("UPDATE mb_content_story_drafts SET external_url=")) {
      state.draft.external_url = p[0]; state.draft.external_label = p[1];
      return result([{ ...state.draft, updated_by_user_id: p[2] }]);
    }
    if (text.startsWith("SELECT v.*,av.is_default")) return result(state.videos);
    if (text.startsWith("SELECT COALESCE(MAX(version)")) return result([{ version: state.snapshots.length + 1 }]);
    if (text.startsWith("INSERT INTO mb_content_snapshots(")) {
      const snapshot = { id: p[0], artwork_id: p[1], version: p[2], payload: JSON.parse(p[3]), approved_by_user_id: p[4], release_at: p[5], expires_at: p[6], published_at: "2026-01-01T00:00:00Z", feed_now: "2026-01-02T00:00:00Z" };
      state.snapshots.push(snapshot);
      return result([{ id: snapshot.id, version: snapshot.version, published_at: snapshot.published_at, release_at: snapshot.release_at, expires_at: snapshot.expires_at }]);
    }
    if (text.startsWith("INSERT INTO mb_content_publications(")) { state.active = p[1]; state.enabled = true; return result([]); }
    if (text.startsWith("UPDATE mb_content_publications SET enabled=FALSE")) { state.enabled = false; return result([]); }
    if (text.startsWith("SELECT s.*,NOW() AS feed_now")) return result(state.enabled ? state.snapshots.filter(s => s.id === state.active) : []);
    if (text.startsWith("SELECT a.id,a.stable_key")) return result([{ id: "1", stable_key: "tony-tripp", external_url: state.draft.external_url, external_label: state.draft.external_label }]);
    if (text.startsWith("SELECT d.*,a.stable_key")) return result([{ ...state.draft, stable_key: "tony-tripp", snapshot_id: state.active, enabled: state.enabled }]);
    if (text.startsWith("SELECT id,label,media_url") || text.startsWith("SELECT s.id AS snapshot_id") || text.startsWith("SELECT artwork_id,video_id,is_default")) return result([]);
    throw new Error(`Unexpected unit SQL: ${text}`);
  });
  const db: any = { execute, transaction: vi.fn(async (run: any) => run({ execute })) };
  mocked.getDb.mockResolvedValue(db);
  return { db, state };
}

describe("External archive destination validation and authorization", () => {
  it.each([instagram, youtube, "https://youtu.be/archive?t=30", "https://archive.example.com/story?from=qr#section", "https://archive.example.com:443/story", "https://www.instagram.com./p/approved/"])("accepts a public handoff %s", url => {
    expect(isSafeArchiveDestinationUrl(url)).toBe(true);
    expect(saveArchiveDestinationSchema.safeParse({ artworkId: 1, url }).success).toBe(true);
  });
  it.each([
    "http://www.youtube.com/watch?v=archive", "javascript:alert(1)", "data:text/html,hello", "file:///tmp/story", "/local/path",
    "https://owner:secret@www.instagram.com/reel/x", "https://owner@www.youtube.com/", "https://localhost/story", "https://metadata.google.internal/story", "https://archive.local/story", "https://archive.localdomain/story", "https://archive.private/story", "https://archive.lan/story", "https://archive.home/story", "https://127.0.0.1/story", "https://10.0.0.1/story", "https://172.16.0.1/story", "https://192.168.0.1/story", "https://169.254.169.254/story", "https://127.1/story", "https://2130706433/story", "https://0x7f000001/story", "https://[::1]/story", "https://[2001:4860:4860::8888]/story", "https://archive.example.com:8080/story", "https://singlelabel/story", "https://archive.example.com/<script>", "https://archive.example.com/?x=javascript:alert(1)", "https://archive.example.com/#%6Aavascript%3Aalert(1)", "https://archive.example.com/%0A", "https://archive.example.com\\@localhost/story",
  ])("rejects unsafe handoff %s", url => expect(isSafeArchiveDestinationUrl(url)).toBe(false));
  it("bounds labels and URLs, supports null clearing, and excludes generic bypass flags", () => {
    expect(saveArchiveDestinationSchema.parse({ artworkId: 1, url: null }).url).toBeNull();
    expect(saveArchiveDestinationSchema.safeParse({ artworkId: 1, url: instagram, label: "x".repeat(160) }).success).toBe(true);
    expect(saveArchiveDestinationSchema.safeParse({ artworkId: 1, url: instagram, label: "x".repeat(161) }).success).toBe(false);
    expect(saveArchiveDestinationSchema.safeParse({ artworkId: 1, url: `https://archive.example.com/${"x".repeat(2000)}` }).success).toBe(false);
    for (const input of [{ artworkId: 1 }, { artworkId: 1, approval: false }, { artworkId: 1, approval: true, externalOnly: true }, { artworkId: 1, approval: true, videoId: 1 }]) expect(publishArchiveDestinationSchema.safeParse(input).success).toBe(false);
    expect(isSafeExternalVideoUrl(instagram)).toBe(false);
  });
  it.each([null, "user", "amani_admin"])("blocks role %s before DB access", async role => {
    await expect(caller(role).saveArchiveDestination({ artworkId: 1, url: instagram })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller(role).publishArchiveDestination({ artworkId: 1, approval: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocked.getDb).not.toHaveBeenCalled();
  });
  it("rejects invalid inputs before DB access", async () => {
    expect(isSafeArchiveDestinationUrl("https://archive.example.com/?percent=100%25&literal=%2525#part%20two")).toBe(true);
    expect(isSafeArchiveDestinationUrl("https://@archive.example.com/story")).toBe(false);
    expect(isSafeArchiveDestinationUrl("https://archive.example.com/#javascript%25253Aalert(1)")).toBe(false);
    await expect(caller().saveArchiveDestination({ artworkId: 1, url: "https://127.0.0.1/" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller().publishArchiveDestination({ artworkId: 1, approval: false } as any)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocked.getDb).not.toHaveBeenCalled();
  });
  it("returns honest pending states for unavailable DB or migration 0029", async () => {
    expect(await caller().saveArchiveDestination({ artworkId: 1, url: instagram })).toEqual({ database: "migration_pending", ready: false, saved: false });
    expect(await caller().publishArchiveDestination({ artworkId: 1, approval: true })).toEqual({ database: "migration_pending", ready: false, published: false });
    const { db } = unitDb({ migrated: false });
    expect(await caller().saveArchiveDestination({ artworkId: 1, url: instagram })).toMatchObject({ ready: false, saved: false });
    expect(await caller().publishArchiveDestination({ artworkId: 1, approval: true })).toMatchObject({ ready: false, published: false });
    expect(db.transaction).not.toHaveBeenCalled();
  });
});

describe("External destination draft and immutable publication behavior", () => {
  it("keeps drafts private until Publish, versions replacements, clears only the draft, and reuses existing Unpublish", async () => {
    const { db, state } = unitDb({ videos: [{ id: 2, content_approved: false, audio_rights_status: "blocked" }] });
    const saved = await caller().saveArchiveDestination({ artworkId: 1, url: instagram });
    expect(saved.story).toMatchObject({ external_url: instagram, external_label: DEFAULT_EXTERNAL_DESTINATION_LABEL, body: "" });
    expect((await publicContent()).items).toEqual([]);
    const first = await caller().publishArchiveDestination({ artworkId: 1, approval: true });
    expect(first).toMatchObject({ ready: true, published: true, publication: { version: 1 } });
    expect(state.snapshots[0].payload).toMatchObject({ body: "", videos: [], externalDestination: { url: instagram, label: DEFAULT_EXTERNAL_DESTINATION_LABEL } });
    expect((await publicContent()).items[0]).toEqual({ artworkId: "tony-tripp", version: 1, story: { title: "Tony Tripp", body: "" }, video: null, destination: { type: "external", url: instagram, label: DEFAULT_EXTERNAL_DESTINATION_LABEL } });
    expect((await publicContent()).videoDestinations).toEqual({});
    await caller().saveArchiveDestination({ artworkId: 1, url: youtube, label: "  Watch interview  " });
    const admin = await archiveContent();
    expect(admin.artworks[0]).toMatchObject({ id: 1, external_url: youtube, external_label: "Watch interview" });
    expect(admin.stories[0]).toMatchObject({ artworkId: 1, external_url: youtube, external_label: "Watch interview" });
    expect((await publicContent()).items[0].destination?.url).toBe(instagram);
    await caller().publishArchiveDestination({ artworkId: 1, approval: true });
    expect(state.snapshots).toHaveLength(2);
    expect(state.snapshots[0].payload.externalDestination.url).toBe(instagram);
    expect((await publicContent()).items[0]).toMatchObject({ version: 2, destination: { url: youtube, label: "Watch interview" } });
    expect((await caller().saveArchiveDestination({ artworkId: 1, url: null, label: "Ignored on clear" })).story).toMatchObject({ external_url: null, external_label: null });
    expect((await publicContent()).items[0].destination?.url).toBe(youtube);
    await expect(caller().publishArchiveDestination({ artworkId: 1, approval: true })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(state.snapshots).toHaveLength(2);
    await caller().unpublishArchiveArtwork({ artworkId: 1 });
    expect((await publicContent()).items).toEqual([]);
    expect(state.snapshots).toHaveLength(2);
    expect(db.transaction).toHaveBeenCalled();
    expect(state.queries.some(q => q.sql.includes("mb_archive_videos") && q.sql.includes("FOR UPDATE OF v"))).toBe(false);
    expect(state.queries.some(q => q.sql.startsWith("INSERT INTO mb_content_snapshot_media"))).toBe(false);
    const publishIndex = state.queries.findIndex(q => q.sql.startsWith("INSERT INTO mb_content_snapshots"));
    expect(state.queries[publishIndex - 1].sql).toContain("MAX(version)");
    expect(state.queries[publishIndex - 2].sql).toContain("mb_content_story_drafts WHERE artwork_id=$1 FOR UPDATE");
    expect(state.queries[publishIndex + 1].sql).toContain("ON CONFLICT(artwork_id) DO UPDATE");
    expect(state.queries.filter(q => q.sql.startsWith("INSERT INTO mb_content_snapshots"))[0].params[4]).toBe(7);
  });
  it("defaults a blank label and rejects unknown original artwork or invalid stored destinations", async () => {
    const { state } = unitDb();
    expect((await caller().saveArchiveDestination({ artworkId: 1, url: youtube, label: "  " })).story?.external_label).toBe(DEFAULT_EXTERNAL_DESTINATION_LABEL);
    await expect(caller().saveArchiveDestination({ artworkId: 999, url: youtube })).rejects.toMatchObject({ code: "NOT_FOUND" });
    state.draft.external_url = "https://127.0.0.1/";
    await expect(caller().publishArchiveDestination({ artworkId: 1, approval: true })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(state.snapshots).toEqual([]);
  });
  it("does not weaken the old MP4 title/body and video/audio approval gates", async () => {
    const { state } = unitDb();
    await caller().saveArchiveDestination({ artworkId: 1, url: youtube });
    await expect(caller().publishArchiveArtwork({ artworkId: 1, approval: true, externalOnly: true } as any)).rejects.toThrow("Save a story title and body");
    state.draft.body = "Existing MP4 story";
    await expect(caller().publishArchiveArtwork({ artworkId: 1, approval: true })).rejects.toThrow("Assign at least one video");
    state.videos.push({ id: 2, label: "Unapproved", is_default: true, status: "draft", content_approved: false, audio_rights_status: "blocked" });
    await expect(caller().publishArchiveArtwork({ artworkId: 1, approval: true })).rejects.toThrow("content and audio-rights approval");
    state.videos[0] = { id: 2, label: "Approved MP4", is_default: true, status: "draft", content_approved: true, audio_rights_status: "approved", media_url: "https://media.example.com/archive.mp4", media_id: null, release_at: null };
    await caller().publishArchiveArtwork({ artworkId: 1, approval: true });
    expect(state.snapshots[0].payload).not.toHaveProperty("externalDestination");
    const feed = await publicContent();
    expect(feed.items[0]).not.toHaveProperty("destination");
    expect(feed.items[0].video).toEqual({ url: "https://media.example.com/archive.mp4", label: "Approved MP4" });
    expect(feed.videoDestinations["tony-tripp"]).toEqual({ url: "https://media.example.com/archive.mp4", label: "Approved MP4", status: "approved" });
  });
  it("allowlists published destination fields without private metadata and omits malformed destinations", () => {
    const row = { id: "snapshot", artwork_id: 1, version: 1, payload: { stableKey: "tony-tripp", title: "Published", body: "", videos: [], externalDestination: { url: youtube, label: "Watch", sourceNote: "PRIVATE", actorId: 7, accessToken: "PRIVATE" }, external_url: "PRIVATE", updated_by_user_id: 7 } };
    const result = snapshotToPublic(row, new Date())!;
    expect(result.destination).toEqual({ type: "external", url: youtube, label: "Watch" });
    expect(JSON.stringify(result)).not.toContain("PRIVATE");
    expect(result).not.toHaveProperty("externalDestination");
    expect(snapshotToPublic({ ...row, payload: { ...row.payload, externalDestination: { url: "javascript:alert(1)", label: "Unsafe" } } }, new Date())).not.toHaveProperty("destination");
  });
  it("never fetches external links and migration 0029 cannot rewrite existing content", () => {
    const service = readFileSync(resolve(process.cwd(), "server/modules/moneyBosses/service.ts"), "utf8");
    expect(service).not.toMatch(/\bfetch\(|https?\.get\(|axios\./);
    const migration = readFileSync(resolve(process.cwd(), "migrations/0029_external_archive_destinations.sql"), "utf8");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS external_url");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS external_label");
    expect(migration).not.toMatch(/\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE TABLE\b/i);
  });
});
