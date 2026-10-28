import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { AUDIT_ACTIONS, ERROR_SOURCES } from "@/constants/statuses";

const sql = readFileSync("drizzle/0001_logs.sql", "utf8");

/** The CHECK a migration wrote, as the list it allows. */
function allowed(name: string): string[] {
  const match = sql.match(new RegExp(`CONSTRAINT \`${name}\` CHECK\\(\`\\w+\` in \\(([^)]*)\\)\\)`));
  return (match?.[1] ?? "").split(", ").map((value) => value.replace(/'/g, ""));
}

describe("0001_logs", () => {
  it("allows exactly the audit actions and error sources the code knows", () => {
    expect(allowed("audit_log_action_check")).toEqual([...AUDIT_ACTIONS]);
    expect(allowed("error_log_source_check")).toEqual([...ERROR_SOURCES]);
  });

  it("keeps a change when its admin account goes", () => {
    expect(sql).toMatch(/audit_log_actor_id_auth_user_id_fk.*ON DELETE set null/);
  });

  it("indexes what the activity screen and the purge read", () => {
    for (const index of ["audit_log_created_at_idx", "audit_log_entity_idx", "error_log_created_at_idx"]) {
      expect(sql).toContain(`CREATE INDEX \`${index}\``);
    }
  });
});
