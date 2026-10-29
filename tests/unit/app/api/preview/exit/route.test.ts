// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const disable = vi.fn();
vi.mock("next/headers", () => ({ draftMode: async () => ({ disable }) }));

const { GET } = await import("@/app/api/preview/exit/route");

describe("GET /api/preview/exit", () => {
  it("turns the preview off and goes back to what is published", async () => {
    const response = await GET(new Request("http://localhost:3000/api/preview/exit"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/");
    expect(disable).toHaveBeenCalledTimes(1);
  });
});
