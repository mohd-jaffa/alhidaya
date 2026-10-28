import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/** The migration as it will run on the server (plan §28): read as text. */
const sql = readFileSync("drizzle/0000_auth.sql", "utf8");

describe("0000_auth", () => {
  it("creates Better Auth's tables and the lockout table", () => {
    for (const table of ["auth_user", "auth_session", "auth_account", "auth_verification", "sign_in_attempts"]) {
      expect(sql).toContain(`CREATE TABLE \`${table}\``);
    }
  });

  it("keeps instants to the millisecond, ids as UUIDs", () => {
    expect(sql).not.toMatch(/\btimestamp\b/);
    expect(sql).toMatch(/`id` varchar\(36\) NOT NULL/);
    expect(sql).toMatch(/`created_at` datetime\(3\) NOT NULL/);
  });

  it("cascades an admin's deletion and keeps their email unique", () => {
    expect(sql).toMatch(/auth_session_user_id_auth_user_id_fk.*ON DELETE cascade/);
    expect(sql).toMatch(/auth_account_user_id_auth_user_id_fk.*ON DELETE cascade/);
    expect(sql).toContain("CONSTRAINT `auth_user_email_unique` UNIQUE(`email`)");
  });

  it("stores no email or address in the lockout table", () => {
    const lockout = sql.slice(sql.indexOf("CREATE TABLE `sign_in_attempts`"));
    expect(lockout.slice(0, lockout.indexOf(");"))).not.toMatch(/email|ip_address/);
  });
});
