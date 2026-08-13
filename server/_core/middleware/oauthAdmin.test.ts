import { beforeEach, describe, expect, it, vi } from "vitest";
import { oauthAdminMiddleware } from "./oauthAdmin";

const { authenticateRequestMock } = vi.hoisted(() => ({
  authenticateRequestMock: vi.fn(),
}));

vi.mock("../sdk", () => ({
  sdk: { authenticateRequest: authenticateRequestMock },
}));

function mockResponse() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json };
}

describe("oauthAdminMiddleware", () => {
  beforeEach(() => {
    authenticateRequestMock.mockReset();
  });

  it("rejects requests without a valid OAuth session", async () => {
    authenticateRequestMock.mockResolvedValue(null);
    const res = mockResponse();
    const next = vi.fn();

    await oauthAdminMiddleware({} as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects authenticated non-admin users", async () => {
    authenticateRequestMock.mockResolvedValue({ id: 2, role: "user" });
    const res = mockResponse();
    const next = vi.fn();

    await oauthAdminMiddleware({} as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("passes the resolved admin user to authorized compatibility routes", async () => {
    const user = { id: 1, role: "admin" };
    authenticateRequestMock.mockResolvedValue(user);
    const req: any = {};
    const res = mockResponse();
    const next = vi.fn();

    await oauthAdminMiddleware(req, res as any, next);

    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledOnce();
  });
});
