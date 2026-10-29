import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { ADMIN_SESSION, PASSWORD_LENGTH, PASSWORD_RESET_MINUTES } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";
import { getDb } from "@/db/client";
import { authAccount, authSession, authUser, authVerification } from "@/db/schema";
import { getServerEnv } from "@/lib/env/server";

import { sendResetPasswordMail } from "./reset-mail";

function createAuth() {
  const env = getServerEnv();
  return betterAuth({
    appName: UI_TEXT.siteName,
    baseURL: env.NEXT_PUBLIC_SITE_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), {
      provider: "mysql",
      schema: { user: authUser, session: authSession, account: authAccount, verification: authVerification },
    }),
    emailAndPassword: {
      enabled: true,
      // One admin, made by a script (plan D14); nobody signs up.
      disableSignUp: true,
      autoSignIn: false,
      minPasswordLength: PASSWORD_LENGTH.min,
      maxPasswordLength: PASSWORD_LENGTH.max,
      resetPasswordTokenExpiresIn: PASSWORD_RESET_MINUTES * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: sendResetPasswordMail,
    },
    session: {
      expiresIn: ADMIN_SESSION.hours * 60 * 60,
      updateAge: ADMIN_SESSION.refreshMinutes * 60,
    },
    trustedOrigins: [new URL(env.NEXT_PUBLIC_SITE_URL).origin],
    advanced: {
      cookiePrefix: "alhidaya",
      useSecureCookies: env.NODE_ENV === "production",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
      database: { generateId: () => crypto.randomUUID() },
    },
    telemetry: { enabled: false },
  });
}

export type Auth = ReturnType<typeof createAuth>;

const cache = globalThis as unknown as { alhidayaAuth?: { auth: Auth; db: ReturnType<typeof getDb> } };

/**
 * The admin's authentication (plan D43, §26.4): Better Auth on the site's
 * own database, made on first use. Its HTTP routes are never mounted: the
 * admin's own routes call it on the server, so there is no sign-up endpoint,
 * nothing to discover, and every attempt passes the lockout first. It is
 * made again when the database it was made on has since been closed (a
 * script or a test that closed the pool and carries on).
 */
export function getAuth(): Auth {
  const db = getDb();
  if (cache.alhidayaAuth?.db !== db) cache.alhidayaAuth = { auth: createAuth(), db };
  return cache.alhidayaAuth.auth;
}
