import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { APPLICATION_STATUSES, CV_STATUSES, EMAIL_STATUSES } from "@/constants/statuses";
import { CV_TYPES } from "@/constants/uploads";

const sql = readFileSync("drizzle/0005_applications.sql", "utf8");

/** The CHECK a migration wrote, as the list it allows. */
function allowed(name: string): string[] {
  const match = sql.match(new RegExp(`CONSTRAINT \`${name}\` CHECK\\(\`\\w+\` in \\(([^)]*)\\)\\)`));
  return (match?.[1] ?? "").split(", ").map((value) => value.replace(/'/g, ""));
}

describe("0005_applications", () => {
  it("allows exactly the statuses and CV types the code knows", () => {
    expect(allowed("applications_status_check")).toEqual([...APPLICATION_STATUSES]);
    expect(allowed("applications_cv_type_check")).toEqual([...CV_TYPES]);
    expect(allowed("applications_cv_status_check")).toEqual([...CV_STATUSES]);
    expect(allowed("applications_email_status_check")).toEqual([...EMAIL_STATUSES]);
  });

  it("holds a CV to the upload limit", () => {
    expect(sql).toContain(`CHECK(\`cv_bytes\` between 1 and ${UPLOAD_LIMITS.cvBytes})`);
  });

  it("never stores the applicant's IP or the CV itself", () => {
    expect(sql).not.toMatch(/`ip|blob/i);
  });

  it("keeps an application when its job goes, and deletes notes with their application", () => {
    expect(sql).toMatch(/applications_job_id_records_id_fk.*ON DELETE set null/);
    expect(sql).toMatch(/application_notes_application_id_applications_id_fk.*ON DELETE cascade/);
  });

  it("indexes what the inbox and the purge read", () => {
    for (const index of [
      "applications_created_at_idx",
      "applications_status_created_at_idx",
      "applications_job_id_idx",
      "application_notes_application_id_idx",
    ]) {
      expect(sql).toContain(`CREATE INDEX \`${index}\``);
    }
  });
});
