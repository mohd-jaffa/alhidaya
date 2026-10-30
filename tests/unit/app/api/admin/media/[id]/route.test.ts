// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const updateImageDetails = vi.fn(async (id: string) => ({ id }));
const deleteImage = vi.fn(async () => ({ deleted: true }));
vi.mock("@/features/media/api", () => ({ updateImageDetails, deleteImage }));

const { PATCH, DELETE } = await import("@/app/api/admin/media/[id]/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = { params: Promise.resolve({ id: "m1" }) };
const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/media/m1", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const ACTOR = expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) });

describe("/api/admin/media/[id]", () => {
  it("changes an image's words, and deletes it, as the admin (D93)", async () => {
    stubServerEnv();
    const words = { alt: "", decorative: true, source: { provider: "Unsplash", url: "", licence: "" } };
    expect(await (await PATCH(call("PATCH", words), params)).json()).toEqual({ success: true, data: { id: "m1" } });
    expect(updateImageDetails).toHaveBeenCalledWith(
      "m1",
      { alt: null, decorative: true, source: { provider: "Unsplash", url: null, licence: null } },
      ACTOR,
    );
    expect(await (await DELETE(call("DELETE"), params)).json()).toEqual({ success: true, data: { deleted: true } });
    expect(deleteImage).toHaveBeenCalledWith("m1", ACTOR);
  });

  it("refuses words without what it shows, another site's request, and no session", async () => {
    stubServerEnv();
    expect(
      (
        await PATCH(
          call("PATCH", { alt: "", decorative: false, source: { provider: "", url: "", licence: "" } }),
          params,
        )
      ).status,
    ).toBe(400);
    expect((await DELETE(call("DELETE", undefined, "https://evil.example"), params)).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await DELETE(call("DELETE"), params)).status).toBe(401);
    expect(deleteImage).not.toHaveBeenCalled();
  });
});
