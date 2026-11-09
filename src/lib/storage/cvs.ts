// The private CV folder: names, keys and permissions (plan §9.4, D54).
import fs from "node:fs/promises";
import path from "node:path";

import { DISK_BUDGETS } from "@/constants/limits";
import { CV_TYPES, FILE_TYPES, type FileType } from "@/constants/uploads";
import { getServerEnv } from "@/lib/env/server";
import { businessRuleError, validationError } from "@/lib/errors";

import { folderBytes, insideFolder, removeFile, writeNewFile } from "./disk";
import { monthFolder, randomPart, slugForFile } from "./names";

/** CVs are private to the account (plan §9.4, D54): folders 700, files 600. */
const FOLDER_MODE = 0o700;
const FILE_MODE = 0o600;

/** A stored CV's key: its month folder and its name, nothing that could leave the folder. */
const CV_KEY = /^\d{4}-\d{2}\/[a-z0-9-]+_[a-z0-9-]+_[a-z0-9-]+_[a-z0-9-]+\.(pdf|docx|doc)$/;

export interface CvToStore {
  bytes: Uint8Array;
  type: FileType;
  jobTitle: string | null;
  applicantName: string;
  receivedAt: Date;
}

/**
 * The name a CV is kept under, readable in cPanel's File Manager (plan D54):
 * `2026-10-28_registered-nurse_mariam-ali_8f3a2c91d0.pdf`. Job and name are
 * reduced to safe characters; the random part keeps names apart.
 */
export function cvKey(cv: Omit<CvToStore, "bytes">): string {
  const day = cv.receivedAt.toISOString().slice(0, 10);
  const job = slugForFile(cv.jobTitle ?? "", 40, "general");
  const applicant = slugForFile(cv.applicantName, 40, "applicant");
  return `${monthFolder(cv.receivedAt)}/${day}_${job}_${applicant}_${randomPart()}.${FILE_TYPES[cv.type].extension}`;
}

function cvPath(key: string): string {
  if (!CV_KEY.test(key)) throw validationError("VALIDATION_ERROR", { field: "cvKey" });
  return insideFolder(getServerEnv().CV_DIR, key);
}

/**
 * Keeps a CV in the private CV folder (plan §9.3, §9.4) and answers with its
 * key. Only a PDF or Word file is taken, and only while the folder stays
 * within its budget (plan §21.2).
 */
export async function saveCv(cv: CvToStore): Promise<string> {
  if (!CV_TYPES.includes(cv.type)) throw validationError("UPLOAD_TYPE_NOT_ALLOWED");
  const folder = getServerEnv().CV_DIR;
  if ((await folderBytes(folder)) + cv.bytes.byteLength > DISK_BUDGETS.cvBytes) throw businessRuleError("STORAGE_FULL");

  await fs.mkdir(folder, { recursive: true, mode: FOLDER_MODE });
  await fs.chmod(folder, FOLDER_MODE);
  const key = cvKey(cv);
  await writeNewFile(cvPath(key), cv.bytes, FILE_MODE, FOLDER_MODE);
  return key;
}

/** A stored CV's bytes, for the admin's download (plan §9.4). */
export async function readCv(key: string): Promise<Uint8Array> {
  return new Uint8Array(await fs.readFile(cvPath(key)));
}

/** Deletes a stored CV; one already gone is not an error (plan §18). */
export async function deleteCv(key: string): Promise<void> {
  await removeFile(cvPath(key));
}

/** The CV folder's size, for the admin's overview (plan §21.2). */
export async function cvFolderBytes(): Promise<number> {
  return folderBytes(path.resolve(getServerEnv().CV_DIR));
}
