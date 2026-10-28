import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

// Drizzle Kit reads no env file of its own; locally the migrator's address is
// in .env.local. In production the release workflow supplies it (plan §35.3).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

/**
 * The schema lives in src/db/schema; Drizzle Kit generates the SQL migrations
 * into drizzle/, which are reviewed, committed and never edited once released
 * (plan §28, AGENTS.md §13). Migrations run as the migrator (schema rights),
 * never as the app (plan §26.1).
 */
export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema",
  out: "./drizzle",
  dbCredentials: { url: process.env.MIGRATION_DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});
