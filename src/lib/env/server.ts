import * as z from "zod";

import { internalError } from "@/lib/errors";

/**
 * Everything the server reads from its environment, checked once (plan
 * §26.2): a missing or malformed value stops with `CONFIG_INVALID` rather
 * than failing somewhere deeper with a stranger message. `.env.example` lists
 * these; later rows add theirs (mail, Turnstile, secrets) as they arrive.
 * Production values live in the cPanel Node.js app's environment.
 */
const serverEnvSchema = z.object({
  // The app's own user, with data rights only (plan §26.1).
  DATABASE_URL: z.string().regex(/^mysql:\/\/[^@/\s]+@[^/\s]+\/[A-Za-z0-9_]+$/),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    // Which variable failed, never its value: a database URL carries a password.
    throw internalError(
      "CONFIG_INVALID",
      parsed.error.issues.map((issue) => ({ variable: issue.path.join("."), problem: issue.code })),
    );
  }
  return parsed.data;
}
