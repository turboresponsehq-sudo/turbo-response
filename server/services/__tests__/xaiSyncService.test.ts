import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  syncDocumentToXAI,
  getDocumentSyncStatus,
} from "../xaiSyncService";
import * as knowledgeBaseDb from "../../knowledgeBaseDb";

vi.mock("../../knowledgeBaseDb");
vi.mock("../xaiCollectionsService");

describe("xAI Sync Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDocumentSyncStatus", () => {
    it("should return sync status for a synced document", async () => {
      const mockDoc = {
        id: 1,
        title: "Test Document",
        content: "Test content",
        category: "test",
        source: "google_drive",
        source_system: "google_drive",
        status: "active",
        synced_to_xai: 1,
        xai_collection_id: "collection_123",
        last_synced_at: "2026-07-05T18:00:00Z",
        content_hash: "abc123",
      };

      vi.mocked(knowledgeBaseDb.getKnowledgeDocumentById).mockResolvedValue(mockDoc);

      const status = await getDocumentSyncStatus(1);

      expect(status).toBeDefined();
      expect(status?.synced).toBe(true);
      expect(status?.xaiCollectionId).toBe("collection_123");
      expect(status?.lastSyncedAt).toBe("2026-07-05T18:00:00Z");
    });

    it("should return sync status for pending document", async () => {
      const mockDoc = {
        id: 2,
        title: "Pending Document",
        content: "Test content",
        category: "test",
        source: "google_drive",
        source_system: "google_drive",
        status: "active",
        synced_to_xai: 0,
        xai_collection_id: null,
        last_synced_at: null,
        content_hash: "def456",
      };

      vi.mocked(knowledgeBaseDb.getKnowledgeDocumentById).mockResolvedValue(mockDoc);

      const status = await getDocumentSyncStatus(2);

      expect(status).toBeDefined();
      expect(status?.synced).toBe(false);
      expect(status?.xaiCollectionId).toBeNull();
    });

    it("should return null if document not found", async () => {
      vi.mocked(knowledgeBaseDb.getKnowledgeDocumentById).mockResolvedValue(null);

      const status = await getDocumentSyncStatus(999);

      expect(status).toBeNull();
    });
  });
});
