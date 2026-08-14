/**
 * Google Drive Service
 * Provides authenticated access to Google Drive for document listing and content extraction.
 * Prefers a server-side Google OAuth connection and retains the Service Account
 * path as a backward-compatible fallback until OAuth is verified in production.
 * 
 * Required environment variables:
 *   GOOGLE_SERVICE_ACCOUNT_JSON — full JSON of the service account key file
 *   GOOGLE_DRIVE_FOLDER_ID      — the root folder ID to sync from
 */

import { google } from "googleapis";
import { getGoogleDriveOAuthAuthClient } from "./services/googleDriveOAuthService";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  parents?: string[];
}

async function getAuthClient() {
  const oauthClient = await getGoogleDriveOAuthAuthClient();
  if (oauthClient) return oauthClient;

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("Google Drive OAuth is not connected and GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error("Google Drive OAuth is not connected and GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  return auth;
}

/**
 * List files in a Google Drive folder (non-recursive by default)
 */
export async function listDriveFiles(
  folderId: string,
  options: { pageToken?: string; pageSize?: number } = {}
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, parents)",
    pageSize: options.pageSize || 50,
    pageToken: options.pageToken,
    orderBy: "modifiedTime desc",
  });

  return {
    files: (response.data.files || []) as DriveFile[],
    nextPageToken: response.data.nextPageToken || undefined,
  };
}

/**
 * List all files recursively in a folder tree
 */
export async function listDriveFilesRecursive(
  folderId: string
): Promise<DriveFile[]> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const allFiles: DriveFile[] = [];
  const queue: string[] = [folderId];

  while (queue.length > 0) {
    const currentFolderId = queue.shift()!;
    let pageToken: string | undefined;

    do {
      const response = await drive.files.list({
        q: `'${currentFolderId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, parents)",
        pageSize: 100,
        pageToken,
        orderBy: "name",
      });

      const files = (response.data.files || []) as DriveFile[];
      pageToken = response.data.nextPageToken || undefined;

      for (const file of files) {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          queue.push(file.id);
        } else {
          allFiles.push(file);
        }
      }
    } while (pageToken);
  }

  return allFiles;
}

/**
 * Export a Google Doc/Sheet/Slide as plain text
 */
export async function exportGoogleDocAsText(fileId: string): Promise<string> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.export(
    { fileId, mimeType: "text/plain" },
    { responseType: "text" }
  );

  return response.data as string;
}

/**
 * Download a binary file (PDF, DOCX, etc.) as a Buffer
 */
export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

/**
 * Get file metadata
 */
export async function getDriveFileMetadata(fileId: string): Promise<DriveFile> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, modifiedTime, size, webViewLink, parents",
  });

  return response.data as DriveFile;
}

/**
 * Extract text content from a Drive file based on its MIME type
 * Returns null if the file type is not supported for text extraction
 */
export async function extractTextFromDriveFile(file: DriveFile): Promise<string | null> {
  const googleDocTypes = [
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.spreadsheet",
    "application/vnd.google-apps.presentation",
  ];

  if (googleDocTypes.includes(file.mimeType)) {
    try {
      return await exportGoogleDocAsText(file.id);
    } catch (err) {
      console.error(`[Drive] Failed to export ${file.name} as text:`, err);
      return null;
    }
  }

  // For plain text files
  if (file.mimeType === "text/plain") {
    try {
      const buffer = await downloadDriveFile(file.id);
      return buffer.toString("utf-8");
    } catch (err) {
      console.error(`[Drive] Failed to download text file ${file.name}:`, err);
      return null;
    }
  }

  // PDF and DOCX require additional parsing libraries — return null for now
  // Phase 2: integrate pdf-parse or mammoth for these types
  return null;
}

/**
 * Map Google Drive MIME type to a human-readable file type label
 */
export function mimeTypeToFileType(mimeType: string): string {
  const map: Record<string, string> = {
    "application/vnd.google-apps.document": "Google Doc",
    "application/vnd.google-apps.spreadsheet": "Google Sheet",
    "application/vnd.google-apps.presentation": "Google Slides",
    "application/vnd.google-apps.folder": "Folder",
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "text/plain": "TXT",
    "text/csv": "CSV",
  };
  return map[mimeType] || mimeType.split("/").pop() || "Unknown";
}
