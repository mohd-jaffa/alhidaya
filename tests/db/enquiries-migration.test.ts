import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { EMAIL_STATUSES, ENQUIRY_STATUSES, FORM_KINDS } from "@/constants/statuses";

const sql = readFileSync("drizzle/0004_enquiries.sql", "utf8");

/** The CHECK a migration wrote, as the list it allows. */
function allowed(name: string): string[] {
  const match = sql.match(new RegExp(`CONSTRAINT \`${name}\` CHECK\\(\`\\w+\` in \\(([^)]*)\\)\\)`));
  return (match?.[1] ?? "").split(", ").map((value) => value.replace(/'/g, ""));
}

describe("0004_enquiries", () => {
  it("allows exactly the forms and statuses the code knows", () => {
    expect(allowed("enquiries_form_check")).toEqual([...FORM_KINDS]);
    expect(allowed("enquiries_status_check")).toEqual([...ENQUIRY_STATUSES]);
    expect(allowed("enquiries_email_status_check")).toEqual([...EMAIL_STATUSES]);
  });

  it("starts an enquiry new, its email still to send", () => {
    expect(sql).toContain("`status` varchar(16) NOT NULL DEFAULT 'NEW'");
    expect(sql).toContain("`email_status` varchar(8) NOT NULL DEFAULT 'PENDING'");
  });

  it("never stores the visitor's IP", () => {
    expect(sql).not.toMatch(/`ip/);
  });

  it("deletes notes with their enquiry", () => {
    expect(sql).toMatch(/enquiry_notes_enquiry_id_enquiries_id_fk.*ON DELETE cascade/);
  });

  it("indexes what the inbox and the purge read", () => {
    for (const index of [
      "enquiries_created_at_idx",
      "enquiries_status_created_at_idx",
      "enquiry_notes_enquiry_id_idx",
    ]) {
      expect(sql).toContain(`CREATE INDEX \`${index}\``);
    }
  });
});
