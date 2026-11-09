// Reading and measuring the stored folders, never leaving them.
import fs from "node:fs/promises";
import path from "node:path";

/** Everything stored under a folder, in bytes; a folder not made yet holds nothing. */
export async function folderBytes(folder: string): Promise<number> {
  let entries;
  try {
    entries = await fs.readdir(folder, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
    throw error;
  }
  let total = 0;
  for (const entry of entries) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) total += await folderBytes(full);
    else if (entry.isFile()) total += (await fs.stat(full)).size;
  }
  return total;
}

/**
 * The absolute path a stored key names, refused unless it stays inside its
 * folder: a key is the app's own, but it is checked as if it were not.
 */
export function insideFolder(folder: string, key: string): string {
  const root = path.resolve(folder);
  const full = path.resolve(root, key);
  if (!full.startsWith(`${root}${path.sep}`)) throw new Error("Storage key escapes its folder");
  return full;
}

/** Writes a new file, never over another, with the mode given; its folders are made with theirs. */
export async function writeNewFile(full: string, bytes: Uint8Array, mode: number, folderMode: number): Promise<void> {
  await fs.mkdir(path.dirname(full), { recursive: true, mode: folderMode });
  await fs.chmod(path.dirname(full), folderMode);
  // "wx": fails if anything (a file, a link) already has the name.
  const handle = await fs.open(full, "wx", mode);
  try {
    await handle.writeFile(bytes);
    await handle.chmod(mode);
  } finally {
    await handle.close();
  }
}

/** Removes a file; one already gone is not an error. */
export async function removeFile(full: string): Promise<void> {
  try {
    await fs.unlink(full);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
