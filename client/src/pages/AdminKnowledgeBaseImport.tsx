/**
 * Turbo Response — Google Drive Import Panel
 * Admin-only page for importing documents from Google Drive into the Knowledge Base.
 * Route: /admin/knowledge-base/import
 */

import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { trpc } from "@/lib/trpc";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

const MIME_ICONS: Record<string, string> = {
  "application/vnd.google-apps.document": "📄",
  "application/vnd.google-apps.spreadsheet": "📊",
  "application/vnd.google-apps.presentation": "📋",
  "application/vnd.google-apps.folder": "📁",
  "application/pdf": "📕",
  "text/plain": "📝",
};

function getMimeIcon(mimeType: string): string {
  return MIME_ICONS[mimeType] || "📄";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminKnowledgeBaseImport() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [defaultCategory, setDefaultCategory] = useState("General");
  const [importResults, setImportResults] = useState<any[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [folderId, setFolderId] = useState<string | undefined>(undefined);

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Check Drive config
  const { data: driveConfig } = trpc.googleDrive.checkConfig.useQuery();

  // List Drive files
  const {
    data: driveData,
    isLoading: filesLoading,
    error: filesError,
    refetch,
  } = trpc.googleDrive.listFiles.useQuery(
    { folderId },
    { enabled: !!driveConfig?.configured }
  );

  const bulkImportMutation = trpc.googleDrive.bulkImport.useMutation({
    onSuccess: (data) => {
      setImportResults(data.results);
      setSelectedFiles(new Set());
      setIsImporting(false);
    },
    onError: () => {
      setIsImporting(false);
    },
  });

  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const files = driveData?.files || [];
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const handleImport = () => {
    const files = driveData?.files || [];
    const toImport = files
      .filter((f) => selectedFiles.has(f.id))
      .map((f) => ({
        fileId: f.id,
        category: defaultCategory,
      }));

    if (toImport.length === 0) return;
    setIsImporting(true);
    bulkImportMutation.mutate({ files: toImport });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/admin/knowledge-base")}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Knowledge Base
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Import from Google Drive</h1>
            <p className="text-xs text-gray-400">Select documents to import into the Knowledge Base</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Config Status */}
        {driveConfig && (
          <div
            className={`mb-5 p-4 rounded-lg border text-sm ${
              driveConfig.configured
                ? "bg-green-950 border-green-800 text-green-300"
                : "bg-red-950 border-red-800 text-red-300"
            }`}
          >
            {driveConfig.configured ? (
              <div>
                <span className="font-semibold">✓ Google Drive connected</span>
                {driveConfig.folderId && (
                  <span className="ml-2 text-green-400 font-mono text-xs">
                    Folder: {driveConfig.folderId}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <span className="font-semibold">⚠ Google Drive not configured</span>
                <div className="mt-1 text-xs text-red-400">
                  {!driveConfig.hasServiceAccount && "Missing: GOOGLE_SERVICE_ACCOUNT_JSON — "}
                  {!driveConfig.hasFolderId && "Missing: GOOGLE_DRIVE_FOLDER_ID"}
                </div>
                <div className="mt-2 text-xs">
                  Add these secrets via the Secrets panel to enable Google Drive integration.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Folder ID override */}
        <div className="flex gap-3 mb-5 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">
              Folder ID (optional override)
            </label>
            <input
              type="text"
              value={folderId || ""}
              onChange={(e) => setFolderId(e.target.value || undefined)}
              placeholder="Leave blank to use default folder from env"
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="w-48">
            <label className="block text-xs text-gray-400 mb-1">Default Category</label>
            <input
              type="text"
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
              placeholder="e.g. Legal, Policy"
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Import Results */}
        {importResults && (
          <div className="mb-5 bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Import Results</h3>
              <button
                onClick={() => setImportResults(null)}
                className="text-gray-500 hover:text-white text-xs"
              >
                Dismiss
              </button>
            </div>
            <div className="space-y-1">
              {importResults.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs ${
                    r.action === "error" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  <span>{r.action === "error" ? "✗" : "✓"}</span>
                  <span className="font-medium">{r.fileName}</span>
                  {r.action === "error" && (
                    <span className="text-red-500">— {r.error}</span>
                  )}
                  {r.action === "created" && !r.contentExtracted && (
                    <span className="text-yellow-500">— imported (no text extracted)</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
              {importResults.filter((r) => r.action === "created").length} imported,{" "}
              {importResults.filter((r) => r.action === "error").length} failed
            </div>
          </div>
        )}

        {/* File List */}
        {!driveConfig?.configured ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">🔑</div>
            <div className="text-sm">Configure Google Drive credentials to browse files.</div>
          </div>
        ) : filesLoading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
            <div className="text-sm">Loading files from Google Drive...</div>
          </div>
        ) : filesError ? (
          <div className="bg-red-950 border border-red-800 rounded-lg p-6 text-red-300 text-sm">
            <strong>Error loading files:</strong> {filesError.message}
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAll}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {selectedFiles.size === (driveData?.files?.length || 0)
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-xs text-gray-500">
                  {driveData?.files?.length || 0} files found
                  {selectedFiles.size > 0 && ` · ${selectedFiles.size} selected`}
                </span>
              </div>
              <button
                onClick={handleImport}
                disabled={selectedFiles.size === 0 || isImporting}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isImporting
                  ? "Importing..."
                  : `Import ${selectedFiles.size > 0 ? selectedFiles.size : ""} Selected`}
              </button>
            </div>

            {/* Files Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              {(driveData?.files?.length || 0) === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No files found in this folder.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                      <th className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            selectedFiles.size === (driveData?.files?.length || 0) &&
                            (driveData?.files?.length || 0) > 0
                          }
                          onChange={toggleAll}
                          className="accent-blue-500"
                        />
                      </th>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-left px-4 py-3">Modified</th>
                      <th className="text-left px-4 py-3">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(driveData?.files || []).map((file: DriveFile) => (
                      <tr
                        key={file.id}
                        onClick={() => toggleFile(file.id)}
                        className={`border-b border-gray-800 cursor-pointer transition-colors ${
                          selectedFiles.has(file.id)
                            ? "bg-blue-950/40"
                            : "hover:bg-gray-800/50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(file.id)}
                            onChange={() => toggleFile(file.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{getMimeIcon(file.mimeType)}</span>
                            <span className="text-white font-medium max-w-xs truncate">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {file.mimeType.split("/").pop()?.replace("vnd.google-apps.", "")}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {formatDate(file.modifiedTime)}
                        </td>
                        <td className="px-4 py-3">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Open ↗
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
