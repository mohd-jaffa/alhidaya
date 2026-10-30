import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { MAIL_RETRIES } from "@/constants/limits";

const sql = readFileSync("drizzle/0006_mail_retries.sql", "utf8");

describe("0006_mail_retries (D85)", () => {
  it("records on each enquiry and application how often its email was sent again, and when", () => {
    for (const table of ["enquiries", "applications"]) {
      expect(sql).toContain(`ALTER TABLE \`${table}\` ADD \`email_retries\` tinyint unsigned DEFAULT 0 NOT NULL`);
      expect(sql).toContain(`ALTER TABLE \`${table}\` ADD \`email_retried_at\` datetime(3)`);
    }
  });

  it("bounds the tries to the cron's own", () => {
    for (const table of ["enquiries", "applications"]) {
      expect(sql).toContain(
        `CONSTRAINT \`${table}_email_retries_check\` CHECK (\`email_retries\` between 0 and ${MAIL_RETRIES.tries})`,
      );
    }
  });

  it("indexes what the cron reads: what was not sent, oldest first", () => {
    for (const table of ["enquiries", "applications"]) {
      expect(sql).toContain(
        `CREATE INDEX \`${table}_email_status_created_at_idx\` ON \`${table}\` (\`email_status\`,\`created_at\`)`,
      );
    }
  });
});
