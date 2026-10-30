import { getTableConfig } from "drizzle-orm/mysql-core";
import { describe, expect, it } from "vitest";

import { enquiries, enquiryNotes } from "@/db/schema";

describe("the enquiry tables", () => {
  it("check every vocabulary and index what the inbox, the purge and the mail-retry cron read", () => {
    expect(getTableConfig(enquiries).checks.map((entry) => entry.name)).toEqual([
      "enquiries_form_check",
      "enquiries_status_check",
      "enquiries_email_status_check",
      "enquiries_email_retries_check",
    ]);
    expect(getTableConfig(enquiries).indexes.map((entry) => entry.config.name)).toEqual([
      "enquiries_created_at_idx",
      "enquiries_email_status_created_at_idx",
      "enquiries_status_created_at_idx",
    ]);
  });

  it("delete an enquiry's notes with it, and keep a note when its admin account goes", () => {
    const [enquiry, admin] = getTableConfig(enquiryNotes).foreignKeys;
    expect([enquiry.onDelete, getTableConfig(enquiry.reference().foreignTable).name]).toEqual(["cascade", "enquiries"]);
    expect([admin.onDelete, getTableConfig(admin.reference().foreignTable).name]).toEqual(["set null", "auth_user"]);
    expect(getTableConfig(enquiryNotes).indexes.map((entry) => entry.config.name)).toEqual([
      "enquiry_notes_enquiry_id_idx",
    ]);
  });
});
