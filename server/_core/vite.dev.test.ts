import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import type { Express } from "express";
import type { Server } from "http";

const mocks = vi.hoisted(() => ({ createViteServer: vi.fn() }));
vi.mock("vite", () => ({ createServer: mocks.createViteServer }));
vi.mock("../../vite.config", () => ({ default: {} }));
import { setupVite } from "./vite";

describe("explicit bundled development frontend", () => {
  beforeEach(() => {
    mocks.createViteServer.mockReset();
    mocks.createViteServer.mockResolvedValue({ middlewares: vi.fn() });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });
  function app() {
    return { use: vi.fn(), get: vi.fn() };
  }
  it("uses the existing build only with development and explicit opt-in", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONEY_BOSSES_DEV_BUNDLED_FRONTEND", "1");
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    const target = app();
    await setupVite(target as unknown as Express, {} as Server);
    expect(mocks.createViteServer).not.toHaveBeenCalled();
    expect(target.use).toHaveBeenCalledTimes(1);
    const fallback = target.get.mock.calls[0][1];
    for (const path of ["/api/missing", "/api", "/assets/missing.js"]) {
      const next = vi.fn();
      const res = { sendFile: vi.fn(), setHeader: vi.fn() };
      fallback({ path }, res, next);
      expect(next).toHaveBeenCalledOnce();
      expect(res.sendFile).not.toHaveBeenCalled();
    }
    const response = { sendFile: vi.fn(), setHeader: vi.fn() };
    fallback({ path: "/admin/money-bosses" }, response, vi.fn());
    expect(response.sendFile.mock.calls[0][0]).toMatch(/dist-frontend\/index\.html$/);
    expect(response.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
  });
  it("keeps normal Vite/HMR when opt-in is absent", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONEY_BOSSES_DEV_BUNDLED_FRONTEND", "");
    await setupVite(app() as unknown as Express, {} as Server);
    expect(mocks.createViteServer).toHaveBeenCalledOnce();
  });
  it("cannot opt in outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONEY_BOSSES_DEV_BUNDLED_FRONTEND", "1");
    await setupVite(app() as unknown as Express, {} as Server);
    expect(mocks.createViteServer).toHaveBeenCalledOnce();
  });
  it("fails closed when an opted-in build is absent", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONEY_BOSSES_DEV_BUNDLED_FRONTEND", "1");
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    await expect(setupVite(app() as unknown as Express, {} as Server)).rejects.toThrow("run pnpm build:frontend");
    expect(mocks.createViteServer).not.toHaveBeenCalled();
  });
});
