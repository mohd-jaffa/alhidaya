import { eq, inArray, or } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { SIGN_IN_FAILURE_MIN_MS } from "@/constants/limits";
import { closeDb, getDb } from "@/db/client";
import { auditLog, authUser, authVerification, rateLimits, signInAttempts } from "@/db/schema";
import { requestPasswordReset, resetPassword, signIn, signOut } from "@/features/auth/api";
import { createAdmin } from "@/features/auth/createAdmin";
import { clearFailures, isLocked, lockoutKeys, recordFailure } from "@/features/auth/lockout";
import { getAuth } from "@/lib/auth/auth";
import { keyedHash } from "@/lib/auth/hash";
import { getAdminSession } from "@/lib/auth/session";
import { deleteMail, mailText, searchMail, waitForMail } from "@tests/support/mailpit";

/**
 * The admin's sign-in end to end (plan §26.4), against the local MySQL and
 * Mailpit: Better Auth on the site's own tables, the lockout, the reset link.
 */
const RUN = crypto.randomUUID().slice(0, 8);
const EMAIL = `admin-${RUN}@example.com`;
const PASSWORD = "correct horse battery staple";
const NEW_PASSWORD = "a different long passphrase";
const ips: string[] = [];
const ip = () => {
  const address = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${ips.length + 1}`;
  ips.push(address);
  return address;
};
const asker = (address: string) => ({ ip: address, userAgent: "Integration", requestId: `req_auth_${RUN}` });
const cookieOf = (headers: Headers) => headers.getSetCookie()[0].split(";")[0];
let adminId = "";

beforeAll(async () => {
  adminId = (await createAdmin({ email: EMAIL, name: "Integration Admin", password: PASSWORD })).id;
});

afterAll(async () => {
  const db = getDb();
  const keys = ips
    .flatMap((address) => lockoutKeys(EMAIL, address))
    .concat(ips.flatMap((address) => lockoutKeys(`nobody-${RUN}@example.com`, address)));
  await db.delete(signInAttempts).where(inArray(signInAttempts.keyHash, keys));
  const resetKeys = ips.map((address) => keyedHash("reset:ip", address)).concat([keyedHash("reset:email", EMAIL)]);
  await db.delete(rateLimits).where(inArray(rateLimits.keyHash, resetKeys));
  await db.delete(authVerification).where(eq(authVerification.value, adminId));
  await db.delete(auditLog).where(or(eq(auditLog.requestId, `req_auth_${RUN}`), eq(auditLog.entityId, adminId)));
  await db.delete(authUser).where(eq(authUser.email, EMAIL));
  await deleteMail((await searchMail(`to:"${EMAIL}"`)).map((message) => message.ID));
  await closeDb();
});

describe("creating the admin", () => {
  it("refuses a second account for the same email, and a password out of bounds", async () => {
    await expect(createAdmin({ email: EMAIL.toUpperCase(), name: "Again", password: PASSWORD })).rejects.toMatchObject({
      code: "CONFLICT",
    });
    await expect(createAdmin({ email: `x-${RUN}@example.com`, name: "X", password: "short" })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    await expect(
      createAdmin({ email: `x-${RUN}@example.com`, name: "X", password: "x".repeat(129) }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});

describe("signing in and out", () => {
  it("signs in with an HttpOnly session cookie the database recognises, and records it", async () => {
    const headers = await signIn({ email: EMAIL, password: PASSWORD }, asker(ip()));
    expect(headers.getSetCookie()[0]).toMatch(/^alhidaya\.session_token=.+HttpOnly.*SameSite=Lax/i);
    expect(await getAdminSession(new Headers({ cookie: cookieOf(headers) }))).toEqual({
      adminId,
      email: EMAIL,
      name: "Integration Admin",
    });
    const [row] = await getDb().select().from(auditLog).where(eq(auditLog.entityId, adminId));
    expect(row.action).toBe("SIGN_IN");
  });

  it("refuses a wrong password and an unknown email alike, never quickly", async () => {
    const address = ip();
    for (const email of [EMAIL, `nobody-${RUN}@example.com`]) {
      const started = Date.now();
      await expect(signIn({ email, password: "wrong wrong wrong" }, asker(address))).rejects.toMatchObject({
        code: "AUTH_INVALID_CREDENTIALS",
      });
      expect(Date.now() - started).toBeGreaterThanOrEqual(SIGN_IN_FAILURE_MIN_MS - 5);
    }
  });

  it("signs out: the session is gone", async () => {
    const cookie = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }, asker(ip())));
    const cleared = await signOut(new Headers({ cookie }), adminId, `req_auth_${RUN}`);
    expect(cleared.getSetCookie()[0]).toMatch(/Max-Age=0/);
    expect(await getAdminSession(new Headers({ cookie }))).toBeNull();
  });
});

describe("the lockout", () => {
  it("locks the email after five failures, even against the right password", async () => {
    const first = ip();
    await clearFailures(lockoutKeys(EMAIL, first));
    for (let attempt = 1; attempt <= 4; attempt++) {
      await expect(signIn({ email: EMAIL, password: "wrong wrong wrong" }, asker(first))).rejects.toMatchObject({
        code: "AUTH_INVALID_CREDENTIALS",
      });
    }
    await expect(signIn({ email: EMAIL, password: "wrong wrong wrong" }, asker(first))).rejects.toMatchObject({
      code: "AUTH_LOCKED",
    });
    await expect(signIn({ email: EMAIL, password: PASSWORD }, asker(first))).rejects.toMatchObject({
      code: "AUTH_LOCKED",
    });
    await expect(signIn({ email: EMAIL, password: PASSWORD }, asker(ip()))).rejects.toMatchObject({
      code: "AUTH_LOCKED",
    });
    await clearFailures(lockoutKeys(EMAIL, first));
  }, 20_000);

  it("lets a lock lapse after fifteen minutes and starts the count again", async () => {
    const keys = lockoutKeys(EMAIL, ip());
    const at = new Date();
    for (let attempt = 0; attempt < 5; attempt++) await recordFailure(keys, at);
    expect(await isLocked(keys, at)).toBe(true);
    const later = new Date(at.getTime() + 16 * 60 * 1000);
    expect(await isLocked(keys, later)).toBe(false);
    expect(await recordFailure(keys, later)).toBe(false);
    const [row] = await getDb().select().from(signInAttempts).where(eq(signInAttempts.keyHash, keys[0]));
    expect(row).toMatchObject({ failedCount: 1, lockedUntil: null });
    expect(await isLocked(keys)).toBe(false);
    await clearFailures(keys);
  });
});

describe("resetting the password", () => {
  it("mails a one-time link that sets a new password and ends every session", async () => {
    const before = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }, asker(ip())));
    await requestPasswordReset(EMAIL, asker(ip()));
    const [mail] = await waitForMail(`to:"${EMAIL}"`);
    const token =
      new URL((await mailText(mail.ID)).match(/https?:\/\/\S+reset-password\S+/)?.[0] ?? "").searchParams.get(
        "token",
      ) ?? "";
    expect(token).not.toBe("");

    await resetPassword(token, NEW_PASSWORD, `req_auth_${RUN}`);
    expect(await getAdminSession(new Headers({ cookie: before }))).toBeNull();
    await expect(signIn({ email: EMAIL, password: PASSWORD }, asker(ip()))).rejects.toMatchObject({
      code: "AUTH_INVALID_CREDENTIALS",
    });
    expect(cookieOf(await signIn({ email: EMAIL, password: NEW_PASSWORD }, asker(ip())))).toMatch(
      /^alhidaya\.session_token=/,
    );
    await expect(resetPassword(token, PASSWORD, `req_auth_${RUN}`)).rejects.toMatchObject({
      code: "AUTH_RESET_INVALID",
    });
  }, 20_000);

  it("answers an unknown email the same, and sends nothing", async () => {
    await expect(requestPasswordReset(`nobody-${RUN}@example.com`, asker(ip()))).resolves.toBeUndefined();
    expect(await searchMail(`to:"nobody-${RUN}@example.com"`)).toEqual([]);
  });

  it("stops mailing an email asked for too often, and refuses an IP asking too often", async () => {
    const sent = (await searchMail(`to:"${EMAIL}"`)).length;
    for (let request = 0; request < 3; request++) await requestPasswordReset(EMAIL, asker(ip()));
    expect((await waitForMail(`to:"${EMAIL}"`, sent + 2)).length).toBe(sent + 2);

    const busy = ip();
    for (let request = 0; request < 10; request++) await requestPasswordReset(`nobody-${RUN}@example.com`, asker(busy));
    await expect(requestPasswordReset(`nobody-${RUN}@example.com`, asker(busy))).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });
  }, 20_000);
});

describe("the admin's authentication itself", () => {
  it("is made once per database pool, and again on a pool opened after the last was closed", async () => {
    const first = getAuth();
    expect(getAuth()).toBe(first);
    await closeDb();
    const second = getAuth();
    expect(second).not.toBe(first);
    expect(await (await second.$context).internalAdapter.findUserByEmail(EMAIL)).toMatchObject({
      user: { email: EMAIL },
    });
  });
});
