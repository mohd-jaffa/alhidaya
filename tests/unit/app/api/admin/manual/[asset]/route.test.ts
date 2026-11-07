// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const getAdminSession = vi.fn();
const manualVideoResponse = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/features/settings/manual-video", () => ({ manualVideoResponse }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));
const { GET } = await import("@/app/api/admin/manual/[asset]/route");
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
describe("manual asset access", () => {
  it("checks the admin session before reading any lesson", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue(null);
    const request = new Request("http://localhost:3000/api/admin/manual/02-sign-in.mp4");
    const response = await GET(request, { params: Promise.resolve({ asset: "02-sign-in.mp4" }) });
    expect(response.status).toBe(401);
    expect(manualVideoResponse).not.toHaveBeenCalled();
  });
  it("returns the authenticated lesson response", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue({ adminId: "a", name: "Admin", email: "a@example.com" });
    const video = new Response("video");
    manualVideoResponse.mockResolvedValue(video);
    const request = new Request("http://localhost:3000/api/admin/manual/02-sign-in.mp4");
    expect(await GET(request, { params: Promise.resolve({ asset: "02-sign-in.mp4" }) })).toBe(video);
    expect(manualVideoResponse).toHaveBeenCalledWith("02-sign-in.mp4", request, expect.stringMatching(/^req_/));
  });
});
