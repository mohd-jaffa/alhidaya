// Exports the site's approved content from the LOCAL database for the launch (docs/RELEASE.md Q4, A3):
//
//   npx tsx --tsconfig tsconfig.json scripts/content-export.mts
//
// Writes release-content/ (git-ignored):
//   content.sql   plain INSERT statements for documents, records, media and site_operations, in one transaction;
//                 read it before it is used. The admin account, sessions, logs, enquiries, applications and the
//                 rate-limit table are never exported, and every created_by / updated_by is cleared (the
//                 production admin does not exist yet).
//   media/        exactly the image and PDF files the media rows name, under their own keys
//   summary.json  row counts and media files, for the import's own check
//
// Read-only: it only selects from the local database, and refuses to run against any other database.
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// The site's own address may be a tunnel while developing (D127), so the guard is the database: local only.
const databaseHost = new URL(process.env.DATABASE_URL ?? "mysql://invalid").hostname;
if (!["localhost", "127.0.0.1"].includes(databaseHost)) {
  console.error("The export reads a LOCAL database only (DATABASE_URL on localhost). Nothing was written.");
  process.exit(1);
}

const { getTableColumns, getTableName } = await import("drizzle-orm");
const { default: mysql } = await import("mysql2");
const { getDb, closeDb } = await import("../src/db/client");
const { documents, records, media, siteOperations } = await import("../src/db/schema");
const { getServerEnv } = await import("../src/lib/env/server");

const OUT = "release-content";
const ADMIN_COLUMNS = new Set(["created_by", "updated_by"]);
// Words that mean a test value slipped into content that is about to go live.
const LOOKS_LIKE_TEST = /localhost|127\.0\.0\.1|example\.(com|org)|mailpit|lorem ipsum|\.test\b/i;

function sqlValue(column: string, value: unknown): string {
  if (ADMIN_COLUMNS.has(column) || value === null || value === undefined) return "NULL";
  if (value instanceof Date) return `'${value.toISOString().replace("T", " ").replace("Z", "")}'`;
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "object") return mysql.escape(JSON.stringify(value));
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return mysql.escape(String(value));
}

try {
  const db = getDb();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(path.join(OUT, "media"), { recursive: true });

  const statements: string[] = [];
  const counts: Record<string, number> = {};
  const warnings: string[] = [];
  const tables = [documents, records, media, siteOperations] as const;

  for (const table of tables) {
    const name = getTableName(table);
    const columns = Object.entries(getTableColumns(table)).map(([property, column]) => ({
      property,
      name: column.name,
    }));
    const rows = (await db.select().from(table)) as Record<string, unknown>[];
    counts[name] = rows.length;
    for (const row of rows) {
      const values = columns.map((column) => sqlValue(column.name, row[column.property]));
      statements.push(
        `INSERT INTO \`${name}\` (${columns.map((column) => `\`${column.name}\``).join(", ")}) VALUES (${values.join(", ")});`,
      );
      const text = JSON.stringify(row);
      const hit = LOOKS_LIKE_TEST.exec(text);
      if (hit) warnings.push(`${name} ${String(row.key ?? row.id ?? "")}: contains "${hit[0]}"`);
    }
  }

  // The files the media rows name, and nothing else.
  const mediaFolder = path.resolve(getServerEnv().MEDIA_DIR);
  const files = new Set<string>();
  const missing: string[] = [];
  for (const row of await db.select().from(media)) {
    for (const variant of row.variants) files.add(variant.key);
  }
  let bytes = 0;
  for (const key of [...files].sort()) {
    const from = path.join(mediaFolder, key);
    if (!existsSync(from)) {
      missing.push(key);
      continue;
    }
    const to = path.join(OUT, "media", key);
    mkdirSync(path.dirname(to), { recursive: true });
    copyFileSync(from, to);
    bytes += statSync(from).size;
  }

  const operations = (await db.select().from(siteOperations))[0];
  writeFileSync(
    path.join(OUT, "content.sql"),
    [
      "-- Al Hidaya launch content, exported from the local database (docs/RELEASE.md Q4).",
      "SET NAMES utf8mb4;",
      "SET time_zone = '+00:00';",
      "START TRANSACTION;",
      ...statements,
      "COMMIT;",
      "",
    ].join("\n"),
    { mode: 0o600 },
  );
  writeFileSync(
    path.join(OUT, "summary.json"),
    JSON.stringify({ counts, mediaFiles: files.size - missing.length, mediaBytes: bytes, missing }, null, 2) + "\n",
    { mode: 0o600 },
  );

  console.log("Exported to release-content/:");
  for (const [name, count] of Object.entries(counts)) console.log(`  ${name.padEnd(18)} ${count} rows`);
  console.log(`  media files        ${files.size - missing.length} (${(bytes / 1048576).toFixed(1)} MB)`);
  if (operations) {
    console.log(`  enquiries go to    ${operations.enquiriesTo.join(", ")}`);
    console.log(`  applications go to ${operations.applicationsTo.join(", ")}`);
    console.log(`  retention          ${operations.retentionDays} days, CVs ${operations.cvExpiryDays} days`);
  }
  if (missing.length)
    console.log(`MISSING media files named by the database (${missing.length}): ${missing.slice(0, 5).join(", ")}`);
  if (warnings.length) {
    console.log(`Look at these before launch (${warnings.length}):`);
    for (const warning of warnings.slice(0, 20)) console.log(`  ${warning}`);
  }
  if (missing.length) process.exitCode = 1;
} finally {
  await closeDb();
}
