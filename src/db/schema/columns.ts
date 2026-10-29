import { sql } from "drizzle-orm";
import { datetime, varchar } from "drizzle-orm/mysql-core";

/**
 * The columns every table shares (plan §27). Ids are random UUIDs, so no id
 * in an admin URL can be guessed from another; instants are `datetime(3)`
 * in UTC, set by the app (the pool pins each connection's time zone to UTC
 * too: src/db/client.ts).
 */

/** A new row's id. */
export function newId(): string {
  return crypto.randomUUID();
}

/** Now, for a row's timestamps. */
export function now(): Date {
  return new Date();
}

export const id = () => varchar("id", { length: 36 }).primaryKey().$defaultFn(newId);

/** A reference to another table's id. */
export const idRef = (name: string) => varchar(name, { length: 36 });

export const instant = (name: string) => datetime(name, { mode: "date", fsp: 3 });

export const timestamps = {
  createdAt: instant("created_at").notNull().$defaultFn(now),
  updatedAt: instant("updated_at").notNull().$defaultFn(now).$onUpdate(now),
};

/** A column's allowed values, written into its CHECK from the constant that owns them. */
export const oneOf = (column: string, values: readonly string[]) =>
  sql.raw(`\`${column}\` in (${values.map((value) => `'${value}'`).join(", ")})`);

/** A new row's empty list. */
export function emptyList(): string[] {
  return [];
}
