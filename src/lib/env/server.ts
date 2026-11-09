// The server's environment, checked once at start (plan §26.2).
import path from "node:path";

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
 * these; later rows add theirs (the cron secret) as they arrive.
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
  // What the server's timed jobs send as their bearer token (plan §17): the
  // cPanel cron entry calls the daily clean-up with it. At least 32
  // characters; never in the repository.
  CRON_SECRET: z.string().min(32),

  // Cloudflare Turnstile, the public forms' check that a person is sending
  // (plan §10.3): the site key the widget is drawn with, given to the page at
  // request time, and the secret the server verifies a token with. Locally
  // and in the tests, Cloudflare's test keys; the site's own at R8.4.
  TURNSTILE_SITE_KEY: z.string().trim().min(1),
  TURNSTILE_SECRET_KEY: z.string().trim().min(1),

  // Where uploads live on the server (plan §9.4, §21.3): the media folder
  // inside public_html, served by Apache at MEDIA_URL; the CV folder outside
  // it, never served. Both outside the release folders.
  MEDIA_DIR: z.string().trim().min(1),
  MEDIA_URL: z
    .string()
    .trim()
    .regex(/^\/[A-Za-z0-9/_-]*$/)
    .default("/media"),
  CV_DIR: z.string().trim().min(1),

  // The kit preview page (/kit) exists only where this is "true": locally and
  // in the browser tests, never in production (plan D64).
  KIT_PREVIEW: optionalBoolean,
  // The app serves the media folder itself only where this is "true": locally and in the
  // browser tests. On the server Apache serves it (plan §21.3); never set in production.
  SERVE_MEDIA: optionalBoolean,
});

/** Whether one folder is the other, or inside it. */
function overlaps(first: string, second: string): boolean {
  const [a, b] = [path.resolve(first), path.resolve(second)];
  return a === b || a.startsWith(`${b}${path.sep}`) || b.startsWith(`${a}${path.sep}`);
}

/** The CV folder is never the public media folder, nor inside it or around it (plan §9.4). */
const checkedEnvSchema = serverEnvSchema.refine((env) => !overlaps(env.CV_DIR, env.MEDIA_DIR), { path: ["CV_DIR"] });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = checkedEnvSchema.safeParse(source);
  if (!parsed.success) {
    // Which variable failed, never its value: a database URL carries a password.
    throw internalError(
      "CONFIG_INVALID",
      parsed.error.issues.map((issue) => ({ variable: issue.path.join("."), problem: issue.code })),
    );
  }
  return parsed.data;
}
