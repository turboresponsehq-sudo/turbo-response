import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const db = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: db.getDb }));
import { moneyBossesRouter } from "./routers/moneyBossesRouter";

const caller = (role: string | null) => moneyBossesRouter.createCaller({
  user: role ? { id: 1, role } as any : null,
  req: {} as any, res: {} as any,
});

beforeEach(() => { db.getDb.mockReset(); db.getDb.mockResolvedValue(null); });

describe("Money Bosses module authorization and safe boundaries", () => {
  it.each([null, "user", "amani_admin"])("denies non-owner-admin role %s before database access", async (role) => {
    await expect(caller(role).overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller(role).createArchiveVideoDraft({ label: "Draft", mediaUrl: "https://media.example.com/video.mp4" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.getDb).not.toHaveBeenCalled();
  });
  it("reports missing storage without claiming draft persistence", async () => {
    await expect(caller("admin").createArchiveVideoDraft({ label: "Draft", mediaUrl: "https://media.example.com/video.mp4", releaseAt: "2030-01-01T12:00:00Z" })).resolves.toEqual({ database: "migration_pending", created: false });
    await expect(caller("admin").assignArchiveVideo({ artworkId: 1, videoId: 1 })).resolves.toEqual({ database: "migration_pending", assigned: false });
  });
  it.each(["http://media.example.com/a.mp4", "https://www.instagram.com/reel/abc", "https://user:password@media.example.com/a.mp4"])("rejects unsafe media destination %s", async (mediaUrl) => {
    await expect(caller("admin").createArchiveVideoDraft({ label: "Draft", mediaUrl })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.getDb).not.toHaveBeenCalled();
  });
  it("rejects ambiguous non-ISO release metadata", async () => {
    await expect(caller("admin").createArchiveVideoDraft({ label: "Draft", mediaUrl: "https://media.example.com/a.mp4", releaseAt: "tomorrow" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("contains both navigation entries and protects the actual route", () => {
    const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");
    expect(source("client/src/pages/AdminDashboard.tsx")).toContain("setLocation('/admin/money-bosses')");
    expect(source("client/src/pages/AdminCommandCenter.tsx")).toContain("setLocation('/admin/money-bosses')");
    expect(source("client/src/App.tsx")).toMatch(/function ProtectedMoneyBosses\(\)[\s\S]*?<AdminSessionGate>[\s\S]*?<MoneyBossesAdmin/);
    expect(source("client/src/App.tsx")).toContain('import.meta.env.DEV && <Route path="/admin/money-bosses/preview"');
  });
});
