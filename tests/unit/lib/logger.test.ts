// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { logger, redactSensitive } from "@/lib/logger";

afterEach(() => vi.restoreAllMocks());

describe("redactSensitive", () => {
  it("removes credentials and anything personal, keeping ids, codes and paths", () => {
    expect(
      redactSensitive({
        requestId: "req_1",
        code: "CONFLICT",
        path: "/api/applications",
        password: "p",
        DATABASE_URL: "mysql://u:p@h/db",
        sessionToken: "t",
        fullName: "Jane",
        phone: "+974",
        email: "a@b.c",
        message: "my mother needs care",
        cvFile: "x.pdf",
        ip_hash: "abc",
        nested: [{ whatsapp: "+974", status: "NEW" }],
      }),
    ).toEqual({
      requestId: "req_1",
      code: "CONFLICT",
      path: "/api/applications",
      password: "[Redacted]",
      DATABASE_URL: "[Redacted]",
      sessionToken: "[Redacted]",
      fullName: "[Redacted]",
      phone: "[Redacted]",
      email: "[Redacted]",
      message: "[Redacted]",
      cvFile: "[Redacted]",
      ip_hash: "[Redacted]",
      nested: [{ whatsapp: "[Redacted]", status: "NEW" }],
    });
  });

  it("keeps plain values and stops at a depth", () => {
    expect(redactSensitive("text")).toBe("text");
    expect(redactSensitive(null)).toBeNull();
    let deep: Record<string, unknown> = { leaf: 1 };
    for (let i = 0; i < 10; i++) deep = { inner: deep };
    expect(JSON.stringify(redactSensitive(deep))).toContain("[MaxDepth]");
  });
});

describe("logger", () => {
  it("writes one redacted JSON line at each level", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.info("started");
    logger.warn("refused", { email: "a@b.c" }, "req_2");
    logger.error("failed", { status: 500 });

    expect(JSON.parse(info.mock.calls[0][0])).toMatchObject({ level: "info", message: "started" });
    expect(JSON.parse(warn.mock.calls[0][0])).toMatchObject({
      level: "warn",
      requestId: "req_2",
      context: { email: "[Redacted]" },
    });
    expect(JSON.parse(error.mock.calls[0][0])).toMatchObject({ level: "error", context: { status: 500 } });
  });
});
