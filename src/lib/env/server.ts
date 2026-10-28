import * as z from "zod";

import { internalError } from "@/lib/errors";

/** Unset and blank are the same thing in an env file. */
const blankAsMissing = (value: unknown) => (value === "" ? undefined : value);

const optionalString = z.preprocess(blankAsMissing, z.string().trim().min(1).optional());

const optionalPort = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : Number(value)),
  z.number().int().min(1).max(65535).optional(),
);

const optionalBoolean = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

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

  // The site's own mail (plan §17): the server's cPanel SMTP in production,
  // Mailpit locally. Unset, mail is off and every send says so.
  SMTP_HOST: optionalString,
  SMTP_PORT: optionalPort,
  SMTP_SECURE: optionalBoolean,
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,

  // Signs the admin's session cookies (Better Auth). At least 32 characters;
  // changing it signs the admin out (plan §26.4).
  BETTER_AUTH_SECRET: z.string().min(32),
  // Keys the hashes that stand in for emails and IPs in the lockout and the
  // rate limits, so neither is ever stored (plan §18, §26.4).
  HASH_SECRET: z.string().min(32),
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
