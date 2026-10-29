import { API_ROUTES } from "@/constants/routes";
import { deleteJson, postJson } from "@/lib/api/client";
import type { ForgotPasswordInput, ResetPasswordInput, SignInInput } from "@/lib/validation";

/** The endpoints the admin's sign-in and password screens call (plan §26.4, AGENTS.md §14). */
export const AuthClient = {
  signIn: (input: SignInInput) => postJson<{ signedIn: true }>(API_ROUTES.adminSession, input),
  signOut: () => deleteJson<{ signedOut: true }>(API_ROUTES.adminSession),
  requestReset: (input: ForgotPasswordInput) => postJson<{ requested: true }>(API_ROUTES.passwordForgot, input),
  resetPassword: (input: ResetPasswordInput) => postJson<{ reset: true }>(API_ROUTES.passwordReset, input),
};
