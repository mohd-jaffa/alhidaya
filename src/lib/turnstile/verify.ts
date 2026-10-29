import { TURNSTILE_VERIFY_MS } from "@/constants/limits";
import { getServerEnv } from "@/lib/env/server";
import { authorizationError, externalServiceError } from "@/lib/errors";

import { TURNSTILE_SITEVERIFY } from "./endpoints";

/**
 * Checks with Cloudflare that a person sent a form (plan §10.3), before
 * anything of it is stored. A token works once: a refused or spent one is
 * refused, and the form gets a fresh one. Only the token and the secret are
 * sent, never the visitor's address. When Cloudflare cannot be reached, the
 * form is refused as an outside service's failure: nothing is kept unchecked.
 */
export async function verifyTurnstile(token: string): Promise<void> {
  let outcome: { success?: unknown };
  try {
    const response = await fetch(TURNSTILE_SITEVERIFY, {
      method: "POST",
      body: new URLSearchParams({ secret: getServerEnv().TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(TURNSTILE_VERIFY_MS),
    });
    if (!response.ok) throw new Error(`Turnstile siteverify answered ${response.status}`);
    outcome = (await response.json()) as { success?: unknown };
  } catch (error) {
    throw externalServiceError("EXTERNAL_SERVICE_ERROR", undefined, error);
  }
  if (outcome.success !== true) throw authorizationError("BOT_CHECK_FAILED");
}
