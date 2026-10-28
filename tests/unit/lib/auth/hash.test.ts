// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { keyedHash } from "@/lib/auth/hash";
import { stubServerEnv } from "@tests/support/env";

afterEach(() => vi.unstubAllEnvs());

describe("keyedHash", () => {
  it("stands in for a value without holding it, the same however it was typed", () => {
    stubServerEnv();
    const hash = keyedHash("sign-in:email", "Admin@AlHidaya.qa ");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("admin");
    expect(keyedHash("sign-in:email", "admin@alhidaya.qa")).toBe(hash);
  });

  it("differs by kind and by secret", () => {
    stubServerEnv();
    const email = keyedHash("sign-in:email", "1.2.3.4");
    expect(keyedHash("sign-in:ip", "1.2.3.4")).not.toBe(email);
    stubServerEnv({ HASH_SECRET: "another-hash-secret-at-least-32-characters" });
    expect(keyedHash("sign-in:email", "1.2.3.4")).not.toBe(email);
  });
});
