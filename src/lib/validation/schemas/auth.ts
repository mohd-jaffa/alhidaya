import * as z from "zod";

import { PASSWORD_LENGTH, TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";

import { requiredEmail, requiredLine } from "../primitives";

/**
 * The admin's sign-in and password forms (plan §26.4). A password is never
 * trimmed or changed in any way (AGENTS.md §12); sign-in accepts any length up
 * to the maximum, so the form says nothing about the rules.
 */
const anyPassword = z
  .string({ error: VALIDATION_MESSAGES.required("Password") })
  .min(1, VALIDATION_MESSAGES.required("Password"))
  .max(PASSWORD_LENGTH.max, VALIDATION_MESSAGES.passwordLength(PASSWORD_LENGTH.min, PASSWORD_LENGTH.max));

export const signInSchema = z.object({ email: requiredEmail("Email"), password: anyPassword });
export type SignInInput = z.input<typeof signInSchema>;
export type SignInPayload = z.output<typeof signInSchema>;

export const forgotPasswordSchema = z.object({ email: requiredEmail("Email") });
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordPayload = z.output<typeof forgotPasswordSchema>;

/** A new password, held to the length rules (plan §26.4); never trimmed or changed. */
const newPassword = z
  .string({ error: VALIDATION_MESSAGES.required("Password") })
  .min(PASSWORD_LENGTH.min, VALIDATION_MESSAGES.passwordLength(PASSWORD_LENGTH.min, PASSWORD_LENGTH.max))
  .max(PASSWORD_LENGTH.max, VALIDATION_MESSAGES.passwordLength(PASSWORD_LENGTH.min, PASSWORD_LENGTH.max));

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(200),
  password: newPassword,
});
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type ResetPasswordPayload = z.output<typeof resetPasswordSchema>;

/** The admin's own name, as their profile shows it and sign-in greets them (D115). */
export const profileNameSchema = z.object({ name: requiredLine("Name", { max: TEXT_LIMITS.name }) });
export type ProfileNameInput = z.input<typeof profileNameSchema>;
export type ProfileNamePayload = z.output<typeof profileNameSchema>;

/**
 * A new password from the profile (D115): the current one, to prove it is the
 * admin, and the new one twice, the second only to catch a slip.
 */
export const changePasswordSchema = z
  .object({ currentPassword: anyPassword, newPassword, confirmPassword: anyPassword })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: VALIDATION_MESSAGES.passwordsDiffer,
  });
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;
export type ChangePasswordPayload = z.output<typeof changePasswordSchema>;
