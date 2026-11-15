import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import type { Server } from "node:http";
import { request as httpRequest } from "node:http";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { registerMoneyBossesContentRoutes } from "./routes";
import { moneyBossesRouter } from "../../routers/moneyBossesRouter";

const enabled = process.env.MB_RUN_INTEGRATION === "1";
const execFileAsync = promisify(execFile);
// Deliberately opt-in; refuses every non-isolated database, including production.
describe.skipIf(!enabled)("Money Bosses local PostgreSQL + multipart integration", () => {
  let pool: Pool, server: Server, base: string, adminId: number, email: string, token: string, temporary: string, media: any, fixture: Buffer;
  let tony: number, rod: number, cow: number, videoId: number;
  let oldStories: any[] = [], oldPublications: any[] = [];
  const caller = () => moneyBossesRouter.createCaller({ user: { id: adminId, role: "admin", email } as any, req: {} as any, res: {} as any });
  const request = (url: string, init?: RequestInit) => fetch(`${base}${url}`, init);
  async function multipart(data: Buffer, authorization: string | null = token, name = "test.mp4") {
    const form = new FormData(); form.append("file", new Blob([new Uint8Array(data)], { type: "video/mp4" }), name);
    return request("/api/money-bosses/uploads", { method: "POST", headers: authorization ? { Authorization: `Bearer ${authorization}` } : {}, body: form });
  }
  beforeAll(async () => {
    const u = new URL(process.env.DATABASE_URL || "missing://missing");
    if (u.hostname !== "127.0.0.1" || u.port !== "55432" || u.pathname !== "/money_bosses_staging") throw new Error("Integration tests are restricted to isolated 127.0.0.1:55432/money_bosses_staging");
    if (!process.env.MB_ARCHIVE_STORAGE_DIR || !process.env.JWT_SECRET) throw new Error("Source the private local runtime.env before opt-in tests");
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    email = `mb-backend-test-${Date.now()}@local.invalid`;
    adminId = Number((await pool.query("INSERT INTO users(email,role) VALUES($1,'admin') RETURNING id", [email])).rows[0].id);
    token = jwt.sign({ userId: adminId, email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    oldStories = (await pool.query("SELECT * FROM mb_content_story_drafts")).rows;
    oldPublications = (await pool.query("SELECT * FROM mb_content_publications")).rows;
    const artworks = (await pool.query("SELECT id,stable_key FROM mb_archive_artworks WHERE stable_key IN ('tony-tripp','rod-tre','cow-pac')")).rows;
    tony = Number(artworks.find(a => a.stable_key === "tony-tripp").id); rod = Number(artworks.find(a => a.stable_key === "rod-tre").id); cow = Number(artworks.find(a => a.stable_key === "cow-pac").id);
    await pool.query("UPDATE mb_content_publications SET enabled=FALSE");
    temporary = await mkdtemp(path.join(os.tmpdir(), "mb-content-test-"));
    const fixturePath = path.join(temporary, "fixture.mp4");
    await execFileAsync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=black:s=160x120:r=15", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=44100", "-t", "1", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", fixturePath]);
    fixture = await readFile(fixturePath);
    const app = express(); registerMoneyBossesContentRoutes(app);
    app.use((_err: any, _req: any, res: any, _next: any) => res.status(500).json({ error: "Test server error" }));
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>(resolve => server.once("listening", resolve));
    base = `http://127.0.0.1:${(server.address() as any).port}`;
  }, 30000);
  afterAll(async () => {
    if (server) await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
    if (pool) {
      // Restore parent's draft/publication state; immutable historical test snapshots remain retained.
      for (const s of oldStories) await pool.query("UPDATE mb_content_story_drafts SET title=$1,subtitle=$2,body=$3,era=$4,location=$5,display_order=$6,recognition_enabled=$7,updated_by_user_id=$8,updated_at=$9 WHERE artwork_id=$10", [s.title,s.subtitle,s.body,s.era,s.location,s.display_order,s.recognition_enabled,s.updated_by_user_id,s.updated_at,s.artwork_id]);
      if (oldStories.length) await pool.query("DELETE FROM mb_content_publications WHERE artwork_id=ANY($1::bigint[])", [oldStories.map(s => s.artwork_id)]);
      for (const p of oldPublications) await pool.query("INSERT INTO mb_content_publications(artwork_id,snapshot_id,enabled,updated_at) VALUES($1,$2,$3,$4) ON CONFLICT(artwork_id) DO UPDATE SET snapshot_id=EXCLUDED.snapshot_id,enabled=EXCLUDED.enabled,updated_at=EXCLUDED.updated_at", [p.artwork_id,p.snapshot_id,p.enabled,p.updated_at]);
      if (adminId) await pool.query("DELETE FROM users WHERE id=$1", [adminId]);
      await pool.end();
    }
    if (temporary) await rm(temporary, { recursive: true, force: true });
  }, 30000);
  it("rejects unauthenticated, non-admin, cross-origin uploads before storing files", async () => {
    const before = await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!);
    expect((await multipart(fixture, null)).status).toBe(401);
    const nonAdmin = jwt.sign({ userId: adminId, email, role: "user" }, process.env.JWT_SECRET!);
    expect((await multipart(fixture, nonAdmin)).status).toBe(401);
    const form = new FormData(); form.append("file", new Blob([new Uint8Array(fixture)]), "a.mp4");
    expect((await request("/api/money-bosses/uploads", { method: "POST", headers: { Authorization: `Bearer ${token}`, Origin: "https://attacker.invalid" }, body: form })).status).toBe(403);
    expect(await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!)).toEqual(before);
  });
  it("rejects renamed and malformed files and cleans upload failures", async () => {
    const before = (await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!)).sort();
    expect((await multipart(Buffer.from("this is text"), token, "../../renamed.mp4")).status).toBe(400);
    const fake = Buffer.alloc(64); fake.writeUInt32BE(24); fake.write("ftyp",4); fake.write("isom",8);
    expect((await multipart(fake)).status).toBe(400);
    expect((await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!)).sort()).toEqual(before);
  });
  it("cleans interrupted multipart uploads without leaving partial files", async () => {
    const before = (await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!)).sort();
    const boundary = "mb-interrupted-test";
    const req = httpRequest(`${base}/api/money-bosses/uploads`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/form-data; boundary=${boundary}`, "Content-Length": 5000000 } });
    req.on("error", () => undefined);
    req.write(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="interrupted.mp4"\r\nContent-Type: video/mp4\r\n\r\n`);
    req.write(fixture);
    await new Promise(resolve => setTimeout(resolve, 150));
    req.destroy();
    for (let attempt=0;attempt<30;attempt++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      if (JSON.stringify((await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!)).sort()) === JSON.stringify(before)) break;
    }
    expect((await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!)).sort()).toEqual(before);
  });
  it("uploads verified H264/AAC privately and permits signed admin byte-range preview", async () => {
    const response = await multipart(fixture); expect(response.status).toBe(201);
    media = await response.json();
    expect(media).toMatchObject({ ready: true, credentialsEnabled: false, membershipEnabled: false, media: { videoCodec: "h264", audioCodec: "aac" } });
    expect(media.mediaUrl).toBe(`/api/money-bosses/media/${media.mediaId}`);
    expect((await request(media.mediaUrl)).status).toBe(404);
    const preview = await request(media.previewUrl, { headers: { Range: "bytes=0-31" } });
    expect(preview.status).toBe(206); expect(preview.headers.get("content-range")).toBe(`bytes 0-31/${fixture.length}`);
    expect(Buffer.from(await preview.arrayBuffer())).toEqual(fixture.subarray(0,32));
    expect((await request(`${media.mediaUrl}?ticket=invalid`)).status).toBe(403);
    const badRange = await request(media.previewUrl, { headers: { Range: "bytes=999999999-" } }); expect(badRange.status).toBe(416);
    const stored = (await pool.query("SELECT storage_key FROM mb_content_media WHERE id=$1", [media.mediaId])).rows[0];
    expect(stored.storage_key).toMatch(/^[a-f0-9]{64}\.mp4$/);
    expect(media).not.toHaveProperty("storage_key");
  });
  it("stores drafts and assignments while keeping public feed empty", async () => {
    await caller().saveArchiveStory({ artworkId: tony, storyTitle: "Approved story", storyBody: "Approved original history" });
    const result = await caller().createArchiveVideoDraft({ label: "Approved video", mediaId: media.mediaId, sourceNote: "PRIVATE DRAFT SOURCE NOTE" });
    expect(result.created).toBe(true); videoId = result.video!.id;
    await caller().assignArchiveVideo({ artworkId: tony, videoId });
    const internal = await caller().archiveContent();
    expect(internal.artworks.find(a => a.id === tony)).toMatchObject({ story_title: "Approved story", story_body: "Approved original history" });
    expect(internal.videos.find(v => v.id === videoId)).toMatchObject({ media_id: media.mediaId, source_note: "PRIVATE DRAFT SOURCE NOTE", status: "draft", audio_rights_status: "pending_review" });
    expect((await (await request("/api/money-bosses/content")).json()).items).toEqual([]);
    await expect(caller().publishArchiveArtwork({ artworkId: tony, approval: true })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller().publishArchiveArtwork({ artworkId: tony, approval: false } as any)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("publishes an immutable approved story/video snapshot and permits public range stream", async () => {
    await caller().updateArchiveVideo({ videoId, label: "Approved video", audioApproved: true, contentApproved: true });
    const released = await caller().publishArchiveArtwork({ artworkId: tony, videoId, approval: true });
    expect(released.published).toBe(true);
    const feed = await (await request("/api/money-bosses/content")).json();
    expect(feed.items).toContainEqual({ artworkId: "tony-tripp", version: released.publication!.version, story: { title: "Approved story", body: "Approved original history" }, video: { url: media.mediaUrl, label: "Approved video" } });
    expect(JSON.stringify(feed)).not.toContain("PRIVATE"); expect(JSON.stringify(feed)).not.toContain(email);
    const streamed = await request(media.mediaUrl, { headers: { Range: "bytes=-16" } }); expect(streamed.status).toBe(206);
    expect(Buffer.from(await streamed.arrayBuffer())).toEqual(fixture.subarray(fixture.length-16));
    await expect(pool.query("UPDATE mb_content_snapshots SET payload='{}'::jsonb WHERE id=$1", [released.snapshotId])).rejects.toThrow(/immutable/);
    await expect(pool.query("DELETE FROM mb_content_snapshot_media WHERE snapshot_id=$1", [released.snapshotId])).rejects.toThrow(/immutable/);
  });
  it("keeps active published metadata unchanged when next story/video draft is saved", async () => {
    await caller().saveArchiveStory({ artworkId: tony, storyTitle: "NEXT DRAFT TITLE", storyBody: "NEXT PRIVATE DRAFT BODY" });
    await caller().updateArchiveVideo({ videoId, label: "NEXT DRAFT VIDEO", mediaUrl: "https://media.example.com/next.mp4", sourceNote: "PRIVATE NEW NOTE" });
    const video = (await caller().archiveContent()).videos.find(v => v.id === videoId)!;
    expect(video).toMatchObject({ audio_rights_status: "pending_review", content_approved: false, media_id: null });
    const feed = await (await request("/api/money-bosses/content")).json();
    expect(feed.items[0].story.title).toBe("Approved story"); expect(feed.items[0].video.label).toBe("Approved video");
    expect(JSON.stringify(feed)).not.toContain("DRAFT"); expect((await request(media.mediaUrl)).status).toBe(200);
  });
  it("revokes admin preview after current identity demotion and restores role", async () => {
    await pool.query("UPDATE users SET role='user' WHERE id=$1", [adminId]);
    try { expect((await request(media.previewUrl)).status).toBe(403); expect((await multipart(fixture)).status).toBe(401); }
    finally { await pool.query("UPDATE users SET role='admin' WHERE id=$1", [adminId]); }
  });
  it("unpublishes immediately and denies previously public media", async () => {
    expect((await caller().unpublishArchiveArtwork({ artworkId: tony })).unpublished).toBe(true);
    expect((await (await request("/api/money-bosses/content")).json()).items).toEqual([]);
    expect((await request(media.mediaUrl)).status).toBe(404);
    expect((await request(media.previewUrl)).status).toBe(200);
  });
  it("denies scheduled future release and supports video-level scheduling", async () => {
    const future = new Date(Date.now()+3600000).toISOString();
    await caller().saveArchiveStory({ artworkId: rod, storyTitle: "Scheduled story", storyBody: "Not yet public" });
    const v = await caller().createArchiveVideoDraft({ label: "Scheduled", mediaId: media.mediaId });
    await caller().updateArchiveVideo({ videoId: v.video!.id, label: "Scheduled", audioApproved: true, contentApproved: true });
    await caller().assignArchiveVideo({ artworkId: rod, videoId: v.video!.id });
    await caller().publishArchiveArtwork({ artworkId: rod, approval: true, releaseAt: future });
    expect((await (await request("/api/money-bosses/content")).json()).items).toEqual([]); expect((await request(media.mediaUrl)).status).toBe(404);
    await caller().updateArchiveVideo({ videoId: v.video!.id, label: "Scheduled", releaseAt: future });
    await caller().publishArchiveArtwork({ artworkId: rod, approval: true });
    const feed = await (await request("/api/money-bosses/content")).json(); expect(feed.items[0].video).toBeNull(); expect((await request(media.mediaUrl)).status).toBe(404);
    await caller().unpublishArchiveArtwork({ artworkId: rod });
  });
  it("expires past windows, enforces default assignment uniqueness, and serializes concurrent publishes", async () => {
    await caller().saveArchiveStory({ artworkId: cow, storyTitle: "Cow story", storyBody: "Verified history" });
    const first = await caller().createArchiveVideoDraft({ label: "One", mediaUrl: "https://media.example.com/one.mp4" });
    const second = await caller().createArchiveVideoDraft({ label: "Two", mediaUrl: "https://media.example.com/two.mp4" });
    for (const v of [first.video!,second.video!]) {
      await caller().updateArchiveVideo({ videoId: v.id, label: v.label, audioApproved: true, contentApproved: true });
      await caller().assignArchiveVideo({ artworkId: cow, videoId: v.id });
    }
    const defaults = await pool.query("SELECT * FROM mb_archive_artwork_videos WHERE artwork_id=$1 AND is_default", [cow]); expect(defaults.rows).toHaveLength(1); expect(Number(defaults.rows[0].video_id)).toBe(second.video!.id);
    const releases = await Promise.all([caller().publishArchiveArtwork({ artworkId: cow, approval: true }), caller().publishArchiveArtwork({ artworkId: cow, approval: true })]);
    expect(releases[0].publication!.version).not.toBe(releases[1].publication!.version);
    const start = new Date(Date.now()-7200000).toISOString(), end = new Date(Date.now()-3600000).toISOString();
    await caller().publishArchiveArtwork({ artworkId: cow, approval: true, releaseAt: start, expiresAt: end });
    expect((await (await request("/api/money-bosses/content")).json()).items).toEqual([]);
    await expect(caller().publishArchiveArtwork({ artworkId: cow, approval: true, releaseAt: end, expiresAt: start })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("rejects oversized upload and leaves no partial private file", async () => {
    const before = (await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!)).sort();
    const response = await multipart(Buffer.alloc(100*1024*1024+1)); expect(response.status).toBe(413);
    expect((await readdir(process.env.MB_ARCHIVE_STORAGE_DIR!)).sort()).toEqual(before);
  }, 30000);
});
