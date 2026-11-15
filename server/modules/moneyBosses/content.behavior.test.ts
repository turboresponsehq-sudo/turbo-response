import { beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const mocked = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("../../db", () => ({ getDb: mocked.getDb }));
import { moneyBossesRouter } from "../../routers/moneyBossesRouter";
import { publicContent, snapshotToPublic } from "./service";
import { ARTWORK_REFERENCES, isSafeExternalVideoUrl, videoCreateSchema, publishSchema } from "./validation";
import { parseByteRange, signPreviewTicket, verifyPreviewTicket, validMp4Signature, validateProbe, ticketHasCurrentAdmin } from "./media";

const caller = (role: string | null) => moneyBossesRouter.createCaller({ user: role ? { id: 1, role } as any : null, req: {} as any, res: {} as any });
beforeEach(() => { mocked.getDb.mockReset(); mocked.getDb.mockResolvedValue(null); process.env.MB_ARCHIVE_PREVIEW_SECRET = "unit-only-preview-secret-012345678901234567890"; });
describe("Money Bosses content security behavior", () => {
  it.each([null, "user", "amani_admin"])("blocks every new write and preview for role %s before DB access", async role => {
    const c = caller(role);
    const operations = [
      () => c.saveArchiveStory({ artworkId: 1, storyTitle: "Title", storyBody: "Body" }),
      () => c.updateArchiveVideo({ videoId: 1, label: "Video" }),
      () => c.publishArchiveArtwork({ artworkId: 1, approval: true }),
      () => c.unpublishArchiveArtwork({ artworkId: 1 }),
      () => c.createArchiveMediaPreview({ mediaId: randomUUID() }),
      () => c.removeArchiveVideoAssignment({ artworkId: 1, videoId: 1 }),
    ];
    for (const operation of operations) await expect(operation()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocked.getDb).not.toHaveBeenCalled();
  });
  it("returns explicit pending state and empty public feed without DB", async () => {
    expect(await caller("admin").saveArchiveStory({ artworkId: 1, storyTitle: "Title", storyBody: "Body" })).toMatchObject({ ready: false, saved: false });
    expect(await caller("admin").publishArchiveArtwork({ artworkId: 1, approval: true })).toMatchObject({ ready: false, published: false });
    expect(await publicContent()).toMatchObject({ ready: false, credentialsEnabled: false, membershipEnabled: false, items: [], artworks: [], videoDestinations: {} });
  });
  it.each(["javascript:alert(1)", "http://media.example.com/a.mp4", "https://instagram.com/a", "https://www.instagram.com/a", "https://user:pass@media.example.com/a", "https://localhost/a", "https://localhost.localdomain/a", "https://media.local/a", "https://169.254.169.254/a", "https://127.1/a", "https://2130706433/a", "https://[::1]/a", "https://media.example.com:8080/a", "file:///tmp/a.mp4"])("rejects unsafe external URL %s", url => expect(isSafeExternalVideoUrl(url)).toBe(false));
  it("preserves HTTPS draft shape and permits only exact stable uploaded paths", () => {
    expect(videoCreateSchema.safeParse({ label: "Draft", mediaUrl: "https://media.example.com/video.mp4", releaseAt: "2030-01-01T12:00:00Z" }).success).toBe(true);
    const id = randomUUID();
    expect(videoCreateSchema.safeParse({ label: "Draft", mediaUrl: `/api/money-bosses/media/${id}` }).success).toBe(true);
    expect(videoCreateSchema.safeParse({ label: "Draft", mediaUrl: `/api/money-bosses/media/${id}?ticket=secret` }).success).toBe(false);
    expect(videoCreateSchema.safeParse({ label: "Draft", mediaUrl: "/etc/passwd" }).success).toBe(false);
    expect(videoCreateSchema.safeParse({ label: "Draft", mediaId: id, mediaUrl: "https://media.example.com/a.mp4" }).success).toBe(false);
  });
  it("requires literal explicit publication approval", () => {
    expect(publishSchema.safeParse({ artworkId: 1, approval: false }).success).toBe(false);
    expect(publishSchema.safeParse({ artworkId: 1 }).success).toBe(false);
  });
  it("keeps exact approved artwork reference checksums", () => {
    expect(Object.keys(ARTWORK_REFERENCES)).toEqual(["tony-tripp", "rod-tre", "cow-pac"]);
    expect(Object.values(ARTWORK_REFERENCES).map(a => a.sha256)).toEqual(["4a1dab1ea4014ad7c8eb45de9246d3f4abd4c7151ee41d3b54c0460d0b321f63", "f6a73e7db9d4ab6d2c1d732185f38511ff46e6e0232aea0319da5883a1b195d5", "2ded90dcd1b1788819ff208fec427bdf34061055f7ce403945deabcd0d6b7f28"]);
    const supplied = "/home/ubuntu/money-bosses-v4/public/data/artwork-references.json";
    if (existsSync(supplied)) {
      const source = JSON.parse(readFileSync(supplied, "utf8"));
      for (const a of source.artworks) expect(ARTWORK_REFERENCES[a.id as keyof typeof ARTWORK_REFERENCES]).toEqual({ subject: a.subject, label: a.label, image: a.image, sha256: a.sha256, alt: a.alt });
    }
  });
  it("public mapper only exposes snapshot content and hides scheduled videos", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const row = { id: randomUUID(), artwork_id: 1, version: 1, approved_by_user_id: 999, payload: { stableKey: "tony-tripp", title: "Published", body: "Body", sourceNote: "PRIVATE", memberEmail: "PRIVATE", storageKey: "/PRIVATE", videos: [ { id: 1, label: "Live", url: "https://media.example.com/live.mp4", sourceNote: "PRIVATE", isDefault: true }, { id: 2, label: "Future", url: "https://media.example.com/future.mp4", releaseAt: "2026-01-02T00:00:00Z" } ] } };
    const published = snapshotToPublic(row, now)!;
    expect(published.videos).toHaveLength(1);
    expect(JSON.stringify(published)).not.toContain("PRIVATE");
    expect(published).not.toHaveProperty("approved_by_user_id");
    expect(snapshotToPublic({ ...row, payload: { stableKey: "fake-artwork" } }, now)).toBeNull();
  });
});
describe("MP4 and range validation", () => {
  it("checks ftyp brand and box size instead of filename or MIME", () => {
    const header = Buffer.alloc(24); header.writeUInt32BE(24); header.write("ftyp", 4); header.write("isom", 8);
    expect(validMp4Signature(header)).toBe(true);
    header.write("qt  ", 8); expect(validMp4Signature(header)).toBe(false);
    expect(validMp4Signature(Buffer.from("not really an mp4, despite extension"))).toBe(false);
    header.write("isom", 8); header.writeUInt32BE(50000); expect(validMp4Signature(header)).toBe(false);
  });
  const valid = { format: { format_name: "mov,mp4,m4a,3gp,3g2,mj2", duration: "1.2" }, streams: [{ codec_type: "video", codec_name: "h264", width: 320, height: 240 }, { codec_type: "audio", codec_name: "aac" }] };
  it("accepts H264/AAC or silent H264 and rejects unsupported codecs/nonvideo", () => {
    expect(validateProbe(valid)).toEqual({ durationSeconds: 1.2, videoCodec: "h264", audioCodec: "aac" });
    expect(validateProbe({ ...valid, streams: valid.streams.slice(0, 1) }).audioCodec).toBeNull();
    expect(() => validateProbe({ ...valid, streams: [{ ...valid.streams[0], codec_name: "hevc" }] })).toThrow();
    expect(() => validateProbe({ ...valid, streams: [valid.streams[0], { codec_type: "audio", codec_name: "opus" }] })).toThrow();
    expect(() => validateProbe({ ...valid, streams: [valid.streams[1]] })).toThrow();
    expect(() => validateProbe({ ...valid, format: { ...valid.format, duration: "NaN" } })).toThrow();
  });
  it.each([
    [undefined, null], ["bytes=0-9", { start: 0, end: 9 }], ["bytes=95-200", { start: 95, end: 99 }], ["bytes=40-", { start: 40, end: 99 }], ["bytes=-10", { start: 90, end: 99 }], ["bytes=-200", { start: 0, end: 99 }],
    ["bytes=100-", "invalid"], ["bytes=10-2", "invalid"], ["bytes=-0", "invalid"], ["bytes=0-1,4-5", "invalid"], ["bytes=", "invalid"], ["bytes=9007199254740993-", "invalid"],
  ])("parses range %s", (header, expected) => expect(parseByteRange(header as string | undefined, 100)).toEqual(expected));
});
describe("Private previews", () => {
  it("binds ticket to exact media and user and rejects expiry/tampering", () => {
    const media = randomUUID(), now = 1700000000000;
    const signed = signPreviewTicket(media, 7, now);
    expect(verifyPreviewTicket(signed.ticket, media, now)).toEqual({ userId: 7 });
    expect(verifyPreviewTicket(signed.ticket, randomUUID(), now)).toBeNull();
    expect(verifyPreviewTicket(signed.ticket, media, now + 300000)).toBeNull();
    expect(verifyPreviewTicket(`${signed.ticket}x`, media, now)).toBeNull();
  });
  it("checks current admin role each time rather than trusting signed claims", async () => {
    const media = randomUUID(), signed = signPreviewTicket(media, 7);
    const db = { execute: vi.fn().mockResolvedValueOnce({ rows: [{ id: 7 }] }).mockResolvedValueOnce({ rows: [] }) };
    expect(await ticketHasCurrentAdmin(db, signed.ticket, media)).toBe(true);
    expect(await ticketHasCurrentAdmin(db, signed.ticket, media)).toBe(false);
    expect(db.execute).toHaveBeenCalledTimes(2);
  });
  it("contains no arbitrary external fetch or shell interpolation in media code", () => {
    const source = readFileSync(resolve(process.cwd(), "server/modules/moneyBosses/media.ts"), "utf8");
    expect(source).toContain('"-protocol_whitelist", "file,pipe"');
    expect(source).toContain('"-enable_drefs", "0"');
    expect(source).not.toMatch(/\bfetch\(|(?<!\.)\bexec\(/);
  });
});
