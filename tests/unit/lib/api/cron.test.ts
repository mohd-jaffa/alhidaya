// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { withCronRoute } from "@/lib/api/cron";
import { stubServerEnv, TEST_ENV } from "@tests/support/env";

vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
});

const call = (authorization?: string) =>
  new Request("http://localhost:3000/api/cron/retention", {
    method: "POST",
    headers: authorization ? { authorization } : {},
  });

describe("withCronRoute (plan §17)", () => {
  it("runs a timed job for a request bearing CRON_SECRET, and refuses any other", async () => {
    stubServerEnv();
    const job = vi.fn(async () => ({ ran: true }));
    const answer = await withCronRoute(call(`Bearer ${TEST_ENV.CRON_SECRET}`), job);
    expect(await answer.json()).toEqual({ success: true, data: { ran: true } });
    for (const authorization of [undefined, `Bearer ${TEST_ENV.CRON_SECRET}x`, "Bearer short", TEST_ENV.CRON_SECRET])
      expect((await withCronRoute(call(authorization), job)).status).toBe(401);
    expect(job).toHaveBeenCalledOnce();
  });
});
