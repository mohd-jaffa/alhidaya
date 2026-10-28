import { int, mysqlTable, primaryKey, varchar } from "drizzle-orm/mysql-core";

import { instant, timestamps } from "./columns";

/**
 * Fixed-window counters for the rate limits (plan §10.3, §26.4): one row per
 * keyed hash and window, never the email or IP itself (AGENTS.md §8). Old
 * windows are removed by the daily job (R6.7).
 */
export const rateLimits = mysqlTable(
  "rate_limits",
  {
    keyHash: varchar("key_hash", { length: 64 }).notNull(),
    windowStart: instant("window_start").notNull(),
    count: int("count", { unsigned: true }).notNull().default(0),
    ...timestamps,
  },
  (table) => [primaryKey({ name: "rate_limits_pk", columns: [table.keyHash, table.windowStart] })],
);
