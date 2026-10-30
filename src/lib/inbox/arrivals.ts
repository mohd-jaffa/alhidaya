import { count, desc, eq, or, type SQL, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/mysql-core";
import type { MySqlColumn } from "drizzle-orm/mysql-core";

import { INBOX_PAGE_SIZE } from "@/constants/limits";
import { getDb } from "@/db/client";
import { applications, enquiries } from "@/db/schema";

/**
 * What needs the admin in an inbox (Today, R6.1, plan §16): an arrival still
 * new, or one whose email to the team did not go.
 */
export const needsAttention = (table: { status: MySqlColumn; emailStatus: MySqlColumn }): SQL =>
  or(eq(table.status, "NEW"), eq(table.emailStatus, "NOT_SENT"))!;

export type ArrivalKind = "enquiry" | "application";

/** Each kind's rows by their ids, as its own inbox shows them: a feature's, handed in so lib needs none. */
export interface ArrivalSources<E, A> {
  enquiry: (ids: string[]) => Promise<E[]>;
  application: (ids: string[]) => Promise<A[]>;
}

export type Arrival<E, A> = ({ kind: "enquiry" } & E) | ({ kind: "application" } & A);

/**
 * Today (D81, plan §16): enquiries and applications as one stream, newest
 * first, what needs the admin or everything, a page at a time. The page's
 * ids and kinds come in one read with how many there are; then each kind's
 * rows, together: two round trips.
 */
export async function listArrivals<E extends { id: string }, A extends { id: string }>(
  query: { needsYou: boolean; page: number },
  sources: ArrivalSources<E, A>,
): Promise<{ items: Arrival<E, A>[]; total: number; page: number; pageSize: number }> {
  const db = getDb();
  const where = (table: typeof enquiries | typeof applications) => (query.needsYou ? needsAttention(table) : undefined);
  const of = (table: typeof enquiries | typeof applications, kind: ArrivalKind) =>
    db
      .select({ kind: sql<ArrivalKind>`${kind}`.as("kind"), id: table.id, createdAt: table.createdAt })
      .from(table)
      .where(where(table));

  const [page, [{ enquiryCount }], [{ applicationCount }]] = await Promise.all([
    unionAll(of(enquiries, "enquiry"), of(applications, "application"))
      .orderBy(desc(sql`created_at`), desc(sql`id`))
      .limit(INBOX_PAGE_SIZE)
      .offset((query.page - 1) * INBOX_PAGE_SIZE),
    db.select({ enquiryCount: count() }).from(enquiries).where(where(enquiries)),
    db.select({ applicationCount: count() }).from(applications).where(where(applications)),
  ]);

  const ids = (kind: ArrivalKind) => page.filter((row) => row.kind === kind).map((row) => row.id);
  const [enquiryRows, applicationRows] = await Promise.all([
    ids("enquiry").length > 0 ? sources.enquiry(ids("enquiry")) : [],
    ids("application").length > 0 ? sources.application(ids("application")) : [],
  ]);
  const found = new Map<string, Arrival<E, A>>([
    ...enquiryRows.map((row) => [row.id, { kind: "enquiry" as const, ...row }] as const),
    ...applicationRows.map((row) => [row.id, { kind: "application" as const, ...row }] as const),
  ]);
  return {
    // One deleted between the two reads is left out.
    items: page.flatMap((row) => found.get(row.id) ?? []),
    total: enquiryCount + applicationCount,
    page: query.page,
    pageSize: INBOX_PAGE_SIZE,
  };
}
