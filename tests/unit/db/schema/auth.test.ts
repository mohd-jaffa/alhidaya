import { getTableConfig } from "drizzle-orm/mysql-core";
import { describe, expect, it } from "vitest";

import { authAccount, authSession, authUser, authVerification, signInAttempts } from "@/db/schema";

/** The schema's rules, read from Drizzle's own view of each table (plan §26.4, §27). */
describe("the auth tables", () => {
  it("keep one account per email", () => {
    const email = getTableConfig(authUser).columns.find((column) => column.name === "email");
    expect(email?.isUnique).toBe(true);
    expect(email?.notNull).toBe(true);
  });

  it("delete an admin's sessions and accounts with the admin", () => {
    for (const table of [authSession, authAccount]) {
      const [foreignKey] = getTableConfig(table).foreignKeys;
      expect(foreignKey.onDelete).toBe("cascade");
      expect(getTableConfig(foreignKey.reference().foreignTable).name).toBe("auth_user");
    }
  });

  it("index every lookup", () => {
    const indexed = (table: Parameters<typeof getTableConfig>[0]) =>
      getTableConfig(table).indexes.map((entry) => entry.config.name);
    expect(indexed(authSession)).toEqual(["auth_session_user_id_idx"]);
    expect(indexed(authAccount)).toEqual(["auth_account_user_id_idx"]);
    expect(indexed(authVerification)).toEqual(["auth_verification_identifier_idx"]);
  });

  it("keep a session token unique", () => {
    expect(getTableConfig(authSession).columns.find((column) => column.name === "token")?.isUnique).toBe(true);
  });

  it("remember failed sign-ins only by a keyed hash, never an email or an IP", () => {
    expect(getTableConfig(signInAttempts).columns.map((column) => column.name)).toEqual([
      "key_hash",
      "failed_count",
      "locked_until",
      "created_at",
      "updated_at",
    ]);
  });
});
