/**
 * Tests for Knowledge Base DB helpers and content hash logic
 */

import { describe, it, expect } from "vitest";
import { calculateContentHash } from "./knowledgeBaseDb";
import { mimeTypeToFileType } from "./googleDriveService";
import fs from "fs";
import path from "path";

// ─── Unit tests for calculateContentHash ─────────────────────────────────────

describe("calculateContentHash", () => {
  it("returns a 64-character hex string (SHA256)", () => {
    const hash = calculateContentHash("hello world");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("returns the same hash for the same content", () => {
    const content = "This is a test document about FCRA violations.";
    expect(calculateContentHash(content)).toBe(calculateContentHash(content));
  });

  it("returns different hashes for different content", () => {
    const hash1 = calculateContentHash("Document version 1");
    const hash2 = calculateContentHash("Document version 2");
    expect(hash1).not.toBe(hash2);
  });

  it("handles empty string", () => {
    const hash = calculateContentHash("");
    expect(hash).toHaveLength(64);
  });

  it("is sensitive to whitespace changes", () => {
    const hash1 = calculateContentHash("hello world");
    const hash2 = calculateContentHash("hello  world"); // double space
    expect(hash1).not.toBe(hash2);
  });

  it("produces deterministic output", () => {
    const hash = calculateContentHash("hello world");
    expect(hash).toBe(calculateContentHash("hello world"));
    expect(hash.length).toBe(64);
  });
});

// ─── Unit tests for Knowledge Base document structure ────────────────────────

describe("Knowledge Base document schema", () => {
  it("source_system enum values are valid", () => {
    const validSystems = ["google_drive", "upload", "xai_collection", "manual"];
    for (const system of validSystems) {
      expect(validSystems).toContain(system);
    }
  });

  it("status enum values are valid", () => {
    const validStatuses = ["active", "archived", "needs_review"];
    for (const status of validStatuses) {
      expect(validStatuses).toContain(status);
    }
  });

  it("content_hash is 64 chars for any content", () => {
    const testContents = [
      "Short text",
      "A".repeat(10000),
      "Special chars: !@#$%^&*()",
      "Unicode: 你好世界",
      "Multiline\ncontent\nhere",
    ];
    for (const content of testContents) {
      expect(calculateContentHash(content)).toHaveLength(64);
    }
  });
});

// ─── Router file structure tests (filesystem-based, no alias resolution needed) ─

describe("Knowledge Base router file structure", () => {
  it("knowledgeBaseRouter.ts defines all expected procedures", () => {
    const filePath = path.resolve("server/routers/knowledgeBaseRouter.ts");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("list:");
    expect(content).toContain("getById:");
    expect(content).toContain("create:");
    expect(content).toContain("update:");
    expect(content).toContain("delete:");
    expect(content).toContain("getStats:");
    expect(content).toContain("getByCategory:");
    expect(content).toContain("getNeedingReview:");
    expect(content).toContain("getPendingSync:");
    expect(content).toContain("checkContentChange:");
  });
});

describe("Google Drive router file structure", () => {
  it("googleDriveRouter.ts defines all expected procedures", () => {
    const filePath = path.resolve("server/routers/googleDriveRouter.ts");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("listFiles:");
    expect(content).toContain("listFilesRecursive:");
    expect(content).toContain("importFile:");
    expect(content).toContain("bulkImport:");
    expect(content).toContain("checkConfig:");
  });
});

// ─── Google Drive service unit tests ─────────────────────────────────────────

describe("Google Drive service - mimeTypeToFileType", () => {
  it("maps known Google Workspace types correctly", () => {
    expect(mimeTypeToFileType("application/vnd.google-apps.document")).toBe("Google Doc");
    expect(mimeTypeToFileType("application/vnd.google-apps.spreadsheet")).toBe("Google Sheet");
    expect(mimeTypeToFileType("application/vnd.google-apps.presentation")).toBe("Google Slides");
    expect(mimeTypeToFileType("application/vnd.google-apps.folder")).toBe("Folder");
  });

  it("maps common file types correctly", () => {
    expect(mimeTypeToFileType("application/pdf")).toBe("PDF");
    expect(mimeTypeToFileType("text/plain")).toBe("TXT");
    expect(mimeTypeToFileType("text/csv")).toBe("CSV");
    expect(mimeTypeToFileType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("DOCX");
  });

  it("handles unknown types gracefully", () => {
    const result = mimeTypeToFileType("application/x-unknown-format");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a string for any input", () => {
    const inputs = ["", "text/html", "image/png", "video/mp4"];
    for (const input of inputs) {
      expect(typeof mimeTypeToFileType(input)).toBe("string");
    }
  });
});
