// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const sendPasswordReset = vi.fn(async (input: unknown) => void input);
const createConfiguredMailService = vi.fn(() => ({ sendPasswordReset }));
const captureError = vi.fn(async (capture: unknown) => void capture);
vi.mock("@/lib/mail/nodemailer.provider", () => ({ createConfiguredMailService }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError }));

const { sendResetPasswordMail } = await import("@/lib/auth/reset-mail");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("sendResetPasswordMail", () => {
  it("links the admin's own reset page with the one-time token", async () => {
    stubServerEnv();
    await sendResetPasswordMail({ user: { email: "admin@alhidaya.qa", name: "Admin" }, token: "t/1+2" });
    expect(sendPasswordReset).toHaveBeenCalledWith({
      to: "admin@alhidaya.qa",
      name: "Admin",
      resetUrl: "http://localhost:3000/admin/reset-password?token=t%2F1%2B2",
    });
  });

  it("logs a mail failure and keeps it from the person asking", async () => {
    stubServerEnv();
    createConfiguredMailService.mockImplementationOnce(() => {
      throw new Error("no smtp");
    });
    await expect(sendResetPasswordMail({ user: { email: "a@b.c", name: "A" }, token: "t" })).resolves.toBeUndefined();
    expect(captureError).toHaveBeenCalledWith(expect.objectContaining({ message: "Password reset email not sent" }));
  });
});
