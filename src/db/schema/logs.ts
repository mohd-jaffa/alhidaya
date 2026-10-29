import { check, index, json, mysqlTable, smallint, text, varchar } from "drizzle-orm/mysql-core";

import { ERROR_LOG_LIMITS } from "@/constants/limits";
import { AUDIT_ACTIONS, ERROR_SOURCES } from "@/constants/statuses";

import { authUser } from "./auth";
import { id, idRef, instant, now, oneOf } from "./columns";

/**
 * The admin's changes (plan §36, AGENTS.md §11), kept a year. `changes` holds
 * values for what is not personal (a status, a title) and field names alone
 * for anything personal: an enquiry's or an application's details never
 * reach this table (AGENTS.md §8).
 */
export const auditLog = mysqlTable(
  "audit_log",
  {
    id: id(),
    // Kept when the admin account goes: the change still happened.
    actorId: idRef("actor_id").references(() => authUser.id, { onDelete: "set null" }),
    action: varchar("action", { length: 32 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }),
    changes: json("changes"),
    summary: varchar("summary", { length: 300 }),
    requestId: varchar("request_id", { length: 80 }),
    createdAt: instant("created_at").notNull().$defaultFn(now),
  },
  (table) => [
    check("audit_log_action_check", oneOf("action", AUDIT_ACTIONS)),
    index("audit_log_created_at_idx").on(table.createdAt),
    index("audit_log_entity_idx").on(table.entityType, table.entityId),
  ],
);

/**
 * The server's own failures (plan §36), kept a month, with no personal data:
 * the context is redacted before it is written.
 */
export const errorLog = mysqlTable(
  "error_log",
  {
    id: id(),
    source: varchar("source", { length: 16 }).notNull(),
    message: varchar("message", { length: ERROR_LOG_LIMITS.message }).notNull(),
    reference: varchar("reference", { length: 80 }),
    code: varchar("code", { length: 64 }),
    kind: varchar("kind", { length: 32 }),
    httpStatus: smallint("http_status", { unsigned: true }),
    method: varchar("method", { length: 10 }),
    path: varchar("path", { length: ERROR_LOG_LIMITS.path }),
    adminId: idRef("admin_id"),
    detail: varchar("detail", { length: ERROR_LOG_LIMITS.detail }),
    stack: text("stack"),
    context: json("context"),
    createdAt: instant("created_at").notNull().$defaultFn(now),
  },
  (table) => [
    check("error_log_source_check", oneOf("source", ERROR_SOURCES)),
    index("error_log_created_at_idx").on(table.createdAt),
  ],
);
