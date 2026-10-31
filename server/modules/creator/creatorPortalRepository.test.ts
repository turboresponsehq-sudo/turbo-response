import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock("../../db", () => ({ getDb: mocks.getDb }));

import {
  acceptCreatorPortalToken,
  createPortalToken,
  hashPortalToken,
} from "./creatorPortalRepository";

describe("Creator Portal invitation security", () => {
  beforeEach(() => vi.clearAllMocks());

  it("generates unpredictable, URL-safe invitation tokens whose hashes match", () => {
    const a = createPortalToken();
    const b = createPortalToken();
    expect(a.token).toMatch(/^[A-Za-z0-9_-]{40,100}$/);
    expect(a.token).not.toBe(b.token);
    expect(hashPortalToken(a.token)).toBe(a.hash);
    expect(a.hash).not.toBe(b.hash);
    expect(a.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("consumes the token and records a successful visit", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 9, creator_lead_id: 23, status: "active" }] })
      .mockResolvedValueOnce({ rows: [] });
    mocks.getDb.mockResolvedValue({ execute });

    const result = await acceptCreatorPortalToken("a".repeat(43));
    expect(result).toEqual({ id: 9, creator_lead_id: 23, status: "active" });
    expect(execute).toHaveBeenCalledTimes(2);

    // Verify the SQL makes token redemption atomic and one-time.
    const statement = JSON.stringify(execute.mock.calls[0][0]);
    expect(statement).toContain("access_token_hash = NULL");
    expect(statement).toContain("token_expires_at = NULL");
    expect(statement).toContain("status = 'invited'");
    expect(statement).toContain("token_expires_at > NOW()");
  });

  it("denies used, expired or revoked links without writing a portal event", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await acceptCreatorPortalToken("a".repeat(43))).toBeNull();
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("fails safely without database storage", async () => {
    mocks.getDb.mockResolvedValue(null);
    await expect(acceptCreatorPortalToken("a".repeat(43))).rejects.toThrow("Creator portal storage is unavailable");
  });
});
