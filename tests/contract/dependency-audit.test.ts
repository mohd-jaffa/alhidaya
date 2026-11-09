// @vitest-environment node
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

function audit(report: unknown, literal = false) {
  const folder = mkdtempSync(path.join(tmpdir(), "alhidaya-audit-"));
  try {
    const file = path.join(folder, "report.json");
    writeFileSync(file, literal ? String(report) : JSON.stringify(report));
    return spawnSync(process.execPath, ["scripts/audit-shipped.mjs", "--report", file], { encoding: "utf8" });
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}
const complete = (vulnerabilities = {}) => ({
  auditReportVersion: 2,
  vulnerabilities,
  metadata: { vulnerabilities: { total: Object.keys(vulnerabilities).length } },
});

describe("the shipped dependency audit", () => {
  it("accepts a complete clean report and development-only findings", () => {
    expect(audit(complete()).status).toBe(0);
    expect(audit(complete({ "drizzle-kit": { severity: "moderate" } })).status).toBe(0);
  });
  it("blocks moderate and higher findings in runtime dependencies", () => {
    const result = audit(complete({ next: { severity: "moderate" } }));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Ships with a moderate vulnerability: next");
  });
  it.each([
    {},
    { error: { code: "ENOAUDIT" } },
    { ...complete(), metadata: undefined },
    { ...complete(), vulnerabilities: [] },
    complete({ next: { severity: "unknown" } }),
  ])("fails closed on incomplete or failed reports: %j", (report) => {
    expect(audit(report).status).not.toBe(0);
  });
  it("fails closed on malformed output", () => {
    expect(audit("not JSON", true).status).not.toBe(0);
  });
});
