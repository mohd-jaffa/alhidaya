// Keyed hashes standing in for emails and IPs (plan §18, §26.4).
import { createHmac } from "node:crypto";

import { getServerEnv } from "@/lib/env/server";

/**
 * A keyed hash that stands in for an email or an IP wherever the site only
 * needs to recognise one again (plan §18, §26.4): the value itself is never
 * stored, and without `HASH_SECRET` the hash cannot be reversed by guessing.
 */
export function keyedHash(kind: string, value: string): string {
  return createHmac("sha256", getServerEnv().HASH_SECRET).update(`${kind}:${value.trim().toLowerCase()}`).digest("hex");
}
