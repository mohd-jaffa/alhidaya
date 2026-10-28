import { loadEnv } from "vite";

/** A MySQL on this machine: the only database the integration tests and the journeys may touch. */
export const LOCAL_DATABASE = /^mysql:\/\/[^@/]+@(127\.0\.0\.1|localhost):\d+\/[A-Za-z0-9_]+$/;

/**
 * The integration project's global setup (plan §34, AGENTS.md §24): the tests
 * write and delete rows of their own, so they may run only against the local
 * MySQL in Docker. A server address, or none, stops the run before any test
 * starts.
 */
export default function refuseRemoteDatabase(): void {
  const env = { ...loadEnv("test", process.cwd(), ""), ...process.env };
  const url = env.TEST_DATABASE_URL ?? "";
  if (!LOCAL_DATABASE.test(url)) {
    throw new Error("Integration tests run only against the local MySQL (TEST_DATABASE_URL), never a server.");
  }
}
