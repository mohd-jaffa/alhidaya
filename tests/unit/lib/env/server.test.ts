// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getServerEnv } from "@/lib/env/server";
import { TEST_ENV } from "@tests/support/env";

/** A partial environment, as a test hands one in. */
const env = (values: Record<string, string>) => values as unknown as NodeJS.ProcessEnv;

const valid = { ...TEST_ENV };

describe("getServerEnv", () => {
  it("accepts a complete environment, development by default", () => {
    expect(getServerEnv(env(valid))).toEqual({ ...valid, NODE_ENV: "development", MEDIA_URL: "/media" });
  });

  it("refuses a database that is not MySQL, without echoing its value", () => {
    const secret = "postgres://user:hunter2@db/alhidaya";
    try {
      getServerEnv(env({ ...valid, DATABASE_URL: secret }));
      expect.unreachable();
    } catch (error) {
      expect(error).toMatchObject({ code: "CONFIG_INVALID", httpStatus: 500 });
      expect(JSON.stringify((error as { details: unknown }).details)).not.toContain("hunter2");
      expect((error as { details: unknown }).details).toEqual([
        { variable: "DATABASE_URL", problem: "invalid_format" },
      ]);
    }
  });

  it("needs both of Turnstile's keys (plan §10.3)", () => {
    for (const name of ["TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] as const) {
      const without = Object.fromEntries(Object.entries(valid).filter(([key]) => key !== name));
      expect(() => getServerEnv(env(without))).toThrow(expect.objectContaining({ code: "CONFIG_INVALID" }));
      expect(() => getServerEnv(env({ ...valid, [name]: " " }))).toThrow(
        expect.objectContaining({ code: "CONFIG_INVALID" }),
      );
    }
  });

  it("refuses a media address that is not a plain path", () => {
    expect(() => getServerEnv(env({ ...valid, MEDIA_URL: "https://cdn.example/media" }))).toThrow(
      expect.objectContaining({ code: "CONFIG_INVALID" }),
    );
    expect(getServerEnv(env({ ...valid, MEDIA_URL: "/uploads" })).MEDIA_URL).toBe("/uploads");
  });

  it("keeps the CV folder apart from the public media folder (plan §9.4)", () => {
    for (const [MEDIA_DIR, CV_DIR] of [
      ["/home/alhidaya/public_html/media", "/home/alhidaya/public_html/media"],
      ["/home/alhidaya/public_html/media", "/home/alhidaya/public_html/media/cvs"],
      ["/home/alhidaya/public_html/media/", "/home/alhidaya/public_html"],
    ]) {
      expect(() => getServerEnv(env({ ...valid, MEDIA_DIR, CV_DIR }))).toThrow(
        expect.objectContaining({ code: "CONFIG_INVALID", details: [{ variable: "CV_DIR", problem: "custom" }] }),
      );
    }
    const apart = { MEDIA_DIR: "/home/alhidaya/public_html/media", CV_DIR: "/home/alhidaya/alhidaya-data/cvs" };
    expect(getServerEnv(env({ ...valid, ...apart }))).toMatchObject(apart);
    const similar = { MEDIA_DIR: "/home/alhidaya/media", CV_DIR: "/home/alhidaya/media-cvs" };
    expect(getServerEnv(env({ ...valid, ...similar }))).toMatchObject(similar);
  });

  it("refuses a missing site address, and secrets too short to be secret", () => {
    expect(() => getServerEnv(env({ ...valid, BETTER_AUTH_SECRET: "short" }))).toThrow(
      expect.objectContaining({ code: "CONFIG_INVALID" }),
    );
    expect(() => getServerEnv(env({ DATABASE_URL: valid.DATABASE_URL }))).toThrow(
      expect.objectContaining({ code: "CONFIG_INVALID" }),
    );
  });

  it("reads the mail settings, blank as unset", () => {
    expect(
      getServerEnv(env({ ...valid, SMTP_HOST: "127.0.0.1", SMTP_PORT: "56325", SMTP_SECURE: "false", SMTP_USER: "" })),
    ).toMatchObject({ SMTP_HOST: "127.0.0.1", SMTP_PORT: 56325, SMTP_SECURE: false, SMTP_USER: undefined });
    expect(getServerEnv(env({ ...valid, SMTP_PORT: "", SMTP_SECURE: "true" }))).toMatchObject({
      SMTP_PORT: undefined,
      SMTP_SECURE: true,
    });
    expect(getServerEnv(env({ ...valid, SMTP_SECURE: "" })).SMTP_SECURE).toBeUndefined();
    expect(() => getServerEnv(env({ ...valid, SMTP_SECURE: "yes" }))).toThrow(
      expect.objectContaining({ code: "CONFIG_INVALID" }),
    );
  });

  it("reads the process environment when given none", () => {
    expect(() => getServerEnv()).toThrow(expect.objectContaining({ code: "CONFIG_INVALID" }));
  });
});
