import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { CV_EXPIRY_DAYS, RETENTION_DAYS } from "@/constants/limits";
import { DOCUMENT_KEYS } from "@/constants/sections";
import { MEDIA_KINDS, RECORD_COLLECTIONS } from "@/constants/statuses";

const sql = readFileSync("drizzle/0003_content.sql", "utf8");

/** The CHECK a migration wrote, as the list it allows. */
function allowed(name: string): string[] {
  const match = sql.match(new RegExp(`CONSTRAINT \`${name}\` CHECK\\(\`\\w+\` in \\(([^)]*)\\)\\)`));
  return (match?.[1] ?? "").split(", ").map((value) => value.replace(/'/g, ""));
}

describe("0003_content", () => {
  it("allows exactly the documents, collections and media kinds the code knows", () => {
    expect(allowed("documents_key_check")).toEqual([...DOCUMENT_KEYS]);
    expect(allowed("records_collection_check")).toEqual([...RECORD_COLLECTIONS]);
    expect(allowed("media_kind_check")).toEqual([...MEDIA_KINDS]);
  });

  it("bounds retention and CV expiry as the admin's settings do", () => {
    expect(sql).toContain(`CHECK(\`retention_days\` between ${RETENTION_DAYS.min} and ${RETENTION_DAYS.max})`);
    expect(sql).toContain(`CHECK(\`cv_expiry_days\` between ${CV_EXPIRY_DAYS.min} and ${CV_EXPIRY_DAYS.max})`);
    expect(sql).toContain("CONSTRAINT `site_operations_one_row` CHECK(`id` = 'operations')");
  });

  it("keeps one slug per collection", () => {
    expect(sql).toContain("CONSTRAINT `records_collection_slug_unique` UNIQUE(`collection`,`slug`)");
  });

  it("keeps content when its admin account goes", () => {
    const foreignKeys = sql.match(/FOREIGN KEY .* REFERENCES `auth_user`\(`id`\) ON DELETE set null/g) ?? [];
    expect(foreignKeys).toHaveLength(5);
  });

  it("indexes what the public site and the media library read", () => {
    for (const index of ["records_collection_archived_idx", "media_created_at_idx"]) {
      expect(sql).toContain(`CREATE INDEX \`${index}\``);
    }
  });
});
