import { getTableConfig } from "drizzle-orm/mysql-core";
import { describe, expect, it } from "vitest";

import { auditLog, errorLog } from "@/db/schema";

describe("the log tables", () => {
  it("check their vocabularies and index their dates", () => {
    expect(getTableConfig(auditLog).checks.map((entry) => entry.name)).toEqual(["audit_log_action_check"]);
    expect(getTableConfig(errorLog).checks.map((entry) => entry.name)).toEqual(["error_log_source_check"]);
    expect(getTableConfig(auditLog).indexes.map((entry) => entry.config.name)).toEqual([
      "audit_log_created_at_idx",
      "audit_log_entity_idx",
    ]);
  });

  it("let an audit row outlive its admin account", () => {
    const [foreignKey] = getTableConfig(auditLog).foreignKeys;
    expect(foreignKey.onDelete).toBe("set null");
    expect(getTableConfig(foreignKey.reference().foreignTable).name).toBe("auth_user");
  });
});
