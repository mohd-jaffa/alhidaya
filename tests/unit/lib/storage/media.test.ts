// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

vi.mock("@/constants/limits", async (original) => {
  const actual = await original<typeof import("@/constants/limits")>();
  return { ...actual, DISK_BUDGETS: { ...actual.DISK_BUDGETS, mediaBytes: 64 } };
});

const { deleteMediaFile, ensureMediaFolder, MEDIA_HTACCESS, mediaFolderBytes, mediaKey, mediaUrl, saveMediaFile } =
  await import("@/lib/storage/media");

let root = "";
beforeEach(async () => {
  root = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "alhidaya-media-")), "media");
  stubServerEnv({ MEDIA_DIR: root });
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await fs.rm(path.dirname(root), { recursive: true, force: true });
});

const at = new Date("2026-10-28T09:00:00Z");

describe("the media folder", () => {
  it("names files itself and serves them from the media address", () => {
    expect(mediaKey("webp", at)).toMatch(/^2026-10\/[0-9a-f]{10}\.webp$/);
    expect(mediaKey("avif", at, "w640")).toMatch(/^2026-10\/[0-9a-f]{10}-w640\.avif$/);
    expect(mediaUrl("2026-10/abc.webp")).toBe("/media/2026-10/abc.webp");
  });

  it("keeps public files readable, never executable, behind its own .htaccess", async () => {
    const key = await saveMediaFile({ bytes: new Uint8Array(8), type: "webp", key: mediaKey("webp", at, "w640") });
    expect((await fs.stat(path.join(root, key))).mode & 0o777).toBe(0o644);
    expect(await fs.readFile(path.join(root, ".htaccess"), "utf8")).toBe(MEDIA_HTACCESS);
    expect(await mediaFolderBytes()).toBe(8 + Buffer.byteLength(MEDIA_HTACCESS));
    await deleteMediaFile(key);
    await expect(fs.stat(path.join(root, key))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("refuses what is not an image or a PDF, and anything past the budget", async () => {
    await expect(
      saveMediaFile({ bytes: new Uint8Array(1), type: "docx", key: "2026-10/aaaaaaaaaa.pdf" }),
    ).rejects.toMatchObject({
      code: "UPLOAD_TYPE_NOT_ALLOWED",
    });
    await expect(
      saveMediaFile({ bytes: new Uint8Array(100), type: "pdf", key: mediaKey("pdf", at) }),
    ).rejects.toMatchObject({
      code: "STORAGE_FULL",
    });
    await expect(deleteMediaFile("2026-10/../../x.webp")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("writes rules that list nothing, run nothing and serve only images and PDFs", async () => {
    await ensureMediaFolder();
    expect(MEDIA_HTACCESS).toContain("Options -Indexes -ExecCGI");
    expect(MEDIA_HTACCESS).toContain("RemoveHandler .php");
    expect(MEDIA_HTACCESS).toMatch(
      /Require all denied\n<FilesMatch "\\\.\(\?i:jpe\?g\|png\|webp\|avif\|pdf\)\$">\n {2}Require all granted/,
    );
    expect(MEDIA_HTACCESS).toContain('Header set X-Content-Type-Options "nosniff"');
  });
});
