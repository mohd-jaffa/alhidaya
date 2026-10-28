import { boolean, index, int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { TEXT_LIMITS } from "@/constants/limits";

import { id, idRef, instant, timestamps } from "./columns";

/**
 * Better Auth's four tables (plan D43, §26.4), field for field as its core
 * schema names them (the JS keys), in this database's own snake_case columns.
 * One admin account lives here (plan D14); public sign-up is disabled.
 */
export const authUser = mysqlTable("auth_user", {
  id: id(),
  name: varchar("name", { length: TEXT_LIMITS.name }).notNull(),
  email: varchar("email", { length: TEXT_LIMITS.email }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: varchar("image", { length: 500 }),
  ...timestamps,
});

export const authSession = mysqlTable(
  "auth_session",
  {
    id: id(),
    expiresAt: instant("expires_at").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 500 }),
    userId: idRef("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("auth_session_user_id_idx").on(table.userId)],
);

export const authAccount = mysqlTable(
  "auth_account",
  {
    id: id(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    userId: idRef("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: instant("access_token_expires_at"),
    refreshTokenExpiresAt: instant("refresh_token_expires_at"),
    scope: varchar("scope", { length: 255 }),
    // The password's scrypt hash, never the password (Better Auth).
    password: varchar("password", { length: 255 }),
    ...timestamps,
  },
  (table) => [index("auth_account_user_id_idx").on(table.userId)],
);

export const authVerification = mysqlTable(
  "auth_verification",
  {
    id: id(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: instant("expires_at").notNull(),
    ...timestamps,
  },
  (table) => [index("auth_verification_identifier_idx").on(table.identifier)],
);

/**
 * Failed sign-ins (plan §26.4): one row per keyed hash of an email or of an
 * IP, never the email or the IP itself (AGENTS.md §8). Five failures lock
 * that key for fifteen minutes (`SIGN_IN_LOCKOUT`).
 */
export const signInAttempts = mysqlTable("sign_in_attempts", {
  keyHash: varchar("key_hash", { length: 64 }).primaryKey(),
  failedCount: int("failed_count", { unsigned: true }).notNull().default(0),
  lockedUntil: instant("locked_until"),
  ...timestamps,
});
