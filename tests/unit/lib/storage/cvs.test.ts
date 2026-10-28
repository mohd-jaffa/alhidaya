// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

vi.mock("@/constants/limits", async (original) => {
  const actual = await original<typeof import("@/constants/limits")>();
  return { ...actual, DISK_BUDGETS: { ...actual.DISK_BUDGETS, cvBytes: 64 } };
});

const { cvFolderBytes, cvKey, deleteCv, readCv, saveCv } = await import("@/lib/storage/cvs");

let root = "";
beforeEach(async () => {
  root = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "alhidaya-cvs-")), "cvs");
  stubServerEnv({ CV_DIR: root });
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await fs.rm(path.dirname(root), { recursive: true, force: true });
});

const cv = (overrides: Partial<Parameters<typeof saveCv>[0]> = {}) => ({
  bytes: new TextEncoder().encode("%PDF-1.4 cv"),
  type: "pdf" as const,
  jobTitle: "Registered General Nurse – Home Care",
  applicantName: "Mariam Ali",
  receivedAt: new Date("2026-10-28T09:00:00Z"),
  ...overrides,
});

describe("the CV folder", () => {
  it("names a CV so a person can find it in cPanel", () => {
    expect(cvKey(cv())).toMatch(
      /^2026-10\/2026-10-28_registered-general-nurse-home-care_mariam-ali_[0-9a-f]{10}\.pdf$/,
    );
    expect(cvKey(cv({ jobTitle: null, applicantName: "مريم", type: "docx" }))).toMatch(
      /_general_applicant_[0-9a-f]{10}\.docx$/,
    );
  });

  it("keeps a CV private to the account, and reads and deletes it by its key", async () => {
    const key = await saveCv(cv());
    const full = path.join(root, key);
    expect((await fs.stat(full)).mode & 0o777).toBe(0o600);
    expect((await fs.stat(root)).mode & 0o777).toBe(0o700);
    expect((await fs.stat(path.dirname(full))).mode & 0o777).toBe(0o700);
    expect(new TextDecoder().decode(await readCv(key))).toBe("%PDF-1.4 cv");
    expect(await cvFolderBytes()).toBe(11);
    await deleteCv(key);
    await expect(fs.stat(full)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(deleteCv(key)).resolves.toBeUndefined();
  });

  it("takes only a PDF or Word file", async () => {
    await expect(saveCv(cv({ type: "jpeg" }))).rejects.toMatchObject({ code: "UPLOAD_TYPE_NOT_ALLOWED" });
  });

  it("refuses a CV past the folder's budget", async () => {
    await saveCv(cv({ bytes: new Uint8Array(60) }));
    await expect(saveCv(cv({ bytes: new Uint8Array(10) }))).rejects.toMatchObject({
      code: "STORAGE_FULL",
      httpStatus: 422,
    });
  });

  it("refuses any key that is not one of its own", async () => {
    for (const key of ["../../etc/passwd", "2026-10/../../x.pdf", "2026-10/evil.php", "x.pdf"]) {
      await expect(readCv(key)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    }
  });
});
