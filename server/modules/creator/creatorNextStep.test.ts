import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("../../db", () => ({ getDb: mocks.getDb }));

import { getCreatorPortalByLeadId, setCreatorNextStepDone } from "./creatorPortalRepository";

describe("Creator Portal one-next-step ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads client ownership and completion from existing portal events", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 14, next_step: "Send logo", status: "active" }] })
      .mockResolvedValueOnce({ rows: [{ payload: { text: "Send logo", owner: "client", done: true } }] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await getCreatorPortalByLeadId(23)).toMatchObject({
      next_step: "Send logo",
      next_step_owner: "client",
      next_step_done: true,
    });
  });

  it("defaults old steps to our team, incomplete", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 14, next_step: "Review concept" }] })
      .mockResolvedValueOnce({ rows: [] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await getCreatorPortalByLeadId(23)).toMatchObject({
      next_step_owner: "team", next_step_done: false,
    });
  });

  it("prevents clients from checking off team-owned work", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 14, next_step: "Prepare mockup", status: "active" }] })
      .mockResolvedValueOnce({ rows: [{ payload: { text: "Prepare mockup", owner: "team", done: false } }] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await setCreatorNextStepDone({ portalId: 14, actor: "creator", done: true, scope: "client" })).toBeNull();
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it("lets clients complete their own assigned step", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 14, next_step: "Send photos", status: "active" }] })
      .mockResolvedValueOnce({ rows: [{ payload: { text: "Send photos", owner: "client", done: false } }] })
      .mockResolvedValueOnce({ rows: [] });
    mocks.getDb.mockResolvedValue({ execute });
    expect(await setCreatorNextStepDone({ portalId: 14, actor: "creator", done: true, scope: "client" }))
      .toMatchObject({ next_step_owner: "client", next_step_done: true });
    expect(execute).toHaveBeenCalledTimes(3);
    expect(JSON.stringify(execute.mock.calls[2][0])).toContain("creator_portal_events");
  });
});
