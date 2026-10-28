// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const values = vi.fn(async (row: unknown) => void row);
vi.mock("@/db/client", () => ({ getDb: () => ({ insert: () => ({ values }) }) }));

const { captureError } = await import("@/lib/audit/errorLog");
const { logger } = await import("@/lib/logger");

afterEach(() => {
  vi.restoreAllMocks();
  values.mockReset();
});

describe("captureError", () => {
  it("writes the failure, redacted, with its message and stack", async () => {
    const output = vi.spyOn(logger, "error").mockImplementation(() => {});
    await captureError({
      message: "API request failed",
      source: "API",
      error: new Error("boom"),
      reference: "req_1",
      code: "INTERNAL_ERROR",
      httpStatus: 500,
      path: "/api/x",
      context: { email: "a@b.c", status: "NEW" },
    });
    expect(output).toHaveBeenCalledWith("API request failed", expect.objectContaining({ detail: "boom" }), "req_1");
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "API",
        reference: "req_1",
        detail: "boom",
        stack: expect.stringContaining("Error: boom"),
        context: { email: "[Redacted]", status: "NEW" },
      }),
    );
  });

  it("defaults to the server's own work, and clips what is too long", async () => {
    vi.spyOn(logger, "error").mockImplementation(() => {});
    await captureError({ message: "x".repeat(400), path: "/".repeat(600) });
    const row = values.mock.calls[0][0] as Record<string, string | null>;
    expect(row.source).toBe("SERVER");
    expect(row.message).toHaveLength(300);
    expect(row.path).toHaveLength(500);
    expect(row.message?.endsWith("…")).toBe(true);
    expect(row).toMatchObject({ reference: null, detail: null, stack: null, context: null, adminId: null });
  });

  it("describes any thrown value", async () => {
    vi.spyOn(logger, "error").mockImplementation(() => {});
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    for (const error of ["plain text", { code: 7 }, circular]) await captureError({ message: "m", error });
    expect(values.mock.calls.map(([row]) => (row as { detail: string }).detail)).toEqual([
      "plain text",
      '{"code":7}',
      "[object Object]",
    ]);
  });

  it("never throws when the log cannot be written", async () => {
    const output = vi.spyOn(logger, "error").mockImplementation(() => {});
    values.mockRejectedValueOnce(new Error("db down"));
    await expect(captureError({ message: "m" })).resolves.toBeUndefined();
    values.mockRejectedValueOnce("odd");
    await captureError({ message: "m" });
    expect(output).toHaveBeenCalledWith("Error log not written", { reason: "db down" }, undefined);
    expect(output).toHaveBeenCalledWith("Error log not written", { reason: "odd" }, undefined);
  });
});
