// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv, TEST_ENV } from "@tests/support/env";

vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));
const purgeExpired = vi.fn(async () => ({ enquiries: 1, applications: 0, cvs: 2, filesNotDeleted: 0 }));
vi.mock("@/features/settings/api", () => ({ purgeExpired }));

const { POST } = await import("@/app/api/cron/retention/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (token: string) =>
  new Request("http://localhost:3000/api/cron/retention", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });

describe("/api/cron/retention", () => {
  it("runs the nightly clean-up for the cron entry, and for nothing else (plan §18)", async () => {
    stubServerEnv();
    expect(await (await POST(call(TEST_ENV.CRON_SECRET))).json()).toEqual({
      success: true,
      data: { enquiries: 1, applications: 0, cvs: 2, filesNotDeleted: 0 },
    });
    expect((await POST(call("guessed"))).status).toBe(401);
    expect(purgeExpired).toHaveBeenCalledOnce();
  });
});
