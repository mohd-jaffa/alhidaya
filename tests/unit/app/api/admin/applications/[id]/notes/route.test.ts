// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const addApplicationNote = vi.fn(async (...[, body]: [string, string, unknown]) => ({ id: "note-1", body }));
vi.mock("@/features/careers/api", () => ({ addApplicationNote }));

const { POST } = await import("@/app/api/admin/applications/[id]/notes/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = { params: Promise.resolve({ id: "application-1" }) };
const call = (body: unknown) =>
  new Request("http://localhost:3000/api/admin/applications/application-1/notes", {
    method: "POST",
    headers: { origin: "http://localhost:3000" },
    body: JSON.stringify(body),
  });

describe("POST /api/admin/applications/[id]/notes", () => {
  it("adds the admin's note, tidied, and answers it", async () => {
    stubServerEnv();
    const response = await POST(call({ body: "  Called back;\r\nvisit on Sunday. " }), params);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ data: { id: "note-1", body: "Called back;\nvisit on Sunday." } });
    expect(addApplicationNote).toHaveBeenCalledWith(
      "application-1",
      "Called back;\nvisit on Sunday.",
      expect.objectContaining({ adminId: "admin-1" }),
    );
  });

  it("refuses an empty note", async () => {
    stubServerEnv();
    expect((await POST(call({ body: "  " }), params)).status).toBe(400);
    expect(addApplicationNote).not.toHaveBeenCalled();
  });
});
