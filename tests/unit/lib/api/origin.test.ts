// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { assertSameOrigin, forbiddenOrigin } from "@/lib/api/origin";
import { stubServerEnv } from "@tests/support/env";

afterEach(() => vi.unstubAllEnvs());

const request = (method: string, origin?: string) =>
  new Request("http://localhost:3000/api/admin/session", { method, headers: origin ? { origin } : {} });

describe("the same-origin check", () => {
  it("lets reads through and the site's own writes", () => {
    stubServerEnv();
    expect(forbiddenOrigin(request("GET"))).toBe(false);
    expect(forbiddenOrigin(request("HEAD", "https://evil.example"))).toBe(false);
    expect(forbiddenOrigin(request("POST", "http://localhost:3000"))).toBe(false);
  });

  it("refuses a write from another site, or with no origin at all", () => {
    stubServerEnv();
    expect(forbiddenOrigin(request("POST", "https://evil.example"))).toBe(true);
    expect(forbiddenOrigin(request("DELETE"))).toBe(true);
    expect(() => assertSameOrigin(request("POST", "http://localhost:3000.evil.example"))).toThrow(
      expect.objectContaining({ code: "REQUEST_ORIGIN_REFUSED", httpStatus: 403 }),
    );
    expect(() => assertSameOrigin(request("POST", "http://localhost:3000"))).not.toThrow();
  });
});
