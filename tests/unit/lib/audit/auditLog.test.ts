// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const values = vi.fn(async (row: unknown) => void row);
const captureError = vi.fn(async (capture: unknown) => void capture);
vi.mock("@/db/client", () => ({ getDb: () => ({ insert: () => ({ values }) }) }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError }));

const { logActionSafe } = await import("@/lib/audit/auditLog");

afterEach(() => {
  values.mockReset();
  captureError.mockReset();
});

describe("logActionSafe", () => {
  it("records the change, absent fields as null", async () => {
    await logActionSafe({ actorId: "admin_1", action: "PUBLISH", entityType: "services" });
    expect(values).toHaveBeenCalledWith({
      actorId: "admin_1",
      action: "PUBLISH",
      entityType: "services",
      entityId: null,
      changes: null,
      summary: null,
      requestId: null,
    });
  });

  it("logs a failure to write and never throws", async () => {
    values.mockRejectedValueOnce(new Error("check failed"));
    await expect(
      logActionSafe({ actorId: null, action: "DELETE", entityType: "jobs", entityId: "j1", requestId: "req_1" }),
    ).resolves.toBeUndefined();
    expect(captureError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to write audit log", reference: "req_1", adminId: null }),
    );
    values.mockRejectedValueOnce(new Error("again"));
    await logActionSafe({ actorId: "a", action: "DELETE", entityType: "jobs" });
    expect(captureError.mock.calls[1][0]).toMatchObject({ reference: undefined });
  });
});
