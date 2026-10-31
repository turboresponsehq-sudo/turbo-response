/** Private Creator Portal uploads on the Render persistent disk, NEVER public /uploads. */
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.CREATOR_WORKSPACE_UPLOAD_DIR || "/data/creator-uploads";
const MAX_SIZE = 8 * 1024 * 1024;
export const MAX_WORKSPACE_FILE_BYTES = MAX_SIZE;

export const allowedWorkspaceMimes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export function safeAttachmentName(name: string) {
  return name.replace(/[\r\n\0]/g, " ").replace(/[\\/]/g, "-").trim().slice(0, 160) || "attachment";
}

export async function saveWorkspaceFile(portalId: number, data: Buffer) {
  if (!Number.isSafeInteger(portalId) || portalId <= 0 || !data.length || data.length > MAX_SIZE) {
    throw new Error("Invalid file or size");
  }
  const storageId = randomUUID();
  const folder = join(BASE, String(portalId));
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await writeFile(join(folder, storageId), data, { flag: "wx", mode: 0o600 });
  return storageId;
}

export async function getWorkspaceFile(portalId: number, storageId: string) {
  if (!Number.isSafeInteger(portalId) || portalId <= 0 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storageId)) {
    return null;
  }
  try { return await readFile(join(BASE, String(portalId), storageId)); }
  catch { return null; }
}
