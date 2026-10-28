// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { folderBytes, insideFolder, removeFile, writeNewFile } from "@/lib/storage/disk";

let root = "";
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "alhidaya-disk-"));
});
afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

describe("the disk helpers", () => {
  it("add up a folder's files, a missing folder as nothing", async () => {
    await writeNewFile(path.join(root, "a", "one.bin"), new Uint8Array(10), 0o600, 0o700);
    await writeNewFile(path.join(root, "a", "b", "two.bin"), new Uint8Array(5), 0o600, 0o700);
    expect(await folderBytes(root)).toBe(15);
    expect(await folderBytes(path.join(root, "missing"))).toBe(0);
    await expect(folderBytes(path.join(root, "a", "one.bin"))).rejects.toMatchObject({ code: "ENOTDIR" });
  });

  it("never follow a link planted in the folder", async () => {
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), "alhidaya-outside-"));
    await fs.writeFile(path.join(outside, "big.bin"), new Uint8Array(1000));
    await fs.symlink(outside, path.join(root, "link"));
    await fs.symlink(path.join(outside, "big.bin"), path.join(root, "file-link"));
    expect(await folderBytes(root)).toBe(0);
    await fs.rm(outside, { recursive: true, force: true });
  });

  it("write a new file with its modes, never over another", async () => {
    const file = path.join(root, "x", "cv.pdf");
    await writeNewFile(file, new Uint8Array([1, 2, 3]), 0o600, 0o700);
    expect((await fs.stat(file)).mode & 0o777).toBe(0o600);
    expect((await fs.stat(path.dirname(file))).mode & 0o777).toBe(0o700);
    await expect(writeNewFile(file, new Uint8Array([9]), 0o600, 0o700)).rejects.toMatchObject({ code: "EEXIST" });
    expect(Array.from(await fs.readFile(file))).toEqual([1, 2, 3]);
  });

  it("refuse a key that leaves its folder", () => {
    expect(insideFolder(root, "2026-10/a.pdf")).toBe(path.join(root, "2026-10", "a.pdf"));
    expect(() => insideFolder(root, "../outside.pdf")).toThrow("escapes");
    expect(() => insideFolder(root, "/etc/passwd")).toThrow("escapes");
    expect(() => insideFolder(root, "")).toThrow("escapes");
  });

  it("remove a file, one already gone quietly, and say any other failure", async () => {
    const file = path.join(root, "gone.bin");
    await fs.writeFile(file, "x");
    await removeFile(file);
    await expect(removeFile(file)).resolves.toBeUndefined();
    await fs.mkdir(path.join(root, "folder"));
    await expect(removeFile(path.join(root, "folder"))).rejects.toBeDefined();
  });
});
