// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv, TEST_ENV } from "@tests/support/env";

vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));
const retryEnquiryAlerts = vi.fn(async () => ({ tried: 2, sent: 1 }));
const retryApplicationAlerts = vi.fn(async () => ({ tried: 1, sent: 1 }));
vi.mock("@/features/enquiries/api", () => ({ retryEnquiryAlerts }));
vi.mock("@/features/careers/api", () => ({ retryApplicationAlerts }));

const { POST } = await import("@/app/api/cron/mail-retry/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (token: string) =>
  new Request("http://localhost:3000/api/cron/mail-retry", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });

describe("/api/cron/mail-retry", () => {
  it("sends the team's unsent emails again for the cron entry, and for nothing else (D85)", async () => {
    stubServerEnv();
    expect(await (await POST(call(TEST_ENV.CRON_SECRET))).json()).toEqual({
      success: true,
      data: { enquiries: { tried: 2, sent: 1 }, applications: { tried: 1, sent: 1 } },
    });
    expect((await POST(call("guessed"))).status).toBe(401);
    expect(retryEnquiryAlerts).toHaveBeenCalledOnce();
    expect(retryApplicationAlerts).toHaveBeenCalledOnce();
  });
});
