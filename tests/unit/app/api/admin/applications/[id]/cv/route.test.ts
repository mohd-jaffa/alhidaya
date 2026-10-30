// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { notFoundError } from "@/lib/errors";
import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const CV = {
  bytes: new TextEncoder().encode("%PDF-1.7"),
  filename: "2026-10-30_general_mariam-ali_8f3a2c91d0.pdf",
  contentType: "application/pdf",
};
const downloadApplicationCv = vi.fn(async () => CV);
vi.mock("@/features/careers/api", () => ({ downloadApplicationCv }));

const { GET } = await import("@/app/api/admin/applications/[id]/cv/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = { params: Promise.resolve({ id: "application-1" }) };
const call = () => new Request("http://localhost:3000/api/admin/applications/application-1/cv");

describe("GET /api/admin/applications/[id]/cv", () => {
  it("gives the signed-in admin the CV as a file to save, kept by no one, its type never guessed", async () => {
    stubServerEnv();
    const response = await GET(call(), params);
    expect(response.status).toBe(200);
    expect(Object.fromEntries(response.headers)).toMatchObject({
      "content-type": "application/pdf",
      "content-length": "8",
      "content-disposition": `attachment; filename="${CV.filename}"`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; sandbox",
      "x-request-id": expect.stringMatching(/^req_/),
    });
    expect(await response.text()).toBe("%PDF-1.7");
    expect(downloadApplicationCv).toHaveBeenCalledWith(
      "application-1",
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("refuses without the admin's session, and says so when the CV is not kept", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call(), params)).status).toBe(401);
    expect(downloadApplicationCv).not.toHaveBeenCalled();

    downloadApplicationCv.mockRejectedValueOnce(notFoundError("CV_NOT_KEPT"));
    const missing = await GET(call(), params);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toMatchObject({ error: { code: "CV_NOT_KEPT" } });
  });
});
