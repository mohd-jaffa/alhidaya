import { timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@/lib/env/server";
import { authenticationError } from "@/lib/errors";

import { type ApiContext, withApiHandler } from "./handler";

/** Whether two secrets are the same, in a time that does not say how much of them matched. */
function same(given: string, expected: string): boolean {
  const [a, b] = [Buffer.from(given), Buffer.from(expected)];
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * What every timed job's route is wrapped in (plan §17, AGENTS.md §17): only
 * a request bearing CRON_SECRET runs it, as the cPanel cron entry sends it;
 * anything else is refused as unsigned.
 */
export function withCronRoute<TData>(request: Request, handler: (context: ApiContext) => Promise<TData>) {
  return withApiHandler(request, async (context) => {
    const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1] ?? "";
    if (!same(token, getServerEnv().CRON_SECRET)) throw authenticationError("AUTH_SESSION_REQUIRED");
    return handler(context);
  });
}
