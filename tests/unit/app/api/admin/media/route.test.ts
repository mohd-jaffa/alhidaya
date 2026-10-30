// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const listImagesForAdmin = vi.fn(async () => [{ id: "m1" }]);
const uploadImage = vi.fn(async () => ({ id: "m2" }));
vi.mock("@/features/media/api", () => ({ listImagesForAdmin, uploadImage }));

const { GET, POST } = await import("@/app/api/admin/media/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const WORDS = { alt: "A nurse at home", decorative: false, source: { provider: "", url: "", licence: "" } };
function upload(fields: unknown, file: Blob | null, origin = "http://localhost:3000") {
  const form = new FormData();
  form.set("fields", JSON.stringify(fields));
  if (file) form.set("file", file, "nurse.jpg");
  return new Request("http://localhost:3000/api/admin/media", { method: "POST", headers: { origin }, body: form });
}
const call = (origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/media", { headers: { origin } });

describe("/api/admin/media", () => {
  it("lists the library, and uploads an image with its words as the admin (D93)", async () => {
    stubServerEnv();
    expect(await (await GET(call())).json()).toEqual({ success: true, data: [{ id: "m1" }] });
    const answer = await POST(upload(WORDS, new Blob([new Uint8Array([0xff, 0xd8, 0xff])])));
    expect(answer.status).toBe(201);
    expect(uploadImage).toHaveBeenCalledWith(
      new Uint8Array([0xff, 0xd8, 0xff]),
      { alt: "A nurse at home", decorative: false, source: null },
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("refuses an upload without its words or its file, one too large, another site's, and no session", async () => {
    stubServerEnv();
    expect((await POST(upload({ ...WORDS, alt: "" }, new Blob(["x"])))).status).toBe(400);
    expect((await POST(upload(WORDS, null))).status).toBe(400);
    expect((await POST(upload(WORDS, new Blob([new Uint8Array(UPLOAD_LIMITS.imageBytes + 32 * 1024)])))).status).toBe(
      400,
    );
    expect((await POST(upload(WORDS, new Blob(["x"]), "https://evil.example"))).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call())).status).toBe(401);
    expect(uploadImage).not.toHaveBeenCalled();
  });
});
