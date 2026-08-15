import { sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  extractTextFromDriveFile,
  getDriveFileMetadata,
  listDriveFiles,
  mimeTypeToFileType,
  type DriveFile,
} from "../googleDriveService";
import { calculateContentHash } from "../knowledgeBaseDb";

const ROOT_LABEL = "Turbo Response Drive";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const DISCOVERY_PAGES_PER_BATCH = 12;
const IMPORTS_PER_BATCH = 6;
const MAX_CONTINUATION_BATCHES = 160;
const CONTINUATION_DELAY_MS = 150;

type SqlRow = Record<string, any>;
type IngestionRunRow = SqlRow & { id: number; status: string; root_folder_id: string };
type IngestionFolderRow = SqlRow & { id: number; folder_id: string; source_path: string; next_page_token?: string | null };
type IngestionItemRow = SqlRow & { id: number; drive_file_id: string; status: string; drive_modified_at?: string | null };

let activeBatch: Promise<Awaited<ReturnType<typeof processDriveIngestionBatchInternal>>> | null = null;
let activeContinuation: Promise<void> | null = null;

function rows(result: unknown): SqlRow[] {
  return ((result as any)?.rows ?? result ?? []) as SqlRow[];
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown Drive ingestion error";
}

function isNotFound(error: unknown): boolean {
  const candidate = error as { code?: number; response?: { status?: number } };
  return candidate?.code === 404 || candidate?.response?.status === 404;
}

function appendPath(parent: string, name: string): string {
  return `${parent.replace(/\/+$/, "")}/${name.replace(/^\/+/, "")}`;
}

export function shouldRequeueDriveItem(
  existing: Pick<IngestionItemRow, "drive_modified_at" | "status"> | undefined,
  incomingModifiedAt: string | null | undefined,
): boolean {
  if (!existing) return true;
  if (existing.status === "failed" || existing.status === "unavailable") return true;
  return (existing.drive_modified_at ?? null) !== (incomingModifiedAt ?? null);
}

async function getLatestRun(db: any): Promise<IngestionRunRow | null> {
  const result = await db.execute(sql`
    SELECT * FROM drive_ingestion_runs
    ORDER BY id DESC
    LIMIT 1
  `);
  return (rows(result)[0] as IngestionRunRow | undefined) ?? null;
}

async function getActiveRun(db: any): Promise<IngestionRunRow | null> {
  const result = await db.execute(sql`
    SELECT * FROM drive_ingestion_runs
    WHERE status = 'running'
    ORDER BY id DESC
    LIMIT 1
  `);
  return (rows(result)[0] as IngestionRunRow | undefined) ?? null;
}

async function refreshRunCounts(db: any, runId: number): Promise<void> {
  await db.execute(sql`
    UPDATE drive_ingestion_runs
    SET
      discovered_count = (SELECT COUNT(*) FROM drive_ingestion_items WHERE last_seen_run_id = ${runId}),
      imported_count = (SELECT COUNT(*) FROM drive_ingestion_items WHERE last_seen_run_id = ${runId} AND status = 'imported'),
      updated_count = (SELECT COUNT(*) FROM drive_ingestion_items WHERE last_seen_run_id = ${runId} AND status = 'imported' AND knowledge_document_id IS NOT NULL),
      unchanged_count = (SELECT COUNT(*) FROM drive_ingestion_items WHERE last_seen_run_id = ${runId} AND status = 'unchanged'),
      failed_count = (SELECT COUNT(*) FROM drive_ingestion_items WHERE last_seen_run_id = ${runId} AND status = 'failed'),
      unavailable_count = (SELECT COUNT(*) FROM drive_ingestion_items WHERE last_seen_run_id = ${runId} AND status = 'unavailable'),
      updated_at = NOW()
    WHERE id = ${runId}
  `);
}

async function startRun(db: any, rootFolderId: string): Promise<IngestionRunRow> {
  const existing = await getActiveRun(db);
  if (existing) return existing;

  const result = await db.execute(sql`
    INSERT INTO drive_ingestion_runs (root_folder_id, status)
    VALUES (${rootFolderId}, 'running')
    RETURNING *
  `);
  const run = rows(result)[0] as IngestionRunRow;
  await db.execute(sql`
    INSERT INTO drive_ingestion_folders (run_id, folder_id, source_path, scan_status)
    VALUES (${run.id}, ${rootFolderId}, ${ROOT_LABEL}, 'pending')
    ON CONFLICT (run_id, folder_id) DO NOTHING
  `);
  return run;
}

async function listPendingFolder(db: any, runId: number): Promise<IngestionFolderRow | null> {
  const result = await db.execute(sql`
    SELECT * FROM drive_ingestion_folders
    WHERE run_id = ${runId} AND scan_status = 'pending'
    ORDER BY id ASC
    LIMIT 1
  `);
  return (rows(result)[0] as IngestionFolderRow | undefined) ?? null;
}

async function discoverFolderPage(db: any, run: IngestionRunRow, folder: IngestionFolderRow): Promise<void> {
  try {
    const page = await listDriveFiles(folder.folder_id, {
      pageToken: folder.next_page_token || undefined,
      pageSize: 100,
    });

    for (const file of page.files) {
      if (file.mimeType === FOLDER_MIME_TYPE) {
        await db.execute(sql`
          INSERT INTO drive_ingestion_folders (run_id, folder_id, parent_folder_id, source_path, scan_status)
          VALUES (${run.id}, ${file.id}, ${folder.folder_id}, ${appendPath(folder.source_path, file.name)}, 'pending')
          ON CONFLICT (run_id, folder_id) DO NOTHING
        `);
        continue;
      }

      const existingResult = await db.execute(sql`
        SELECT * FROM drive_ingestion_items
        WHERE drive_file_id = ${file.id}
        LIMIT 1
      `);
      const existing = rows(existingResult)[0] as IngestionItemRow | undefined;
      const requeue = shouldRequeueDriveItem(existing, file.modifiedTime);
      const nextStatus = requeue ? "pending" : "unchanged";

      if (existing) {
        await db.execute(sql`
          UPDATE drive_ingestion_items
          SET
            last_seen_run_id = ${run.id},
            file_name = ${file.name},
            mime_type = ${file.mimeType},
            source_path = ${appendPath(folder.source_path, file.name)},
            source_url = ${file.webViewLink ?? null},
            drive_modified_at = ${file.modifiedTime || null},
            status = ${nextStatus},
            last_error = NULL,
            updated_at = NOW()
          WHERE id = ${existing.id}
        `);
      } else {
        await db.execute(sql`
          INSERT INTO drive_ingestion_items (
            drive_file_id, last_seen_run_id, file_name, mime_type, source_path,
            source_url, drive_modified_at, status
          ) VALUES (
            ${file.id}, ${run.id}, ${file.name}, ${file.mimeType}, ${appendPath(folder.source_path, file.name)},
            ${file.webViewLink ?? null}, ${file.modifiedTime || null}, 'pending'
          )
        `);
      }
    }

    await db.execute(sql`
      UPDATE drive_ingestion_folders
      SET
        next_page_token = ${page.nextPageToken ?? null},
        scan_status = ${page.nextPageToken ? "pending" : "complete"},
        last_error = NULL,
        updated_at = NOW()
      WHERE id = ${folder.id}
    `);
  } catch (error) {
    const message = errorMessage(error);
    await db.execute(sql`
      UPDATE drive_ingestion_folders
      SET scan_status = 'failed', last_error = ${message}, updated_at = NOW()
      WHERE id = ${folder.id}
    `);
    await db.execute(sql`
      UPDATE drive_ingestion_runs
      SET last_error = ${message}, updated_at = NOW()
      WHERE id = ${run.id}
    `);
  }
}

async function discoverBoundedBatch(db: any, run: IngestionRunRow): Promise<number> {
  let scanned = 0;
  while (scanned < DISCOVERY_PAGES_PER_BATCH) {
    const folder = await listPendingFolder(db, run.id);
    if (!folder) break;
    await discoverFolderPage(db, run, folder);
    scanned += 1;
  }
  return scanned;
}

async function pendingFolderCount(db: any, runId: number): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM drive_ingestion_folders
    WHERE run_id = ${runId} AND scan_status = 'pending'
  `);
  return Number(rows(result)[0]?.count ?? 0);
}

async function getPendingItems(db: any, runId: number): Promise<IngestionItemRow[]> {
  const result = await db.execute(sql`
    SELECT * FROM drive_ingestion_items
    WHERE last_seen_run_id = ${runId} AND status = 'pending'
    ORDER BY id ASC
    LIMIT ${IMPORTS_PER_BATCH}
  `);
  return rows(result) as IngestionItemRow[];
}

async function importItem(db: any, run: IngestionRunRow, item: IngestionItemRow): Promise<void> {
  try {
    const file = await getDriveFileMetadata(item.drive_file_id);
    const content = await extractTextFromDriveFile(file);
    const contentHash = content ? calculateContentHash(content) : null;
    const existingResult = await db.execute(sql`
      SELECT id FROM knowledge_documents
      WHERE drive_file_id = ${file.id}
      LIMIT 1
    `);
    const existingDocument = rows(existingResult)[0];

    if (existingDocument) {
      await db.execute(sql`
        UPDATE knowledge_documents
        SET
          title = ${file.name},
          source = 'google_drive',
          source_system = 'google_drive',
          "sourceUrl" = ${file.webViewLink ?? item.source_url ?? null},
          "fileType" = ${mimeTypeToFileType(file.mimeType)},
          content = COALESCE(${content}, content),
          content_hash = COALESCE(${contentHash}, content_hash),
          drive_mime_type = ${file.mimeType},
          drive_modified_at = ${file.modifiedTime || null},
          source_path = ${item.source_path},
          ingestion_status = 'imported',
          ingestion_error = NULL,
          ingested_at = NOW(),
          "isProcessed" = 1,
          synced_to_xai = CASE WHEN ${content !== null} THEN 0 ELSE synced_to_xai END,
          "updatedAt" = NOW()
        WHERE id = ${existingDocument.id}
      `);
      await db.execute(sql`
        UPDATE drive_ingestion_items
        SET knowledge_document_id = ${existingDocument.id}, status = 'imported', last_error = NULL, processed_at = NOW(), updated_at = NOW()
        WHERE id = ${item.id}
      `);
    } else {
      const result = await db.execute(sql`
        INSERT INTO knowledge_documents (
          title, category, source, source_system, "sourceUrl", "fileType", content,
          status, content_hash, drive_file_id, drive_mime_type, drive_modified_at,
          source_path, ingestion_status, ingested_at, "isProcessed"
        ) VALUES (
          ${file.name}, 'Google Drive', 'google_drive', 'google_drive', ${file.webViewLink ?? item.source_url ?? null},
          ${mimeTypeToFileType(file.mimeType)}, ${content}, 'needs_review', ${contentHash},
          ${file.id}, ${file.mimeType}, ${file.modifiedTime || null}, ${item.source_path}, 'imported', NOW(), 1
        ) RETURNING id
      `);
      const documentId = Number(rows(result)[0]?.id);
      await db.execute(sql`
        UPDATE drive_ingestion_items
        SET knowledge_document_id = ${documentId}, status = 'imported', last_error = NULL, processed_at = NOW(), updated_at = NOW()
        WHERE id = ${item.id}
      `);
    }
  } catch (error) {
    const unavailable = isNotFound(error);
    const message = errorMessage(error);
    await db.execute(sql`
      UPDATE drive_ingestion_items
      SET
        status = ${unavailable ? "unavailable" : "failed"},
        last_error = ${message},
        processed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${item.id}
    `);
    await db.execute(sql`
      UPDATE drive_ingestion_runs
      SET last_error = ${message}, updated_at = NOW()
      WHERE id = ${run.id}
    `);
  }
}

async function completeRunIfSettled(db: any, run: IngestionRunRow): Promise<void> {
  const folders = await pendingFolderCount(db, run.id);
  const pendingItems = await getPendingItems(db, run.id);
  if (folders || pendingItems.length) return;

  // A file previously seen in Drive but not seen during this completed scan is
  // retained for provenance and marked unavailable; it is never deleted here.
  await db.execute(sql`
    UPDATE drive_ingestion_items
    SET status = 'unavailable', last_error = 'File was not present in the completed Drive scan', updated_at = NOW()
    WHERE last_seen_run_id <> ${run.id} AND status <> 'unavailable'
  `);
  await db.execute(sql`
    UPDATE knowledge_documents
    SET ingestion_status = 'unavailable', ingestion_error = 'File was not present in the completed Drive scan', updated_at = NOW()
    WHERE drive_file_id IN (
      SELECT drive_file_id FROM drive_ingestion_items
      WHERE last_seen_run_id <> ${run.id} AND status = 'unavailable'
    )
  `);

  const itemCounts = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
      COUNT(*) FILTER (WHERE status = 'unavailable')::int AS unavailable
    FROM drive_ingestion_items
    WHERE last_seen_run_id = ${run.id}
  `);
  const summary = rows(itemCounts)[0] ?? {};
  const folderFailures = await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM drive_ingestion_folders
    WHERE run_id = ${run.id} AND scan_status = 'failed'
  `);
  const hasErrors = Number(summary.failed ?? 0) + Number(summary.unavailable ?? 0) + Number(rows(folderFailures)[0]?.count ?? 0) > 0;
  await db.execute(sql`
    UPDATE drive_ingestion_runs
    SET status = ${hasErrors ? "completed_with_errors" : "completed"}, completed_at = NOW(), updated_at = NOW()
    WHERE id = ${run.id}
  `);
}

export async function startDriveIngestionRun() {
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootFolderId) throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const run = await startRun(db, rootFolderId);
  await refreshRunCounts(db, run.id);
  ensureDriveIngestionContinuation();
  return getDriveIngestionStatus();
}

async function processDriveIngestionBatchInternal() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootFolderId) throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured");
  const run = (await getActiveRun(db)) ?? await startRun(db, rootFolderId);

  const pagesScanned = await discoverBoundedBatch(db, run);
  const foldersRemaining = await pendingFolderCount(db, run.id);
  let filesAttempted = 0;
  if (foldersRemaining === 0) {
    const pendingItems = await getPendingItems(db, run.id);
    for (const item of pendingItems) {
      await importItem(db, run, item);
      filesAttempted += 1;
    }
  }

  await refreshRunCounts(db, run.id);
  await completeRunIfSettled(db, run);
  const status = await getDriveIngestionStatus();
  return { ...status, pagesScanned, filesAttempted };
}

export async function processDriveIngestionBatch() {
  if (activeBatch) return activeBatch;
  activeBatch = processDriveIngestionBatchInternal().finally(() => {
    activeBatch = null;
  });
  return activeBatch;
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Continue the active, persisted run server-side in small batches. Every batch
 * commits independently, so a restart leaves a truthful resumable checkpoint.
 */
export function ensureDriveIngestionContinuation() {
  if (activeContinuation) return activeContinuation;

  activeContinuation = (async () => {
    try {
      for (let batch = 0; batch < MAX_CONTINUATION_BATCHES; batch += 1) {
        const status = await getDriveIngestionStatus();
        if (!status.run || status.run.status !== "running" || status.pending === 0) break;
        await processDriveIngestionBatch();
        await wait(CONTINUATION_DELAY_MS);
      }
    } catch (error) {
      console.error("[DriveIngestion] Continuation worker stopped:", error);
    } finally {
      activeContinuation = null;
    }
  })();

  return activeContinuation;
}

/** Resume only a previously-started run; never starts a new ingestion on boot. */
export function resumePersistedDriveIngestion() {
  void getDriveIngestionStatus()
    .then((status) => {
      if (status.run?.status === "running" && status.pending > 0) {
        ensureDriveIngestionContinuation();
      }
    })
    .catch((error) => {
      console.warn("[DriveIngestion] Could not inspect a persisted run on startup:", error);
    });
}

export async function getDriveIngestionStatus() {
  const db = await getDb();
  if (!db) {
    return {
      available: false,
      run: null,
      discovered: 0,
      imported: 0,
      pending: 0,
      failed: 0,
      unavailable: 0,
      lastSync: null,
    };
  }
  const run = await getLatestRun(db);
  if (!run) {
    return {
      available: true,
      run: null,
      discovered: 0,
      imported: 0,
      pending: 0,
      failed: 0,
      unavailable: 0,
      lastSync: null,
    };
  }
  const itemCounts = await db.execute(sql`
    SELECT
      COUNT(*)::int AS discovered,
      COUNT(*) FILTER (WHERE status = 'imported')::int AS imported,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
      COUNT(*) FILTER (WHERE status = 'unavailable')::int AS unavailable,
      COUNT(*) FILTER (WHERE status = 'unchanged')::int AS unchanged
    FROM drive_ingestion_items
    WHERE last_seen_run_id = ${run.id}
  `);
  const count = rows(itemCounts)[0] ?? {};
  const pendingFolders = await pendingFolderCount(db, run.id);
  return {
    available: true,
    run: {
      id: Number(run.id),
      status: run.status,
      rootFolderId: run.root_folder_id,
      startedAt: run.started_at,
      completedAt: run.completed_at,
      lastError: run.last_error,
    },
    discovered: Number(count.discovered ?? 0),
    imported: Number(count.imported ?? 0),
    pending: Number(count.pending ?? 0) + pendingFolders,
    failed: Number(count.failed ?? 0),
    unavailable: Number(count.unavailable ?? 0),
    unchanged: Number(count.unchanged ?? 0),
    lastSync: run.updated_at ?? run.completed_at ?? run.started_at,
  };
}
