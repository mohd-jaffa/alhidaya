import { expect, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { API_ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser, enquiries } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { submitEnquiry } from "@/features/enquiries/api";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The enquiries inbox through the built app (plan §10.5, R4.4): only with
 * the admin's session, every answer uncached; list and find, open, move
 * along, note and retry. Its screens come with the admin (R6.2, D80).
 */
const EMAIL = `inbox-${crypto.randomUUID()}@example.com`;
const PASSWORD = "a long inbox password";
const VISITOR = `inbox-visitor-${crypto.randomUUID()}@example.com`;

test.afterAll(async () => {
  await getDb().delete(enquiries).where(eq(enquiries.email, VISITOR));
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
  for (const path of [API_ROUTES.adminEnquiries, API_ROUTES.adminEnquiry(id)]) {
    const refused = await request.get(path);
    expect(refused.status()).toBe(401);
    expect(refused.headers()["cache-control"]).toContain("no-store");
  }

  await createAdmin({ email: EMAIL, name: "Inbox", password: PASSWORD });
  expect(
    (await request.post(API_ROUTES.adminSession, { data: { email: EMAIL, password: PASSWORD }, headers })).status(),
  ).toBe(200);

  const list = await request.get(`${API_ROUTES.adminEnquiries}?form=QUOTE&q=${encodeURIComponent("5551 2345")}`);
  expect(list.headers()["cache-control"]).toContain("no-store");
  const { data } = (await list.json()) as { data: { items: { id: string }[] } };
  expect(data.items.map((item) => item.id)).toContain(id);

  expect(
    (await request.patch(API_ROUTES.adminEnquiry(id), { data: { status: "IN_PROGRESS" }, headers })).status(),
  ).toBe(200);
  expect(
    (await request.post(API_ROUTES.adminEnquiryNotes(id), { data: { body: "Called back." }, headers })).status(),
  ).toBe(201);
  const opened = (await (await request.get(API_ROUTES.adminEnquiry(id))).json()) as {
    data: { status: string; notes: { body: string; author: string }[] };
  };
  expect(opened.data.status).toBe("IN_PROGRESS");
  expect(opened.data.notes).toEqual([expect.objectContaining({ body: "Called back.", author: "Inbox" })]);

  // A write from another site is refused, session or not.
  expect(
    (
      await request.patch(API_ROUTES.adminEnquiry(id), {
        data: { status: "RESOLVED" },
        headers: { origin: "https://example.com" },
      })
    ).status(),
  ).toBe(403);
});
