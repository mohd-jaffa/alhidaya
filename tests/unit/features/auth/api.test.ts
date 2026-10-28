// @vitest-environment node
import { APIError } from "better-auth/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = { signInEmail: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn(), resetPassword: vi.fn() };
const lockout = {
  lockoutKeys: vi.fn(() => ["email-key", "ip-key"]),
  isLocked: vi.fn(async () => false),
  recordFailure: vi.fn(async () => false),
  clearFailures: vi.fn(async () => {}),
};
const consumeRateLimit = vi.fn(async () => true);
const logActionSafe = vi.fn(async (entry: unknown) => void entry);
vi.mock("@/lib/auth/auth", () => ({ getAuth: () => ({ api }) }));
vi.mock("@/features/auth/lockout", () => lockout);
vi.mock("@/lib/rate-limit/rate-limit", () => ({ consumeRateLimit }));
vi.mock("@/lib/audit/auditLog", () => ({ logActionSafe }));

const { requestPasswordReset, resetPassword, signIn, signOut } = await import("@/features/auth/api");

const asker = { ip: "203.0.113.9", userAgent: "Firefox", requestId: "req_1" };
const credentials = { email: "admin@alhidaya.qa", password: "a long passphrase" };
const refused = (code: string) => new APIError("UNAUTHORIZED", { code, message: "x" });

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("signIn", () => {
  it("signs in, forgets the failures, records it, and answers with the cookie", async () => {
    const headers = new Headers({ "set-cookie": "alhidaya.session_token=x" });
    api.signInEmail.mockResolvedValue({ headers, response: { user: { id: "a1" } } });
    expect(await signIn(credentials, asker)).toBe(headers);
    expect(api.signInEmail).toHaveBeenCalledWith(
      expect.objectContaining({ body: { ...credentials, rememberMe: false }, returnHeaders: true }),
    );
    const sent = api.signInEmail.mock.calls[0][0].headers as Headers;
    expect([sent.get("x-forwarded-for"), sent.get("user-agent")]).toEqual(["203.0.113.9", "Firefox"]);
    expect(lockout.clearFailures).toHaveBeenCalledWith(["email-key", "ip-key"]);
    expect(logActionSafe).toHaveBeenCalledWith(expect.objectContaining({ actorId: "a1", action: "SIGN_IN" }));
  });

  it("records no browser when none was named", async () => {
    api.signInEmail.mockResolvedValue({ headers: new Headers(), response: { user: { id: "a1" } } });
    await signIn(credentials, { ...asker, userAgent: null });
    expect((api.signInEmail.mock.calls[0][0].headers as Headers).has("user-agent")).toBe(false);
  });

  it("refuses a locked email or IP before checking the password", async () => {
    lockout.isLocked.mockResolvedValueOnce(true);
    await expect(signIn(credentials, asker)).rejects.toMatchObject({ code: "AUTH_LOCKED", httpStatus: 429 });
    expect(api.signInEmail).not.toHaveBeenCalled();
  });

  it("counts a failure and refuses it no faster than the minimum", async () => {
    api.signInEmail.mockRejectedValue(refused("INVALID_EMAIL_OR_PASSWORD"));
    const attempt = signIn(credentials, asker);
    const outcome = expect(attempt).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS", httpStatus: 401 });
    await vi.advanceTimersByTimeAsync(799);
    expect(lockout.recordFailure).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await outcome;
  });

  it("locks on the failure that reaches the limit", async () => {
    api.signInEmail.mockRejectedValue(refused("INVALID_EMAIL_OR_PASSWORD"));
    lockout.recordFailure.mockResolvedValueOnce(true);
    const attempt = signIn(credentials, asker);
    const outcome = expect(attempt).rejects.toMatchObject({ code: "AUTH_LOCKED" });
    await vi.advanceTimersByTimeAsync(800);
    await outcome;
  });

  it("does not wait when the refusal already took long enough", async () => {
    api.signInEmail.mockImplementation(async () => {
      vi.advanceTimersByTime(1000);
      throw refused("INVALID_EMAIL_OR_PASSWORD");
    });
    await expect(signIn(credentials, asker)).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS" });
  });

  it("passes any other failure through, uncounted", async () => {
    const down = new Error("db down");
    api.signInEmail.mockRejectedValueOnce(down);
    await expect(signIn(credentials, asker)).rejects.toBe(down);
    api.signInEmail.mockRejectedValueOnce(refused("EMAIL_NOT_VERIFIED"));
    await expect(signIn(credentials, asker)).rejects.toBeInstanceOf(APIError);
    api.signInEmail.mockRejectedValueOnce(new APIError("UNAUTHORIZED"));
    await expect(signIn(credentials, asker)).rejects.toBeInstanceOf(APIError);
    expect(lockout.recordFailure).not.toHaveBeenCalled();
  });
});

describe("signOut", () => {
  it("ends the session, records it, and answers with the cleared cookie", async () => {
    const headers = new Headers({ "set-cookie": "alhidaya.session_token=; Max-Age=0" });
    api.signOut.mockResolvedValue({ headers });
    expect(await signOut(new Headers(), "a1", "req_2")).toBe(headers);
    expect(logActionSafe).toHaveBeenCalledWith(expect.objectContaining({ actorId: "a1", action: "SIGN_OUT" }));
  });
});

describe("requestPasswordReset", () => {
  it("asks Better Auth to send the link and records the request", async () => {
    await requestPasswordReset("admin@alhidaya.qa", asker);
    expect(consumeRateLimit).toHaveBeenNthCalledWith(1, expect.objectContaining({ scope: "reset:ip", key: asker.ip }));
    expect(consumeRateLimit).toHaveBeenNthCalledWith(2, expect.objectContaining({ scope: "reset:email" }));
    expect(api.requestPasswordReset).toHaveBeenCalledWith({ body: { email: "admin@alhidaya.qa" } });
    expect(logActionSafe).toHaveBeenCalledWith(
      expect.objectContaining({ action: "PASSWORD_RESET_REQUESTED", actorId: null }),
    );
  });

  it("refuses an IP asking too often", async () => {
    consumeRateLimit.mockResolvedValueOnce(false);
    await expect(requestPasswordReset("a@b.qa", asker)).rejects.toMatchObject({ code: "RATE_LIMITED" });
    expect(api.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("silently sends nothing more to an email asked for too often", async () => {
    consumeRateLimit.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await expect(requestPasswordReset("a@b.qa", asker)).resolves.toBeUndefined();
    expect(api.requestPasswordReset).not.toHaveBeenCalled();
  });
});

describe("resetPassword", () => {
  it("sets the new password and records it", async () => {
    await resetPassword("token", "a long passphrase", "req_3");
    expect(api.resetPassword).toHaveBeenCalledWith({ body: { token: "token", newPassword: "a long passphrase" } });
    expect(logActionSafe).toHaveBeenCalledWith(expect.objectContaining({ action: "PASSWORD_CHANGED" }));
  });

  it("says a used or expired link plainly, and passes anything else through", async () => {
    api.resetPassword.mockRejectedValueOnce(new APIError("BAD_REQUEST", { code: "INVALID_TOKEN", message: "x" }));
    await expect(resetPassword("bad", "a long passphrase", "r")).rejects.toMatchObject({
      code: "AUTH_RESET_INVALID",
      httpStatus: 400,
    });
    const down = new Error("db down");
    api.resetPassword.mockRejectedValueOnce(down);
    await expect(resetPassword("t", "a long passphrase", "r")).rejects.toBe(down);
    expect(logActionSafe).not.toHaveBeenCalled();
  });
});
