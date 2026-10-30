// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const uploadBrochure = vi.fn(async () => ({ id: "p1", url: "/media/x.pdf", bytes: 9 }));
vi.mock("@/features/settings/api", () => ({ uploadBrochure }));

const { POST } = await import("@/app/api/admin/site/brochure/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

function upload(file: Blob | null, origin = "http://localhost:3000") {
  const form = new FormData();
  form.set("fields", "{}");
  if (file) form.set("file", file, "brochure.pdf");
  return new Request("http://localhost:3000/api/admin/site/brochure", {
    method: "POST",
    headers: { origin },
    body: form,
  });
}

describe("/api/admin/site/brochure", () => {
  it("uploads a new brochure as the admin (D94)", async () => {
    stubServerEnv();
    const answer = await POST(upload(new Blob(["%PDF-1.7"])));
    expect(answer.status).toBe(201);
    expect(uploadBrochure).toHaveBeenCalledWith(
      new TextEncoder().encode("%PDF-1.7"),
      expect.objectContaining({ adminId: "admin-1" }),
    );
  });

  it("refuses an upload without its file, one too large, another site's, and no session", async () => {
    stubServerEnv();
    expect((await POST(upload(null))).status).toBe(400);
    expect((await POST(upload(new Blob([new Uint8Array(UPLOAD_LIMITS.brochureBytes + 32 * 1024)])))).status).toBe(400);
    expect((await POST(upload(new Blob(["x"]), "https://evil.example"))).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await POST(upload(new Blob(["x"])))).status).toBe(401);
    expect(uploadBrochure).not.toHaveBeenCalled();
  });
});
