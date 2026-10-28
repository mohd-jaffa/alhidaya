import { PASSWORD_LENGTH } from "@/constants/limits";
import { getAuth } from "@/lib/auth/auth";
import { conflictError, validationError } from "@/lib/errors";

/**
 * Makes the site's one admin account (plan D14, §26.4). Public sign-up is
 * disabled, so this is the only way an account comes to exist: the account
 * and its password's hash are written through Better Auth's own adapter, never
 * by hand. Run by `npm run admin:create`, locally and once on the server
 * (R8.1, after full payment).
 */
export async function createAdmin(input: { email: string; name: string; password: string }): Promise<{ id: string }> {
  const email = input.email.trim().toLowerCase();
  if (input.password.length < PASSWORD_LENGTH.min || input.password.length > PASSWORD_LENGTH.max) {
    throw validationError("VALIDATION_ERROR", { field: "password" });
  }

  const context = await getAuth().$context;
  if (await context.internalAdapter.findUserByEmail(email)) throw conflictError("CONFLICT", { field: "email" });

  const user = await context.internalAdapter.createUser(
    { email, name: input.name.trim(), emailVerified: true },
    { method: "admin" },
  );
  await context.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await context.password.hash(input.password),
  });
  return { id: user.id };
}
