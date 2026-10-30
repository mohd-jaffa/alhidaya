// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";
import { pageFixture } from "@tests/support/fixtures/content";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const getPageForAdmin = vi.fn(async (page: string) => ({ page }));
const savePageDraft = vi.fn(async (page: string) => ({ page, saved: true }));
vi.mock("@/features/content/api", async () => {
  const { notFoundError } = await import("@/lib/errors");
  return {
    getPageForAdmin,
    savePageDraft,
    pageFromParam: (slug: string) => {
      if (slug !== "quote") throw notFoundError("RECORD_NOT_FOUND");
      return "QUOTE";
    },
  };
});

const { GET, PUT } = await import("@/app/api/admin/pages/[key]/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = (key = "quote") => ({ params: Promise.resolve({ key }) });
const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/pages/quote", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/pages/[key]", () => {
  it("opens a page's draft, and answers 404 for what is not a page", async () => {
    stubServerEnv();
    expect(await (await GET(call("GET"), params())).json()).toEqual({ success: true, data: { page: "QUOTE" } });
    expect((await GET(call("GET"), params("blog"))).status).toBe(404);
    expect(getPageForAdmin).toHaveBeenCalledOnce();
  });

  it("saves a draft held to its page's rules, as the admin, in the request's name", async () => {
    stubServerEnv();
    const page = pageFixture("QUOTE");
    const response = await PUT(call("PUT", page), params());
    expect(await response.json()).toEqual({ success: true, data: { page: "QUOTE", saved: true } });
    expect(savePageDraft).toHaveBeenCalledWith(
      "QUOTE",
      page,
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("refuses a draft its page can't hold, another site's request, and no session", async () => {
    stubServerEnv();
    const withoutForm = { ...pageFixture("QUOTE"), sections: pageFixture("QUOTE").sections.slice(0, 1) };
    const refused = await PUT(call("PUT", withoutForm), params());
    expect(refused.status).toBe(400);
    expect((await PUT(call("PUT", pageFixture("QUOTE"), "https://evil.example"), params())).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call("GET"), params())).status).toBe(401);
    expect(savePageDraft).not.toHaveBeenCalled();
  });
});
