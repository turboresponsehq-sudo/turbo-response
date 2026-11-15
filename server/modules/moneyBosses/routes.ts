import type { Express, Request, Response, NextFunction } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { unlink } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { createContext } from "../../_core/context";
import { contentDb, rows, ready, pending } from "./database";
import { flags, mediaIdSchema, mediaPath } from "./validation";
import { MAX_UPLOAD_BYTES, inspectUploadedMedia, openPrivateMedia, parseByteRange, randomStorageKey, signPreviewTicket, storageDirectory, ticketHasCurrentAdmin } from "./media";
import { mediaCurrentlyPublished, publicContent } from "./service";

const activeUploads = new Map<number, number>();
const privateStorage: multer.StorageEngine = {
  _handleFile(req, file, cb) {
    storageDirectory().then(destination => {
      const filename = randomStorageKey(), filePath = path.join(destination, filename);
      const output = createWriteStream(filePath, { flags: "wx", mode: 0o600 });
      let settled = false;
      const detach = () => { req.off("aborted", abort); file.stream.off("error", sourceError); };
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true; detach();
        if (error) { file.stream.unpipe(output); file.stream.resume(); unlink(filePath).catch(() => undefined).then(() => cb(error)); }
        else cb(null, { destination, filename, path: filePath, size: output.bytesWritten });
      };
      const abort = () => output.destroy(new Error("Upload interrupted"));
      // Multer itself handles source-stream errors and decrements its write counter;
      // destroy/unlink our destination without invoking its callback a second time.
      const sourceError = () => { if (settled) return; settled = true; detach(); output.destroy(); void unlink(filePath).catch(() => undefined); };
      req.once("aborted", abort); file.stream.once("error", sourceError);
      output.once("error", finish); output.once("finish", () => finish());
      if (req.aborted) abort(); else file.stream.pipe(output);
    }, cb);
  },
  _removeFile(_req, file, cb) { unlink(file.path).then(() => cb(null), error => cb(error.code === "ENOENT" ? null : error)); },
};
const upload = multer({
  storage: privateStorage,
  // Busboy counts the closing boundary toward its parts limit; files/fields enforce the actual form shape.
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 0, parts: 2, fieldNameSize: 32, headerPairs: 50 },
}).single("file");
const noStore = (res: Response) => { res.setHeader("Cache-Control", "no-store, private"); res.setHeader("X-Content-Type-Options", "nosniff"); };
const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => { handler(req, res).catch(next); };
function uploadOriginAllowed(req: Request) {
  const origin = req.get("origin");
  if (!origin) return true;
  try {
    const o = new URL(origin);
    if (o.host === req.get("host") && ["http:", "https:"].includes(o.protocol)) return true;
    return process.env.NODE_ENV === "development" && origin === process.env.MONEY_BOSSES_DEV_ORIGIN;
  } catch { return false; }
}
export function registerMoneyBossesContentRoutes(app: Express) {
  app.get("/api/money-bosses/content", asyncRoute(async (_req, res) => {
    noStore(res);
    res.json(await publicContent());
  }));
  app.post("/api/money-bosses/uploads", asyncRoute(async (req, res) => {
    noStore(res);
    if (!uploadOriginAllowed(req)) { res.status(403).json({ error: "Upload origin is not allowed" }); return; }
    const context = await createContext({ req, res, info: {} as any });
    if (!context.user) { res.status(401).json({ error: "Admin authentication is required" }); return; }
    if (context.user.role !== "admin") { res.status(403).json({ error: "Current admin role is required" }); return; }
    const userId = Number(context.user.id);
    if ((activeUploads.get(userId) ?? 0) >= 2) { res.status(429).json({ error: "Too many concurrent uploads" }); return; }
    const db = await contentDb();
    if (!db) { res.status(503).json({ ...pending, error: "Content database is unavailable" }); return; }
    const mediaId = randomUUID();
    let preview: ReturnType<typeof signPreviewTicket>;
    try { await storageDirectory(); preview = signPreviewTicket(mediaId, userId); }
    catch { res.status(503).json({ error: "Private media storage or preview signing is unavailable" }); return; }
    activeUploads.set(userId, (activeUploads.get(userId) ?? 0) + 1);
    let keepFile = false;
    try {
      await new Promise<void>((resolve, reject) => upload(req, res, err => err ? reject(err) : resolve()));
      const file = req.file;
      if (!file) { res.status(400).json({ error: "Provide one MP4 in multipart field file" }); return; }
      let metadata: Awaited<ReturnType<typeof inspectUploadedMedia>>;
      try { metadata = await inspectUploadedMedia(file.path); }
      catch { res.status(400).json({ error: "Invalid MP4; use H.264 video and optional AAC audio" }); return; }
      if (req.aborted || res.destroyed) return;
      // Re-resolve current role after potentially lengthy multipart/codec work.
      if (!rows(await db.execute(sql`SELECT id FROM users WHERE id=${userId} AND role='admin' LIMIT 1`))[0]) { res.status(403).json({ error: "Admin authorization was revoked" }); return; }
      await db.execute(sql`INSERT INTO mb_content_media(id,storage_key,mime_type,size_bytes,duration_seconds,video_codec,audio_codec,sha256,uploaded_by_user_id) VALUES(${mediaId},${file.filename},'video/mp4',${file.size},${metadata.durationSeconds},${metadata.videoCodec},${metadata.audioCodec},${metadata.sha256},${userId})`);
      keepFile = true;
      const mediaUrl = mediaPath(mediaId);
      res.status(201).json({ ...ready, ...flags, mediaId, mediaUrl, previewUrl: `${mediaUrl}?ticket=${preview.ticket}`, media: { id: mediaId, mimeType: "video/mp4", sizeBytes: file.size, durationSeconds: metadata.durationSeconds, videoCodec: metadata.videoCodec, audioCodec: metadata.audioCodec } });
    } catch (error) {
      if (error instanceof multer.MulterError) res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "MP4 upload exceeds 100 MiB" : "Provide exactly one MP4 file and no additional multipart fields" });
      else res.status(503).json({ error: "Upload persistence is unavailable" });
    } finally {
      if (!keepFile && req.file?.path) await unlink(req.file.path).catch(() => undefined);
      const remaining = (activeUploads.get(userId) ?? 1) - 1;
      if (remaining) activeUploads.set(userId, remaining); else activeUploads.delete(userId);
    }
  }));
  app.get("/api/money-bosses/media/:id", asyncRoute(async (req, res) => {
    noStore(res);
    const id = mediaIdSchema.safeParse(req.params.id);
    if (!id.success) { res.status(404).json({ error: "Media not found" }); return; }
    const db = await contentDb();
    if (!db) { res.status(404).json({ error: "Media not found" }); return; }
    if (req.query.ticket !== undefined) {
      if (typeof req.query.ticket !== "string" || !(await ticketHasCurrentAdmin(db, req.query.ticket, id.data))) { res.status(403).json({ error: "Preview ticket is invalid, expired, or revoked" }); return; }
    } else if (!(await mediaCurrentlyPublished(db, id.data))) { res.status(404).json({ error: "Media not found" }); return; }
    const media = rows(await db.execute(sql`SELECT storage_key,size_bytes FROM mb_content_media WHERE id=${id.data}`))[0];
    if (!media) { res.status(404).json({ error: "Media not found" }); return; }
    let opened: Awaited<ReturnType<typeof openPrivateMedia>>;
    try { opened = await openPrivateMedia(media.storage_key); }
    catch { res.status(404).json({ error: "Media not found" }); return; }
    if (opened.size !== Number(media.size_bytes)) { await opened.handle.close(); res.status(404).json({ error: "Media not found" }); return; }
    const range = parseByteRange(req.headers.range, opened.size);
    res.setHeader("Accept-Ranges", "bytes");
    if (range === "invalid") { await opened.handle.close(); res.setHeader("Content-Range", `bytes */${opened.size}`); res.status(416).end(); return; }
    const start = range ? range.start : 0, end = range ? range.end : opened.size - 1;
    res.status(range ? 206 : 200);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'inline; filename="archive.mp4"');
    res.setHeader("Content-Length", end - start + 1);
    if (range) res.setHeader("Content-Range", `bytes ${start}-${end}/${opened.size}`);
    if (req.method === "HEAD") { await opened.handle.close(); res.end(); return; }
    const stream = opened.handle.createReadStream({ start, end, autoClose: true });
    stream.on("error", () => res.destroy());
    res.on("close", () => stream.destroy());
    stream.pipe(res);
  }));
}
