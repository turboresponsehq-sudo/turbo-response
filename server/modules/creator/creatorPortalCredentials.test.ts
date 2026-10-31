import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("../../db", () => ({ getDb: mocks.getDb }));

import { validCreatorPassword, checkCreatorSessionVersion } from "./creatorPortalCredentials";
import { createPortalToken } from "./creatorPortalRepository";

describe("Creator Portal invitation-password flow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("expires newly generated invitations after one day", () => {
    const before = Date.now();
    const invite = createPortalToken();
    const remaining = invite.expiresAt.getTime() - before;
    expect(remaining).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(remaining).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 1000);
    expect(invite.token).toMatch(/^[A-Za-z0-9_-]{40,100}$/);
  });

  it("requires longer passwords and rejects common numeric sequences", () => {
    expect(validCreatorPassword("1234")).toBe(false);
    expect(validCreatorPassword("12345678")).toBe(false);
    expect(validCreatorPassword("password")).toBe(false);
    expect(validCreatorPassword("A-longer-private-passphrase-92")).toBe(true);
  });

  it("accepts only matching current session versions for password-enabled portals", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [{ session_version: "current-secret" }] })
      .mockResolvedValueOnce({ rows: [{ session_version: "current-secret" }] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await checkCreatorSessionVersion(7, "current-secret")).toBe(true);
    expect(await checkCreatorSessionVersion(7, "old-secret")).toBe(false);
  });

  it("preserves existing client sessions when a portal has not been migrated to password access", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await checkCreatorSessionVersion(3, undefined)).toBe(true);
  });
});
