import { like, or, type SQL } from "drizzle-orm";
import type { MySqlColumn } from "drizzle-orm/mysql-core";

/** What a search finds anywhere in the text: its `%`, `_` and `\\` mean themselves. */
export const containing = (text: string) => `%${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

/**
 * What the admin types in an inbox (plan §9.5, §10.5), matched against a
 * person's name, email and phone: a number is matched by its digits, however
 * it was typed ("5551 2345").
 */
export function matchingPerson(
  q: string,
  columns: { name: MySqlColumn; email: MySqlColumn; phone: MySqlColumn },
): SQL | undefined {
  const digits = q.replace(/\D/g, "");
  return or(
    like(columns.name, containing(q)),
    like(columns.email, containing(q)),
    digits.length >= 3 ? like(columns.phone, containing(digits)) : undefined,
  );
}
