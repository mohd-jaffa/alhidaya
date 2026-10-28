// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getServerEnv } from "@/lib/env/server";

/** A partial environment, as a test hands one in. */
const env = (values: Record<string, string>) => values as unknown as NodeJS.ProcessEnv;

const valid = {
  DATABASE_URL: "mysql://alhidaya_app:local-app@127.0.0.1:56306/alhidaya",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("getServerEnv", () => {
  it("accepts a complete environment, development by default", () => {
    expect(getServerEnv(env(valid))).toEqual({ ...valid, NODE_ENV: "development" });
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

  it("refuses a missing site address", () => {
    expect(() => getServerEnv(env({ DATABASE_URL: valid.DATABASE_URL }))).toThrow(
      expect.objectContaining({ code: "CONFIG_INVALID" }),
    );
  });

  it("reads the process environment when given none", () => {
    expect(() => getServerEnv()).toThrow(expect.objectContaining({ code: "CONFIG_INVALID" }));
  });
});
