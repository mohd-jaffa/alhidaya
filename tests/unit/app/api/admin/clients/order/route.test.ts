// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";
const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const saveClientOrder = vi.fn(async (ids: string[]) => ({ ids }));
vi.mock("@/features/clients/api", () => ({ saveClientOrder }));

const { PUT } = await import("@/app/api/admin/clients/order/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/clients/order", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const IDS = [crypto.randomUUID(), crypto.randomUUID()];

describe("/api/admin/clients/order", () => {
  it("saves the client logos' order as a draft, as the admin (D92)", async () => {
    stubServerEnv();
    expect(await (await PUT(call("PUT", IDS))).json()).toEqual({ success: true, data: { ids: IDS } });
    expect(saveClientOrder).toHaveBeenCalledWith(
      IDS,
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("refuses an order that names one twice, another site's request, and no session", async () => {
    stubServerEnv();
    expect((await PUT(call("PUT", [IDS[0], IDS[0]]))).status).toBe(400);
    expect((await PUT(call("PUT", IDS, "https://evil.example"))).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await PUT(call("PUT", IDS))).status).toBe(401);
    expect(saveClientOrder).not.toHaveBeenCalled();
  });
});
