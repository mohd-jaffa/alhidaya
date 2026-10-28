import { vi } from "vitest";

/** A complete, valid server environment for a unit test; every value is local-only. */
export const TEST_ENV = {
  DATABASE_URL: "mysql://alhidaya_app:local-app@127.0.0.1:56306/alhidaya_test",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "test-better-auth-secret-at-least-32-chars",
  HASH_SECRET: "test-hash-secret-at-least-thirty-two-chars",
  MEDIA_DIR: ".data/test-media",
  CV_DIR: ".data/test-cvs",
} as const;

export function stubServerEnv(overrides: Partial<Record<keyof typeof TEST_ENV | "MEDIA_URL", string>> = {}) {
  for (const [name, value] of Object.entries({ ...TEST_ENV, ...overrides })) vi.stubEnv(name, value);
}
