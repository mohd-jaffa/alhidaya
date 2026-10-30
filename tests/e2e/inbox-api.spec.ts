import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";
import { and, eq, like } from "drizzle-orm";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { closeDb, getDb } from "@/db/client";
import { applications, auditLog, authUser, enquiries } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { receiveApplication } from "@/features/careers/api";
import { submitEnquiry } from "@/features/enquiries/api";
import { applicationFormSchema } from "@/lib/validation";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The enquiries and applications inboxes through the built app (plan §10.5,
 * §9.5, R4.4, R5.3, R5.5): only with the admin's session, every answer
 * uncached; list and find, open, move along, note, download a CV (recorded)
 * and delete (D82).
 */
const EMAIL = `inbox-${crypto.randomUUID()}@example.com`;
const PASSWORD = "a long inbox password";
const VISITOR = `inbox-visitor-${crypto.randomUUID()}@example.com`;

test.afterAll(async () => {
  await getDb().delete(enquiries).where(eq(enquiries.email, VISITOR));
  await getDb().delete(applications).where(eq(applications.email, VISITOR));
  await getDb().delete(authUser).where(like(authUser.email, "inbox-%@example.com"));
  await closeDb();
});

test("the admin lists, opens, moves along and notes an enquiry; nobody else can (plan §10.5)", async ({
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the inbox's API has no page to lay out");
  const id = await submitEnquiry(
    {
      form: "QUOTE",
      name: "Inbox Visitor",
      email: VISITOR,
      phone: "+97455512345",
      fields: [{ label: "Message", value: "Two nurses, please." }],
    },
    `inbox-${crypto.randomUUID()}`,
  );
  const headers = { origin: E2E_ORIGIN };

  // Without the session, nothing: not the list, not the enquiry.
  for (const path of [ADMIN_API_ROUTES.adminEnquiries, ADMIN_API_ROUTES.adminEnquiry(id)]) {
    const refused = await request.get(path);
    expect(refused.status()).toBe(401);
    expect(refused.headers()["cache-control"]).toContain("no-store");
  }

  await createAdmin({ email: EMAIL, name: "Inbox", password: PASSWORD });
  expect(
    (
      await request.post(ADMIN_API_ROUTES.adminSession, { data: { email: EMAIL, password: PASSWORD }, headers })
    ).status(),
  ).toBe(200);

  const list = await request.get(`${ADMIN_API_ROUTES.adminEnquiries}?form=QUOTE&q=${encodeURIComponent("5551 2345")}`);
  expect(list.headers()["cache-control"]).toContain("no-store");
  const { data } = (await list.json()) as { data: { items: { id: string }[] } };
  expect(data.items.map((item) => item.id)).toContain(id);

  expect(
    (await request.patch(ADMIN_API_ROUTES.adminEnquiry(id), { data: { status: "IN_PROGRESS" }, headers })).status(),
  ).toBe(200);
  expect(
    (await request.post(ADMIN_API_ROUTES.adminEnquiryNotes(id), { data: { body: "Called back." }, headers })).status(),
  ).toBe(201);
  const opened = (await (await request.get(ADMIN_API_ROUTES.adminEnquiry(id))).json()) as {
    data: { status: string; notes: { body: string; author: string }[] };
  };
  expect(opened.data.status).toBe("IN_PROGRESS");
  expect(opened.data.notes).toEqual([expect.objectContaining({ body: "Called back.", author: "Inbox" })]);

  // A write from another site is refused, session or not.
  expect(
    (
      await request.patch(ADMIN_API_ROUTES.adminEnquiry(id), {
        data: { status: "RESOLVED" },
        headers: { origin: "https://example.com" },
      })
    ).status(),
  ).toBe(403);
});

test("the admin lists, opens, notes, downloads the CV of and deletes an application; nobody else can (plan §9.4, §9.5, D82)", async ({
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the inbox's API has no page to lay out");
  const PDF = "%PDF-1.7 Inbox Visitor's CV";
  const { id } = await receiveApplication(
    applicationFormSchema.parse({
      name: "Inbox Visitor",
      email: VISITOR,
      phone: "5551 2345",
      whereNow: "IN_QATAR",
      mophLicence: "HAVE",
      dataflow: "DONE",
      prometric: "PASSED",
      experienceYears: "6",
      consent: true,
      turnstileToken: "token-from-cloudflare",
      cv: new File([PDF], "cv.pdf"),
    }),
    `inbox-${crypto.randomUUID()}`,
  );
  const [{ cvKey }] = await getDb()
    .select({ cvKey: applications.cvKey })
    .from(applications)
    .where(eq(applications.id, id));
  const headers = { origin: E2E_ORIGIN };

  // Without the session, nothing: not the list, not the application, not its CV.
  for (const route of [
    ADMIN_API_ROUTES.adminApplications,
    ADMIN_API_ROUTES.adminApplication(id),
    ADMIN_API_ROUTES.adminApplicationCv(id),
  ]) {
    const refused = await request.get(route);
    expect(refused.status(), route).toBe(401);
    expect(refused.headers()["cache-control"]).toContain("no-store");
  }

  const email = `inbox-${crypto.randomUUID()}@example.com`;
  await createAdmin({ email, name: "Inbox", password: PASSWORD });
  expect(
    (await request.post(ADMIN_API_ROUTES.adminSession, { data: { email, password: PASSWORD }, headers })).status(),
  ).toBe(200);

  const list = await request.get(
    `${ADMIN_API_ROUTES.adminApplications}?job=general&q=${encodeURIComponent("5551 2345")}`,
  );
  const { data } = (await list.json()) as { data: { items: { id: string }[] } };
  expect(data.items.map((item) => item.id)).toContain(id);

  expect(
    (await request.patch(ADMIN_API_ROUTES.adminApplication(id), { data: { status: "SHORTLISTED" }, headers })).status(),
  ).toBe(200);
  expect(
    (
      await request.post(ADMIN_API_ROUTES.adminApplicationNotes(id), { data: { body: "Call on Sunday." }, headers })
    ).status(),
  ).toBe(201);
  const opened = (await (await request.get(ADMIN_API_ROUTES.adminApplication(id))).json()) as {
    data: { status: string; cvStatus: string; notes: { body: string }[] };
  };
  expect(opened.data).toMatchObject({ status: "SHORTLISTED", cvStatus: "STORED" });
  expect(opened.data.notes).toEqual([expect.objectContaining({ body: "Call on Sunday." })]);

  // The CV, as a file to save, recorded.
  const cv = await request.get(ADMIN_API_ROUTES.adminApplicationCv(id));
  expect(cv.status()).toBe(200);
  expect(cv.headers()).toMatchObject({
    "content-type": "application/pdf",
    "content-disposition": `attachment; filename="${cvKey!.split("/")[1]}"`,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  expect(await cv.text()).toBe(PDF);
  const downloads = await getDb()
    .select({ id: auditLog.id })
    .from(auditLog)
    .where(and(eq(auditLog.entityId, id), eq(auditLog.action, "CV_DOWNLOAD")));
  expect(downloads).toHaveLength(1);

  // Deleted from another site: refused. By the admin: gone, its CV file with it.
  expect(
    (
      await request.delete(ADMIN_API_ROUTES.adminApplication(id), { headers: { origin: "https://example.com" } })
    ).status(),
  ).toBe(403);
  expect((await request.delete(ADMIN_API_ROUTES.adminApplication(id), { headers })).status()).toBe(200);
  expect((await request.get(ADMIN_API_ROUTES.adminApplication(id))).status()).toBe(404);
  await expect(fs.stat(path.join(process.env.CV_DIR!, cvKey!))).rejects.toThrow();
});
