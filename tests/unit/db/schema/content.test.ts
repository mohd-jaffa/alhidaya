import { getTableConfig } from "drizzle-orm/mysql-core";
import { describe, expect, it } from "vitest";

import { documents, media, OPERATIONS_ID, records, siteOperations } from "@/db/schema";

const config = (table: Parameters<typeof getTableConfig>[0]) => getTableConfig(table);

describe("the content tables", () => {
  it("check every vocabulary and bound", () => {
    expect(config(documents).checks.map((entry) => entry.name)).toEqual(["documents_key_check"]);
    expect(config(records).checks.map((entry) => entry.name)).toEqual(["records_collection_check"]);
    expect(config(media).checks.map((entry) => entry.name)).toEqual(["media_kind_check"]);
    expect(config(siteOperations).checks.map((entry) => entry.name)).toEqual([
      "site_operations_one_row",
      "site_operations_retention_check",
      "site_operations_cv_expiry_check",
    ]);
  });

  it("keep one slug per collection and index what the public site reads", () => {
    expect(config(records).indexes.map((entry) => [entry.config.name, entry.config.unique])).toEqual([
      ["records_collection_slug_unique", true],
      ["records_collection_archived_idx", false],
    ]);
    expect(config(media).indexes.map((entry) => entry.config.name)).toEqual(["media_created_at_idx"]);
  });

  it("let content outlive the admin account that wrote it", () => {
    for (const table of [documents, records, media, siteOperations]) {
      for (const foreignKey of config(table).foreignKeys) {
        expect(foreignKey.onDelete).toBe("set null");
        expect(getTableConfig(foreignKey.reference().foreignTable).name).toBe("auth_user");
      }
    }
    expect(config(records).foreignKeys).toHaveLength(2);
  });

  it("names the one operations row", () => {
    expect(OPERATIONS_ID).toBe("operations");
  });
});
