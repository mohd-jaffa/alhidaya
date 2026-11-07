// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({ readFile: vi.fn(async () => Buffer.from("0123456789")) }));
const { manualVideoResponse } = await import("@/features/settings/manual-video");
const { readFile } = await import("node:fs/promises");
const request = (range?: string) =>
  new Request("http://localhost/api/admin/manual/02-sign-in.mp4", { headers: range ? { range } : {} });

describe("private manual assets", () => {
  it("allows only catalogued assets and never resolves arbitrary paths", async () => {
    await expect(manualVideoResponse("../secret", request(), "r")).rejects.toMatchObject({ code: "NOT_FOUND" });
    const response = await manualVideoResponse("02-sign-in.mp4", request(), "r");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("video/mp4");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("r");
    expect(response.headers.get("content-length")).toBe("10");
    expect(await response.text()).toBe("0123456789");
    expect(readFile).toHaveBeenCalledWith(expect.stringContaining("resources/admin-manual/02-sign-in.mp4"));
    expect((await manualVideoResponse("02-sign-in.vtt", request(), "r")).headers.get("content-type")).toBe(
      "text/vtt; charset=utf-8",
    );
  });
  it.each([
    ["bytes=2-4", "234"],
    ["bytes=8-99", "89"],
    ["bytes=8-", "89"],
    ["bytes=-3", "789"],
    ["bytes=-99", "0123456789"],
  ])("supports playback and seeking: %s", async (range, expected) => {
    const response = await manualVideoResponse("02-sign-in.mp4", request(range), "r");
    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toMatch(/^bytes \d+-\d+\/10$/);
    expect(await response.text()).toBe(expected);
  });
  it.each([
    "bytes=-",
    "bytes=-0",
    "bytes=99-",
    "bytes=4-2",
    "bytes=1-2,5-6",
    "other",
    "bytes=99999999999999999999-",
    "bytes=0-0xF",
  ])("refuses invalid ranges: %s", async (range) => {
    const response = await manualVideoResponse("02-sign-in.mp4", request(range), "r");
    expect(response.status).toBe(416);
    expect(response.headers.get("content-range")).toBe("bytes */10");
  });
});
