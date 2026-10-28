import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { loadEnv } from "vite";

/** A MySQL on this machine: the only database the integration tests and the journeys may touch. */
export const LOCAL_DATABASE = /^mysql:\/\/[^@/]+@(127\.0\.0\.1|localhost):\d+\/[A-Za-z0-9_]+$/;

/**
 * The integration project's global setup (plan §34, AGENTS.md §24): the tests
 * write and delete rows of their own, so they may run only against the local
 * MySQL in Docker. A server address, or none, stops the run before any test
 * starts. Then every migration is applied to the test database, as the
 * migrator: the app's own user has no schema rights (plan §26.1).
 */
export default async function prepareLocalDatabase(): Promise<void> {
  const env = { ...loadEnv("test", process.cwd(), ""), ...process.env };
  const app = env.TEST_DATABASE_URL ?? "";
  const migrator = env.TEST_MIGRATION_DATABASE_URL ?? "";
  if (!LOCAL_DATABASE.test(app) || !LOCAL_DATABASE.test(migrator)) {
    throw new Error("Integration tests run only against the local MySQL (TEST_DATABASE_URL), never a server.");
  }

  const connection = await mysql.createConnection(migrator);
  try {
    await migrate(drizzle({ client: connection }), { migrationsFolder: "drizzle" });
  } finally {
    await connection.end();
  }
}
