import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { shouldRequeueDriveItem } from "./googleDriveIngestionService";

describe("Drive ingestion change detection", () => {
  it("queues an unseen file and a file whose Drive modification timestamp changed", () => {
    expect(shouldRequeueDriveItem(undefined, "2026-08-15T10:00:00.000Z")).toBe(true);
    expect(shouldRequeueDriveItem({ status: "imported", drive_modified_at: "2026-08-14T10:00:00.000Z" }, "2026-08-15T10:00:00.000Z")).toBe(true);
  });

  it("does not duplicate-import a previously imported unchanged Drive file", () => {
    expect(shouldRequeueDriveItem({ status: "imported", drive_modified_at: "2026-08-15T10:00:00.000Z" }, "2026-08-15T10:00:00.000Z")).toBe(false);
  });

  it("retries a previously contained error only when the next ingestion run discovers that file again", () => {
    expect(shouldRequeueDriveItem({ status: "failed", drive_modified_at: "2026-08-15T10:00:00.000Z" }, "2026-08-15T10:00:00.000Z")).toBe(true);
    expect(shouldRequeueDriveItem({ status: "unavailable", drive_modified_at: "2026-08-15T10:00:00.000Z" }, "2026-08-15T10:00:00.000Z")).toBe(true);
  });

  it("uses the established production Knowledge Base camel-case columns for Drive document persistence", () => {
    const source = readFileSync(new URL("./googleDriveIngestionService.ts", import.meta.url), "utf8");
    expect(source).toContain('"sourceUrl"');
    expect(source).toContain('"fileType"');
    expect(source).toContain('"isProcessed"');
    expect(source).toContain('"updatedAt"');
  });
});
