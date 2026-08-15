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
});
