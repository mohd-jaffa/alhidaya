import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { getServerEnv } from "@/lib/env/server";

import * as schema from "./schema";

export type Database = MySql2Database<typeof schema>;

/**
 * The connection pool, made on first use (a build imports this file and must
 * not connect). One per server process, and kept across hot reloads in
 * development. Small: shared hosting limits processes and MySQL connections
 * (plan §21.1).
 */
const cache = globalThis as unknown as { alhidayaPool?: mysql.Pool; alhidayaDb?: Database };

function createPool(url: string): mysql.Pool {
  const pool = mysql.createPool({
    uri: url,
    connectionLimit: 5,
    maxIdle: 5,
    idleTimeout: 60_000,
    enableKeepAlive: true,
    waitForConnections: true,
    // Dates leave and arrive as UTC, and each connection's own clock is UTC,
    // whatever the shared server's time zone (plan §27).
    timezone: "Z",
    charset: "utf8mb4",
  });
  pool.pool.on("connection", (connection) => {
    connection.query("SET time_zone = '+00:00'");
  });
  return pool;
}

export function getDb(): Database {
  if (!cache.alhidayaDb) {
    cache.alhidayaPool = createPool(getServerEnv().DATABASE_URL);
    cache.alhidayaDb = drizzle({ client: cache.alhidayaPool, schema, mode: "default" });
  }
  return cache.alhidayaDb;
}

/** Ends the pool: for scripts and tests that must exit. */
export async function closeDb(): Promise<void> {
  await cache.alhidayaPool?.end();
  cache.alhidayaPool = undefined;
  cache.alhidayaDb = undefined;
}
