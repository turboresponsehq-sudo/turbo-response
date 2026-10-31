import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("../../db", () => ({ getDb: mocks.getDb }));

import { getWorkspaceData, updateWorkspaceTask } from "./creatorWorkspaceRepository";

describe("Creator workspace: two-sided project tasks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps client/team ownership and priority separate", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [
        { id: 11, label: "Set up hosting", status: "needed" },
        { id: 12, label: "Send logo", status: "complete" },
      ]})
      .mockResolvedValueOnce({ rows: [
        { id: 90, event_type: "workspace_goal", payload: { title: "Launch website" } },
        { id: 91, event_type: "workspace_task_meta", payload: { taskId: 11, owner: "team", priority: "urgent" } },
        { id: 92, event_type: "workspace_task_meta", payload: { taskId: 12, owner: "client", priority: "normal" } },
      ]});
    mocks.getDb.mockResolvedValue({ execute });
    const result = await getWorkspaceData(2, "Default project");
    expect(result.project_goal).toBe("Launch website");
    expect(result.tasks).toMatchObject([
      { id: 11, owner: "team", priority: "urgent", status: "needed" },
      { id: 12, owner: "client", priority: "normal", status: "complete" },
    ]);
  });

  it("blocks clients from checking off team work", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [{ status: "active" }] })
      .mockResolvedValueOnce({ rows: [{ id: 11, label: "Set up hosting", status: "needed" }] })
      .mockResolvedValueOnce({ rows: [{ payload: { taskId: 11, owner: "team", priority: "urgent" } }] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await updateWorkspaceTask({ portalId: 2, taskId: 11, done: true, actor: "creator", role: "client" })).toBeNull();
    expect(execute).toHaveBeenCalledTimes(3);
  });

  it("allows clients to complete tasks assigned to them", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [{ status: "active" }] })
      .mockResolvedValueOnce({ rows: [{ id: 12, label: "Send logo", status: "needed" }] })
      .mockResolvedValueOnce({ rows: [{ payload: { taskId: 12, owner: "client", priority: "normal" } }] })
      .mockResolvedValueOnce({ rows: [{ id: 12, label: "Send logo", status: "complete" }] })
      .mockResolvedValueOnce({ rows: [] });
    mocks.getDb.mockResolvedValue({ execute });
    const result = await updateWorkspaceTask({ portalId: 2, taskId: 12, done: true, actor: "creator", role: "client" });
    expect(result).toMatchObject({ id: 12, status: "complete", owner: "client" });
    expect(execute).toHaveBeenCalledTimes(5);
  });

  it("refuses client updates when portal access is inactive", async () => {
    const execute = vi.fn().mockResolvedValueOnce({ rows: [{ status: "disabled" }] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await updateWorkspaceTask({ portalId: 2, taskId: 12, done: true, actor: "creator", role: "client" })).toBeNull();
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
