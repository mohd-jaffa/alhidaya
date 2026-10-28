import { describe, expect, it } from "vitest";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema } from "@/lib/validation";

describe("the admin's forms", () => {
  it("keep a password exactly as typed", () => {
    expect(signInSchema.parse({ email: " Admin@AlHidaya.qa ", password: "  spaced  " })).toEqual({
      email: "admin@alhidaya.qa",
      password: "  spaced  ",
    });
  });

  it("say nothing of the rules at sign-in, beyond needing a password", () => {
    expect(signInSchema.safeParse({ email: "a@b.qa", password: "x" }).success).toBe(true);
    expect(signInSchema.safeParse({ email: "a@b.qa", password: "" }).error?.issues[0].message).toBe(
      VALIDATION_MESSAGES.required("Password"),
    );
    expect(signInSchema.safeParse({ email: "a@b.qa" }).error?.issues[0].message).toBe(
      VALIDATION_MESSAGES.required("Password"),
    );
    expect(signInSchema.safeParse({ email: "a@b.qa", password: "x".repeat(129) }).success).toBe(false);
  });

  it("ask a new password to be 12 to 128 characters", () => {
    const length = VALIDATION_MESSAGES.passwordLength(12, 128);
    expect(resetPasswordSchema.safeParse({ token: "t", password: "short" }).error?.issues[0].message).toBe(length);
    expect(resetPasswordSchema.safeParse({ token: "t", password: "x".repeat(129) }).error?.issues[0].message).toBe(
      length,
    );
    expect(resetPasswordSchema.safeParse({ token: "t" }).error?.issues[0].message).toBe(
      VALIDATION_MESSAGES.required("Password"),
    );
    expect(resetPasswordSchema.parse({ token: "t", password: "a long passphrase" })).toEqual({
      token: "t",
      password: "a long passphrase",
    });
    expect(resetPasswordSchema.safeParse({ token: "", password: "a long passphrase" }).success).toBe(false);
  });

  it("need an email to send a reset to", () => {
    expect(forgotPasswordSchema.parse({ email: "HR@alhidaya.qa" })).toEqual({ email: "hr@alhidaya.qa" });
  });
});
