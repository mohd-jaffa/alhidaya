import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES, CRON_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import type { OperationsViewItem } from "@/features/settings/types";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * Operations through the built app (R6.7, D95): the recipients, the keeping
 * periods, each folder's room and the last clean-up, axe at both widths; a
 * recipient saved and put back; a keeping period asked about first; and the
 * nightly clean-up, which runs only for the cron entry's secret.
 */
const PASSWORD = "a long operations password";
const RUN = crypto.randomUUID().slice(0, 8);

test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `operations-${RUN}-%`));
  await closeDb();
});

async function signIn(page: Page) {
  const email = `operations-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("Operations shows who is sent what, the keeping periods and each folder's room, and passes axe", async ({
  page,
}) => {
  await signIn(page);
  await page.goto(ADMIN_ROUTES.operations);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.operations })).toBeVisible();
  await expect(page.getByRole("group", { name: ADMIN_TEXT.enquiriesTo }).getByRole("textbox").first()).toHaveValue(/@/);
  await expect(page.getByRole("spinbutton", { name: ADMIN_TEXT.retentionDays })).toHaveValue(/^\d+$/);
  await expect(page.getByRole("meter", { name: ADMIN_TEXT.mediaFolder })).toBeVisible();
  await expect(page.getByRole("meter", { name: ADMIN_TEXT.cvFolder })).toBeVisible();
  const rail = page.getByRole("navigation", { name: ADMIN_TEXT.navigation }).first();
  if (await rail.isVisible()) {
    await expect(rail.getByRole("link", { name: ADMIN_TEXT.operations })).toHaveAttribute("aria-current", "page");
  }
  await axe(page);
});

test("a keeping period changes only once the admin says so", async ({ page }) => {
  await signIn(page);
  await page.goto(ADMIN_ROUTES.operations);
  const days = page.getByRole("spinbutton", { name: ADMIN_TEXT.retentionDays });
  const before = await days.inputValue();
  await days.fill(String(Number(before) + 1));
  await page.getByRole("button", { name: ADMIN_TEXT.saveOperations }).click();
  const asked = page.getByRole("dialog", { name: ADMIN_TEXT.keepingTitle });
  await expect(asked).toBeVisible();
  await axe(page);
  await asked.getByRole("button", { name: ADMIN_TEXT.keepEditing }).click();
  await expect(asked).toBeHidden();
  const stored = (await (await page.request.get(ADMIN_API_ROUTES.adminOperations)).json()) as {
    data: OperationsViewItem;
  };
  expect(String(stored.data.operations.retentionDays)).toBe(before);
});

test("a recipient added is saved at once, and stays after a reload", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the recipients are saved once");
  await signIn(page);
  const original = (
    (await (await page.request.get(ADMIN_API_ROUTES.adminOperations)).json()) as { data: OperationsViewItem }
  ).data.operations;
  const added = `care-${RUN}@alhidaya.qa`;
  try {
    await page.goto(ADMIN_ROUTES.operations);
    const enquiries = page.getByRole("group", { name: ADMIN_TEXT.enquiriesTo });
    await enquiries.getByRole("button", { name: ADMIN_TEXT.addRecipient }).click();
    await enquiries.getByRole("textbox").last().fill(added);
    await page.getByRole("button", { name: ADMIN_TEXT.saveOperations }).click();
    await expect(page.getByText(ADMIN_TEXT.operationsSaved)).toBeVisible();
    await page.reload();
    await expect(page.getByRole("group", { name: ADMIN_TEXT.enquiriesTo }).getByRole("textbox").last()).toHaveValue(
      added,
    );
  } finally {
    await page.request.put(ADMIN_API_ROUTES.adminOperations, { data: original, headers: { origin: E2E_ORIGIN } });
  }
});

test("the nightly clean-up runs only for the cron entry's secret, and Operations then says what it did", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the clean-up runs once");
  for (const authorization of [undefined, "Bearer not-the-cron-secret", `Basic ${process.env.CRON_SECRET}`]) {
    const refused = await page.request.post(CRON_ROUTES.retention, {
      headers: authorization ? { authorization } : {},
    });
    expect(refused.status()).toBe(401);
    expect(refused.headers()["cache-control"]).toContain("no-store");
    expect(await refused.json()).toMatchObject({
      success: false,
      error: { code: "AUTH_SESSION_REQUIRED", message: ERROR_MESSAGES.AUTH_SESSION_REQUIRED },
    });
  }

  const ran = await page.request.post(CRON_ROUTES.retention, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  expect(ran.status()).toBe(200);
  expect(ran.headers()["cache-control"]).toContain("no-store");
  const { data: done } = (await ran.json()) as { data: { enquiries: number; applications: number; cvs: number } };
  expect(done).toMatchObject({ filesNotDeleted: 0 });

  await signIn(page);
  await page.goto(ADMIN_ROUTES.operations);
  await expect(page.getByRole("region", { name: ADMIN_TEXT.lastPurge })).toContainText(
    ADMIN_TEXT.purgeDeleted(done.enquiries, done.applications, done.cvs),
  );
});
