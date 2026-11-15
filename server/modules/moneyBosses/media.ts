import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { chmod, mkdir, open, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { sql } from "drizzle-orm";
import { rows } from "./database";

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
export const PREVIEW_TTL_SECONDS = 300;
export const randomStorageKey = () => `${randomBytes(32).toString("hex")}.mp4`;
const execFileAsync = promisify(execFile);
const storageKeyPattern = /^[a-f0-9]{64}\.mp4$/;
function within(root: string, candidate: string) { const relative = path.relative(root, candidate); return !relative || (!relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative)); }
export async function storageDirectory() {
  const configured = process.env.MB_ARCHIVE_STORAGE_DIR;
  if (!configured || !path.isAbsolute(configured)) throw new Error("MB_ARCHIVE_STORAGE_DIR must be an absolute private persistent path");
  const dir = path.resolve(configured);
  // Never put uploaded drafts in this repository or any obvious static/docroot directory.
  const forbidden = [process.cwd(), "/home/ubuntu/command-center-audit", "/home/ubuntu/money-bosses-v4"];
  if (dir === path.parse(dir).root || path.dirname(dir) === path.parse(dir).root || forbidden.some(root => within(root, dir) || within(dir, root)) || dir.split(path.sep).some(p => ["public", "static", "dist", "dist-frontend", ".git"].includes(p))) throw new Error("Media storage must be a dedicated directory outside Git and static directories");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  if (await realpath(dir) !== dir) throw new Error("Symlink storage directories are not allowed");
  if (!(await stat(dir)).isDirectory()) throw new Error("Invalid storage directory");
  await chmod(dir, 0o700);
  return dir;
}
export async function privateMediaPath(key: string) {
  if (!storageKeyPattern.test(key)) throw new Error("Invalid media storage key");
  return path.join(await storageDirectory(), key);
}
export async function openPrivateMedia(key: string) {
  const handle = await open(await privateMediaPath(key), constants.O_RDONLY | constants.O_NOFOLLOW);
  const info = await handle.stat();
  if (!info.isFile()) { await handle.close(); throw new Error("Media is not a regular file"); }
  return { handle, size: info.size };
}
export function validMp4Signature(header: Buffer) {
  if (header.length < 16 || header.toString("ascii", 4, 8) !== "ftyp") return false;
  const boxSize = header.readUInt32BE(0);
  if (boxSize < 16 || boxSize > header.length || boxSize % 4 !== 0) return false;
  const allowed = new Set(["isom", "iso2", "iso3", "iso4", "iso5", "iso6", "mp41", "mp42", "avc1", "M4V "]);
  // Reject QuickTime/HEIC/AVIF disguised as MP4; actual codecs still checked by ffprobe.
  return allowed.has(header.toString("ascii", 8, 12));
}
export function validateProbe(probe: any) {
  const streams = Array.isArray(probe?.streams) ? probe.streams : [];
  const video = streams.filter((s: any) => s.codec_type === "video");
  const audio = streams.filter((s: any) => s.codec_type === "audio");
  const durationSeconds = Number(probe?.format?.duration);
  if (!String(probe?.format?.format_name ?? "").split(",").includes("mp4") || video.length !== 1 || audio.length > 1 || video.length + audio.length !== streams.length || video[0]?.codec_name !== "h264" || audio.some((s: any) => s.codec_name !== "aac") || !Number.isFinite(durationSeconds) || durationSeconds <= 0 || !Number.isInteger(video[0]?.width) || !Number.isInteger(video[0]?.height) || video[0].width <= 0 || video[0].height <= 0 || video[0]?.disposition?.attached_pic) throw new Error("Use a valid MP4 with one H.264 video stream and optional AAC audio");
  return { durationSeconds, videoCodec: "h264", audioCodec: audio[0]?.codec_name ?? null };
}
export async function inspectUploadedMedia(filePath: string) {
  const handle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size <= 0 || info.size > MAX_UPLOAD_BYTES) throw new Error("Invalid media size");
    const header = Buffer.alloc(Math.min(info.size, 4096));
    await handle.read(header, 0, header.length, 0);
    if (!validMp4Signature(header)) throw new Error("File does not have an MP4 signature");
  } finally { await handle.close(); }
  // Explicitly disable network protocols and external MOV data references. No server-side URL fetching.
  const { stdout } = await execFileAsync("ffprobe", ["-v", "error", "-protocol_whitelist", "file,pipe", "-enable_drefs", "0", "-use_absolute_path", "0", "-show_format", "-show_streams", "-of", "json", filePath], { timeout: 15000, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
  const metadata = validateProbe(JSON.parse(stdout));
  const hash = createHash("sha256");
  const hashHandle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  try { for await (const chunk of hashHandle.createReadStream({ autoClose: false })) hash.update(chunk); }
  finally { await hashHandle.close(); }
  await chmod(filePath, 0o600);
  return { ...metadata, sha256: hash.digest("hex") };
}
function previewSecret() {
  const secret = process.env.MB_ARCHIVE_PREVIEW_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("Private preview signing secret is unavailable");
  return secret;
}
export function signPreviewTicket(mediaId: string, userId: number, now = Date.now()) {
  const expiresAt = new Date(now + PREVIEW_TTL_SECONDS * 1000).toISOString();
  const payload = Buffer.from(JSON.stringify({ mediaId, userId, exp: Math.floor(now / 1000) + PREVIEW_TTL_SECONDS, nonce: randomBytes(16).toString("hex") })).toString("base64url");
  const signature = createHmac("sha256", previewSecret()).update(payload).digest("base64url");
  return { ticket: `${payload}.${signature}`, expiresAt };
}
export function verifyPreviewTicket(ticket: string, mediaId: string, now = Date.now()): { userId: number } | null {
  try {
    if (ticket.length > 2048) return null;
    const parts = ticket.split(".");
    if (parts.length !== 2) return null;
    const expected = createHmac("sha256", previewSecret()).update(parts[0]).digest();
    const actual = Buffer.from(parts[1], "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const p = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (p.mediaId !== mediaId || !Number.isSafeInteger(p.userId) || p.userId < 1 || !Number.isSafeInteger(p.exp) || p.exp <= Math.floor(now / 1000) || p.exp > Math.floor(now / 1000) + PREVIEW_TTL_SECONDS) return null;
    return { userId: p.userId };
  } catch { return null; }
}
export async function ticketHasCurrentAdmin(db: any, ticket: string, mediaId: string) {
  const claims = verifyPreviewTicket(ticket, mediaId);
  if (!claims) return false;
  return Boolean(rows(await db.execute(sql`SELECT id FROM users WHERE id=${claims.userId} AND role='admin' LIMIT 1`))[0]);
}
export function parseByteRange(header: string | undefined, size: number): { start: number; end: number } | null | "invalid" {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size <= 0) return "invalid";
  let start: number, end: number;
  if (!match[1]) { const suffix = Number(match[2]); if (!Number.isSafeInteger(suffix) || suffix <= 0) return "invalid"; start = Math.max(0, size - suffix); end = size - 1; }
  else { start = Number(match[1]); end = match[2] ? Number(match[2]) : size - 1; if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) return "invalid"; end = Math.min(end, size - 1); }
  return { start, end };
}
