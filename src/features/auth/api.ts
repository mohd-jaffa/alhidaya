import { APIError } from "better-auth/api";

import { PASSWORD_CHANGE_RATE_LIMIT, RESET_RATE_LIMITS, SIGN_IN_FAILURE_MIN_MS } from "@/constants/limits";
import { ERROR_MESSAGES } from "@/constants/messages";
import { AUDIT_ENTITIES } from "@/constants/statuses";
import { logActionSafe } from "@/lib/audit/auditLog";
import { getAuth } from "@/lib/auth/auth";
import { authenticationError, rateLimitError, validationError } from "@/lib/errors";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";

import { clearFailures, isLocked, lockoutKeys, recordFailure } from "./lockout";

/** Who is asking, as the route saw them. */
export interface Asker {
  ip: string;
  userAgent: string | null;
  requestId: string;
}

/** Better Auth's own refusal, by its code. */
function refusedWith(error: unknown, code: string): boolean {
  return error instanceof APIError && (error.body as { code?: string } | undefined)?.code === code;
}

/** The headers Better Auth records on the session: the IP the server saw, and the browser. */
function sessionHeaders(asker: Asker): Headers {
  const headers = new Headers({ "x-forwarded-for": asker.ip });
  if (asker.userAgent) headers.set("user-agent", asker.userAgent);
  return headers;
}

async function padTo(started: number, minimumMs: number) {
  const left = started + minimumMs - Date.now();
  if (left > 0) await new Promise((resolve) => setTimeout(resolve, left));
}

/**
 * Signs the admin in (plan §26.4) and answers with the session cookie's
 * headers. A locked email or IP is refused before the password is checked;
 * a failure counts against both, takes at least as long as any other, and
 * reads the same for a wrong password and an unknown email. The cookie lasts
 * for the browser's session only.
 */
export async function signIn(input: { email: string; password: string }, asker: Asker): Promise<Headers> {
  const keys = lockoutKeys(input.email, asker.ip);
  if (await isLocked(keys)) throw rateLimitError("AUTH_LOCKED");

  const started = Date.now();
  try {
    const { headers, response } = await getAuth().api.signInEmail({
      body: { email: input.email, password: input.password, rememberMe: false },
      headers: sessionHeaders(asker),
      returnHeaders: true,
    });
    await clearFailures(keys);
    await logActionSafe({
      actorId: response.user.id,
      action: "SIGN_IN",
      entityType: AUDIT_ENTITIES.account,
      entityId: response.user.id,
      requestId: asker.requestId,
    });
    return headers;
  } catch (error) {
    if (!refusedWith(error, "INVALID_EMAIL_OR_PASSWORD")) throw error;
    const locked = await recordFailure(keys);
    await padTo(started, SIGN_IN_FAILURE_MIN_MS);
    throw locked ? rateLimitError("AUTH_LOCKED") : authenticationError("AUTH_INVALID_CREDENTIALS");
  }
}

/** Signs the admin out: the session is deleted, and the answer clears its cookie. */
export async function signOut(headers: Headers, adminId: string, requestId: string): Promise<Headers> {
  const result = await getAuth().api.signOut({ headers, returnHeaders: true });
  await logActionSafe({
    actorId: adminId,
    action: "SIGN_OUT",
    entityType: AUDIT_ENTITIES.account,
    entityId: adminId,
    requestId,
  });
  return result.headers;
}

/**
 * Sends a reset link when the email is the admin's (plan §26.4). The answer
 * is the same either way; an IP asking too often is refused, and an email
 * asked for too often gets no more mail, silently, so the inbox is never
 * flooded and nothing is revealed.
 */
export async function requestPasswordReset(email: string, asker: Asker): Promise<void> {
  const ipAllowed = await consumeRateLimit({ scope: "reset:ip", key: asker.ip, ...RESET_RATE_LIMITS.ip });
  if (!ipAllowed) throw rateLimitError("RATE_LIMITED");
  const emailAllowed = await consumeRateLimit({ scope: "reset:email", key: email, ...RESET_RATE_LIMITS.email });
  if (!emailAllowed) return;

  await getAuth().api.requestPasswordReset({ body: { email } });
  await logActionSafe({
    actorId: null,
    action: "PASSWORD_RESET_REQUESTED",
    entityType: AUDIT_ENTITIES.account,
    requestId: asker.requestId,
  });
}

/** Sets a new password from a reset link; every session the admin had is ended. */
export async function resetPassword(token: string, password: string, requestId: string): Promise<void> {
  try {
    await getAuth().api.resetPassword({ body: { token, newPassword: password } });
  } catch (error) {
    if (refusedWith(error, "INVALID_TOKEN")) throw validationError("AUTH_RESET_INVALID");
    throw error;
  }
  await logActionSafe({ actorId: null, action: "PASSWORD_CHANGED", entityType: AUDIT_ENTITIES.account, requestId });
}

/** Renames the signed-in admin (D115): the name their profile shows and the admin greets them by. */
export async function renameAdmin(headers: Headers, adminId: string, name: string, requestId: string): Promise<void> {
  await getAuth().api.updateUser({ body: { name }, headers });
  await logActionSafe({
    actorId: adminId,
    action: "UPDATE",
    entityType: AUDIT_ENTITIES.account,
    entityId: adminId,
    requestId,
  });
}

/**
 * Changes the signed-in admin's password from their profile (D115): only with
 * the current one, tried at most a few times an hour, and every other session
 * they had is ended. Answers with this session's renewed cookie.
 */
export async function changeAdminPassword(
  headers: Headers,
  adminId: string,
  passwords: { currentPassword: string; newPassword: string },
  requestId: string,
): Promise<Headers> {
  const allowed = await consumeRateLimit({ scope: "password:change", key: adminId, ...PASSWORD_CHANGE_RATE_LIMIT });
  if (!allowed) throw rateLimitError("RATE_LIMITED");
  try {
    const result = await getAuth().api.changePassword({
      body: { ...passwords, revokeOtherSessions: true },
      headers,
      returnHeaders: true,
    });
    await logActionSafe({
      actorId: adminId,
      action: "PASSWORD_CHANGED",
      entityType: AUDIT_ENTITIES.account,
      entityId: adminId,
      requestId,
    });
    return result.headers;
  } catch (error) {
    if (refusedWith(error, "INVALID_PASSWORD"))
      throw validationError("AUTH_PASSWORD_WRONG", [
        { path: "currentPassword", message: ERROR_MESSAGES.AUTH_PASSWORD_WRONG },
      ]);
    throw error;
  }
}
