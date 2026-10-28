import { describe, expect, it } from "vitest";

import { clientIp } from "@/lib/api/request-info";

describe("clientIp", () => {
  it("takes the address the server in front added last, not what the client claimed", () => {
    const request = new Request("http://x", { headers: { "x-forwarded-for": "6.6.6.6, 203.0.113.9" } });
    expect(clientIp(request)).toBe("203.0.113.9");
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": " 198.51.100.1 " } }))).toBe(
      "198.51.100.1",
    );
  });

  it("says unknown when there is none", () => {
    expect(clientIp(new Request("http://x"))).toBe("unknown");
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "" } }))).toBe("unknown");
  });
});
