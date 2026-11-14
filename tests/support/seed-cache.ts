import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import mysql from "mysql2/promise";

/**
 * The browser journeys' seed spends most of its time making the photographs and logos into their sizes (sharp,
 * AVIF), the same work in every CI shard. The seed already uses an image it finds in the library by its source, so
 * a run may hand the next run the images the first one made: the library's rows and its files, kept in the folder
 * `E2E_SEED_CACHE` names (a CI cache keyed by everything that decides what the images are). Unset, as on a
 * developer's machine, nothing here does anything. A cache that cannot be read is ignored: the seed makes the
 * images itself, only slower.
 */
const CACHE = process.env.E2E_SEED_CACHE ? path.resolve(process.env.E2E_SEED_CACHE) : null;
const ROWS = "media.json";
const FILES = "media";

const mediaFolder = () => path.resolve(process.env.MEDIA_DIR ?? "public/media");
// Dates and JSON travel as the text the database holds, so they go back exactly as they came out.
const connect = () =>
  mysql.createConnection({ uri: process.env.TEST_DATABASE_URL ?? "", dateStrings: true, jsonStrings: true });

/** Puts back the images an earlier run kept; true when it did, false when there was nothing usable. */
export async function restoreSeedImages(): Promise<boolean> {
  if (!CACHE || !existsSync(path.join(CACHE, ROWS))) return false;
  let connection: mysql.Connection | null = null;
  try {
    const rows = JSON.parse(await readFile(path.join(CACHE, ROWS), "utf8")) as Record<string, unknown>[];
    // The files first: rows must never name a file that is not there.
    await mkdir(mediaFolder(), { recursive: true });
    await cp(path.join(CACHE, FILES), mediaFolder(), { recursive: true });
    connection = await connect();
    try {
      await connection.query("DELETE FROM media");
      for (const row of rows) await connection.query("INSERT INTO media SET ?", [row]);
    } catch (error) {
      await connection.query("DELETE FROM media");
      throw error;
    }
    console.log(`Seed images restored from the cache (${rows.length} library rows).`);
    return true;
  } catch (error) {
    console.warn("The seed-image cache could not be used; the seed makes the images itself.", error);
    return false;
  } finally {
    await connection?.end();
  }
}

/** Keeps the images this run's seed made, for the next run: the rows are written last, so half a cache is none. */
export async function saveSeedImages(): Promise<void> {
  if (!CACHE || existsSync(path.join(CACHE, ROWS))) return;
  let connection: mysql.Connection | null = null;
  try {
    connection = await connect();
    const [rows] = await connection.query("SELECT * FROM media");
    await rm(CACHE, { recursive: true, force: true });
    await mkdir(CACHE, { recursive: true });
    await cp(mediaFolder(), path.join(CACHE, FILES), { recursive: true });
    await writeFile(path.join(CACHE, ROWS), JSON.stringify(rows));
    console.log(`Seed images kept for the next run (${(rows as unknown[]).length} library rows).`);
  } catch (error) {
    console.warn("The seed images could not be kept for the next run.", error);
    await rm(CACHE, { recursive: true, force: true });
  } finally {
    await connection?.end();
  }
}
