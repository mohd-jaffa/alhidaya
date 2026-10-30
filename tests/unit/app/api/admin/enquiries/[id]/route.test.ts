// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const getEnquiry = vi.fn(async (id: string) => ({ id }));
const setEnquiryStatus = vi.fn(async () => {});
const deleteEnquiry = vi.fn(async () => {});
vi.mock("@/features/enquiries/api", () => ({ deleteEnquiry, getEnquiry, setEnquiryStatus }));

const { DELETE, GET, PATCH } = await import("@/app/api/admin/enquiries/[id]/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = { params: Promise.resolve({ id: "enquiry-1" }) };
const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/enquiries/enquiry-1", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/enquiries/[id]", () => {
  it("opens one enquiry for the signed-in admin", async () => {
    stubServerEnv();
    const response = await GET(call("GET"), params);
    expect(await response.json()).toEqual({ success: true, data: { id: "enquiry-1" } });
    expect(getEnquiry).toHaveBeenCalledWith("enquiry-1");
  });

  it("moves it along as the admin, in the request's name", async () => {
    stubServerEnv();
    const response = await PATCH(call("PATCH", { status: "RESOLVED" }), params);
    expect(await response.json()).toEqual({ success: true, data: { status: "RESOLVED" } });
    expect(setEnquiryStatus).toHaveBeenCalledWith(
      "enquiry-1",
      "RESOLVED",
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("deletes it as the admin, and refuses another site's request to (D82)", async () => {
    stubServerEnv();
    const response = await DELETE(call("DELETE"), params);
    expect(await response.json()).toEqual({ success: true, data: { deleted: true } });
    expect(deleteEnquiry).toHaveBeenCalledWith("enquiry-1", expect.objectContaining({ adminId: "admin-1" }));
    expect((await DELETE(call("DELETE", undefined, "https://evil.example"), params)).status).toBe(403);
    expect(deleteEnquiry).toHaveBeenCalledOnce();
  });

  it("refuses a status it does not know, another site's request, and no session", async () => {
    stubServerEnv();
    expect((await PATCH(call("PATCH", { status: "DONE" }), params)).status).toBe(400);
    expect((await PATCH(call("PATCH", { status: "NEW" }, "https://evil.example"), params)).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call("GET"), params)).status).toBe(401);
    expect(setEnquiryStatus).not.toHaveBeenCalled();
    expect(getEnquiry).not.toHaveBeenCalled();
  });
});
