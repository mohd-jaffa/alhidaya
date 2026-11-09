// The public media folder: keys, files and Apache's rules (plan §15).
import fs from "node:fs/promises";
import path from "node:path";

import { DISK_BUDGETS } from "@/constants/limits";
import { BROCHURE_TYPES, FILE_TYPES, IMAGE_TYPES, type FileType } from "@/constants/uploads";
import { getServerEnv } from "@/lib/env/server";
import { businessRuleError, validationError } from "@/lib/errors";

import { folderBytes, insideFolder, removeFile, writeNewFile } from "./disk";
import { monthFolder, randomPart } from "./names";

/** Public files: readable by Apache, never executable (plan §15). */
const FOLDER_MODE = 0o755;
const FILE_MODE = 0o644;

/** A stored media file's key: its month folder and a name the app made. */
const MEDIA_KEY = /^\d{4}-\d{2}\/[a-z0-9]{10}(-w\d{2,4})?\.(jpg|png|webp|avif|pdf)$/;

/**
 * The media folder's own rules for Apache (plan §15, §21.3): nothing listed,
 * nothing run (PHP and CGI handlers removed), every file refused unless it is
 * an image or a PDF, types never sniffed, and each file cached for a year
 * (its name never changes). Written into the folder by `ensureMediaFolder`.
 */
export const MEDIA_HTACCESS = `# Written by the site (plan §15). Edit the code, not this file.
Options -Indexes -ExecCGI
RemoveHandler .php .phtml .phar .php3 .php4 .php5 .php7 .php8 .pl .py .cgi .sh
RemoveType .php .phtml .phar
<IfModule mod_php.c>
  php_flag engine off
</IfModule>
Require all denied
<FilesMatch "\\.(?i:jpe?g|png|webp|avif|pdf)$">
  Require all granted
</FilesMatch>
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
`;

/** Makes the media folder, with its .htaccess, when it is not there yet. */
export async function ensureMediaFolder(): Promise<void> {
  const folder = getServerEnv().MEDIA_DIR;
  await fs.mkdir(folder, { recursive: true, mode: FOLDER_MODE });
  await fs.writeFile(path.join(folder, ".htaccess"), MEDIA_HTACCESS, { mode: FILE_MODE });
}

/** A new name in this month's folder; `variant` marks one of an image's made sizes. */
export function mediaKey(type: FileType, at: Date, variant?: string): string {
  return `${monthFolder(at)}/${randomPart()}${variant ? `-${variant}` : ""}.${FILE_TYPES[type].extension}`;
}

/** Where a stored file is served from: "/media/2026-10/8f3a2c91d0.webp". */
export function mediaUrl(key: string): string {
  return `${getServerEnv().MEDIA_URL}/${key}`;
}

function mediaPath(key: string): string {
  if (!MEDIA_KEY.test(key)) throw validationError("VALIDATION_ERROR", { field: "mediaKey" });
  return insideFolder(getServerEnv().MEDIA_DIR, key);
}

const MIME_BY_EXTENSION: Record<string, string> = Object.fromEntries(
  Object.values(FILE_TYPES).map((type) => [type.extension, type.mime]),
);

/** A stored file and its type, by key; an address that is not a key the app made is refused. */
export async function readMediaFile(key: string): Promise<{ bytes: Uint8Array<ArrayBuffer>; mime: string }> {
  const bytes = new Uint8Array(await fs.readFile(mediaPath(key)));
  return { bytes, mime: MIME_BY_EXTENSION[key.slice(key.lastIndexOf(".") + 1)] };
}

/**
 * Keeps one public file (an image size or the brochure) and answers with its
 * key. Only images and PDFs are taken, and only while the folder stays within
 * its budget (plan §21.2).
 */
export async function saveMediaFile(file: { bytes: Uint8Array; type: FileType; key: string }): Promise<string> {
  if (![...IMAGE_TYPES, ...BROCHURE_TYPES].includes(file.type)) throw validationError("UPLOAD_TYPE_NOT_ALLOWED");
  if ((await mediaFolderBytes()) + file.bytes.byteLength > DISK_BUDGETS.mediaBytes)
    throw businessRuleError("STORAGE_FULL");
  await ensureMediaFolder();
  await writeNewFile(mediaPath(file.key), file.bytes, FILE_MODE, FOLDER_MODE);
  return file.key;
}

export async function deleteMediaFile(key: string): Promise<void> {
  await removeFile(mediaPath(key));
}

/** The media folder's size, for the budget and the admin's overview. */
export async function mediaFolderBytes(): Promise<number> {
  return folderBytes(getServerEnv().MEDIA_DIR);
}
