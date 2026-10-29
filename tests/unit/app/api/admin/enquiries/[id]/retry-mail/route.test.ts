// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const retryEnquiryAlert = vi.fn(async () => "SENT");
vi.mock("@/features/enquiries/api", () => ({ retryEnquiryAlert }));

const { POST } = await import("@/app/api/admin/enquiries/[id]/retry-mail/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("POST /api/admin/enquiries/[id]/retry-mail", () => {
  it("sends the alert again as the admin, and says how it went", async () => {
    stubServerEnv();
    const response = await POST(
      new Request("http://localhost:3000/api/admin/enquiries/enquiry-1/retry-mail", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
      }),
      { params: Promise.resolve({ id: "enquiry-1" }) },
    );
    expect(await response.json()).toEqual({ success: true, data: { emailStatus: "SENT" } });
    expect(retryEnquiryAlert).toHaveBeenCalledWith("enquiry-1", expect.objectContaining({ adminId: "admin-1" }));
  });
});
