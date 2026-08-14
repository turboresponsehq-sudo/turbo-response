import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  authenticateRequest: vi.fn(),
}));

vi.mock("../db", () => ({ getDb: mocks.getDb }));
vi.mock("./sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));

import { createContext } from "./context";

describe("createContext legacy admin session compatibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "context-test-secret";
    mocks.authenticateRequest.mockRejectedValue(new Error("No OAuth session"));
  });

  it("accepts a current signed admin JWT only when it resolves to the same current admin user", async () => {
    const admin = {
      id: 42,
      openId: "legacy-admin-42",
      name: "Owner",
      email: "owner@example.com",
      loginMethod: "password",
      role: "admin",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      lastSignedIn: "2026-01-01T00:00:00.000Z",
      password: null,
    };
    const limit = vi.fn().mockResolvedValue([admin]);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    mocks.getDb.mockResolvedValue({ select: vi.fn().mockReturnValue({ from }) });
    const token = jwt.sign({ userId: 42, email: "owner@example.com", role: "admin" }, process.env.JWT_SECRET!);

    const context = await createContext({
      req: { headers: { authorization: `Bearer ${token}` } },
      res: {},
    } as any);

    expect(context.user).toEqual(admin);
    expect(where).toHaveBeenCalledTimes(1);
  });

  it("rejects a token when the current database user is not an admin", async () => {
    const limit = vi.fn().mockResolvedValue([{ id: 42, email: "owner@example.com", role: "user" }]);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    mocks.getDb.mockResolvedValue({ select: vi.fn().mockReturnValue({ from }) });
    const token = jwt.sign({ userId: 42, email: "owner@example.com", role: "admin" }, process.env.JWT_SECRET!);

    const context = await createContext({
      req: { headers: { authorization: `Bearer ${token}` } },
      res: {},
    } as any);

    expect(context.user).toBeNull();
  });
});
