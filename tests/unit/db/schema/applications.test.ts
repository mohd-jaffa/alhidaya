import { getTableConfig } from "drizzle-orm/mysql-core";
import { describe, expect, it } from "vitest";

import { applicationNotes, applications } from "@/db/schema";

describe("the application tables", () => {
  it("check every vocabulary and the CV's size, and index what the inbox and the purge read", () => {
    expect(getTableConfig(applications).checks.map((entry) => entry.name)).toEqual([
      "applications_status_check",
      "applications_cv_type_check",
      "applications_cv_bytes_check",
      "applications_cv_status_check",
      "applications_email_status_check",
    ]);
    expect(getTableConfig(applications).indexes.map((entry) => entry.config.name)).toEqual([
      "applications_created_at_idx",
      "applications_status_created_at_idx",
      "applications_job_id_idx",
    ]);
  });

  it("keep an application when its job record goes", () => {
    const [job] = getTableConfig(applications).foreignKeys;
    expect([job.onDelete, getTableConfig(job.reference().foreignTable).name]).toEqual(["set null", "records"]);
  });

  it("delete an application's notes with it, and keep a note when its admin account goes", () => {
    const [application, admin] = getTableConfig(applicationNotes).foreignKeys;
    expect([application.onDelete, getTableConfig(application.reference().foreignTable).name]).toEqual([
      "cascade",
      "applications",
    ]);
    expect([admin.onDelete, getTableConfig(admin.reference().foreignTable).name]).toEqual(["set null", "auth_user"]);
  });
});
