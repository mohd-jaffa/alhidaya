import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES, CRON_ROUTES } from "@/constants/admin-routes";
import { closeDb, getDb } from "@/db/client";
import { authUser, enquiries } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { receiveEnquiry } from "@/features/enquiries/api";
import { enquirySchema } from "@/lib/validation";

import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { deleteMail, searchMail, waitForMail } from "@tests/support/mailpit";

/**
 * The mail-retry cron through the built app (R6.10, D85): an enquiry whose
 * alert did not go says so in the inbox, with the website still trying; the
 * cron, run only for its secret, sends it, and the inbox's warning is gone.
 */
const RUN = crypto.randomUUID().slice(0, 8);
const VISITOR = `Retry visitor ${RUN}`;
const ADMIN = `mail-retry-${RUN}@example.com`;
const PASSWORD = "a long mail retry password";

test.afterAll(async () => {
  await deleteMail((await searchMail(`subject:"${VISITOR}"`)).map((message) => message.ID));
  await getDb().delete(enquiries).where(eq(enquiries.name, VISITOR));
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `mail-retry-${RUN}%`));
  await closeDb();
});

test("an alert not sent waits in the inbox while the website tries again, and the cron sends it", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the alert is sent once");
  const id = await receiveEnquiry(
    enquirySchema.parse({
      form: "CONTACT",
      name: VISITOR,
      phone: "5551 2345",
      email: "retry-visitor@example.com",
      message: "A nurse at night?",
      consent: true,
      turnstileToken: "token-from-cloudflare",
    }),
    `mail-retry-${RUN}`,
  );
  await getDb().update(enquiries).set({ emailStatus: "NOT_SENT" }).where(eq(enquiries.id, id));

  await createAdmin({ email: ADMIN, name: "Fatima", password: PASSWORD });
  const signedIn = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email: ADMIN, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(signedIn.status()).toBe(200);
  await page.goto(ADMIN_ROUTES.enquiry(id));
  await expect(page.getByText(ADMIN_TEXT.alertNotSentBody)).toBeVisible();
  await expect(page.getByText(ADMIN_TEXT.emailRetrying(0))).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  for (const authorization of [undefined, "Bearer not-the-cron-secret"]) {
    const refused = await page.request.post(CRON_ROUTES.mailRetry, { headers: authorization ? { authorization } : {} });
    expect(refused.status()).toBe(401);
  }
  const ran = await page.request.post(CRON_ROUTES.mailRetry, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  expect(ran.status()).toBe(200);
  expect(ran.headers()["cache-control"]).toContain("no-store");
  const { data } = (await ran.json()) as { data: { enquiries: { tried: number; sent: number } } };
  expect(data.enquiries.sent).toBeGreaterThanOrEqual(1);

  await waitForMail(`subject:"${VISITOR}"`);
  const [row] = await getDb()
    .select({ status: enquiries.emailStatus, retries: enquiries.emailRetries })
    .from(enquiries)
    .where(eq(enquiries.id, id));
  expect(row).toEqual({ status: "SENT", retries: 1 });
  await page.reload();
  await expect(page.getByText(ADMIN_TEXT.alertNotSentBody)).toBeHidden();
});
