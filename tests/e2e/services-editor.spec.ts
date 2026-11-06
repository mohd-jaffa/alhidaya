import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser, records } from "@/db/schema";
import { SEED_SERVICES } from "@/db/seed/content";
import { createAdmin } from "@/features/auth/createAdmin";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The Services editor through the built app (R6.4, D92): the services in
 * their order and a service's editor, axe at both widths; and, once, a new
 * service made, previewed, published, seen by a visitor and archived, and a
 * new order that waits until it is published, then thrown away.
 */
const PASSWORD = "a long services password";
const RUN = crypto.randomUUID().slice(0, 8);
const made: string[] = [];

test.afterAll(async () => {
  for (const id of made) await getDb().delete(records).where(eq(records.id, id));
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `services-${RUN}-%`));
  await closeDb();
});

async function signIn(page: Page) {
  const email = `services-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
const first = SEED_SERVICES[0].name.en;
const firstService = (page: Page) => page.getByRole("main").getByRole("listitem").first();
const second = SEED_SERVICES[1].name.en;

test("Services lists the services in their order, and a service's editor and a new one pass axe", async ({ page }) => {
  await signIn(page);
  await page.goto(ADMIN_ROUTES.services);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.services })).toBeVisible();
  await expect(firstService(page)).toContainText(first);
  await axe(page);

  await page.getByRole("link", { name: new RegExp(first) }).click();
  await expect(page.getByRole("heading", { level: 1, name: first })).toBeVisible();
  await expect(page.getByRole("textbox", { name: ADMIN_TEXT.serviceName })).toHaveValue(first);
  await axe(page);

  await page.goto(ADMIN_ROUTES.newService);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.newService })).toBeVisible();
  await axe(page);
});

test("a new service is made, previewed, published, seen by a visitor, and archived (D92)", async ({
  page,
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one service made once is enough");
  const name = `Respite care ${RUN}`;
  const slug = `respite-care-${RUN}`;
  await signIn(page);
  const visitor = await browser.newPage();
  try {
    await page.goto(ADMIN_ROUTES.newService);
    await page.getByRole("textbox", { name: ADMIN_TEXT.serviceName }).fill(name);
    await expect(page.getByRole("textbox", { name: ADMIN_TEXT.webAddress })).toHaveValue(slug);
    await page
      .getByRole("textbox", { name: ADMIN_TEXT.summary })
      .fill("Short stays of care at home, so families can rest.");
    await page
      .getByRole("textbox", { name: "Paragraph 1" })
      .fill("A nurse takes over at home for a few hours or days.");
    const buttons = page.getByRole("region", { name: ADMIN_TEXT.serviceButtons });
    await buttons.getByRole("button", { name: ADMIN_TEXT.addServiceButton }).click();
    await buttons.getByRole("button", { name: ADMIN_TEXT.addServiceButton }).click();
    const primary = buttons.getByRole("group", { name: "Header button 1" });
    const secondary = buttons.getByRole("group", { name: "Header button 2" });
    await primary.getByRole("textbox", { name: ADMIN_TEXT.buttonLabel }).fill("Ask about this service");
    await primary.getByRole("textbox", { name: ADMIN_TEXT.buttonLink }).fill("/contact");
    await secondary.getByRole("textbox", { name: ADMIN_TEXT.buttonLabel }).fill("Message care team");
    await secondary.getByRole("textbox", { name: ADMIN_TEXT.buttonLink }).fill("https://wa.me/97431306555");
    const bar = page.locator("form").filter({ has: page.getByRole("heading", { level: 1 }) });
    await bar.getByRole("button", { name: ADMIN_TEXT.saveDraft }).click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/services\/[0-9a-f-]{36}$/);
    made.push(page.url().split("/").at(-1)!);

    const [preview] = await Promise.all([
      page.waitForEvent("popup"),
      bar.getByRole("link", { name: ADMIN_TEXT.preview }).click(),
    ]);
    await expect(preview).toHaveURL(ROUTES.service(slug));
    await expect(preview.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(preview.locator("#start").getByRole("link", { name: "Ask about this service" })).toHaveAttribute(
      "href",
      "/contact",
    );
    await expect(preview.getByRole("status").filter({ hasText: UI_TEXT.previewBar })).toBeVisible();
    await preview.close();
    expect((await visitor.goto(ROUTES.service(slug)))?.status()).toBe(404);

    await bar.getByRole("button", { name: ADMIN_TEXT.publish }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.publishTitle(name) })
      .getByRole("button", { name: ADMIN_TEXT.publish })
      .click();
    await expect(page.getByText(ADMIN_TEXT.isPublished(name))).toBeVisible();
    expect((await visitor.goto(ROUTES.service(slug)))?.status()).toBe(200);
    await expect(visitor.getByRole("heading", { level: 1, name })).toBeVisible();

    await expect(visitor.locator("#start").getByRole("link", { name: "Ask about this service" })).toBeVisible();
    await primary.getByRole("textbox", { name: ADMIN_TEXT.buttonLabel }).fill("Draft header action");
    await bar.getByRole("button", { name: ADMIN_TEXT.saveDraft }).click();
    await visitor.reload();
    await expect(visitor.locator("#start").getByRole("link", { name: "Ask about this service" })).toBeVisible();
    await expect(visitor.getByRole("link", { name: "Draft header action" })).toHaveCount(0);
    await buttons.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Header button 2") }).click();
    await buttons.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Header button 1") }).click();
    await bar.getByRole("button", { name: ADMIN_TEXT.publish }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.publishTitle(name) })
      .getByRole("button", { name: ADMIN_TEXT.publish })
      .click();
    await expect(page.getByText(ADMIN_TEXT.isPublished(name))).toBeVisible();
    await visitor.reload();
    await expect(visitor.locator("#start").getByRole("link")).toHaveCount(0);

    const site = page.getByRole("region", { name: ADMIN_TEXT.onTheSite });
    await site.getByRole("button", { name: ADMIN_TEXT.archive }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.archiveTitle(name) })
      .getByRole("button", { name: ADMIN_TEXT.archive })
      .click();
    await expect(site.getByText(ADMIN_TEXT.isArchived)).toBeVisible();
    expect((await visitor.goto(ROUTES.service(slug)))?.status()).toBe(404);
  } finally {
    await visitor.close();
  }
});

test("moving a service saves a new order that waits to be published, and Discard puts it back (D92)", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the order is set once");
  await signIn(page);
  await page.goto(ADMIN_ROUTES.services);
  await page.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, first) }).click();
  const order = page.getByRole("region", { name: ADMIN_TEXT.order });
  await expect(order).toContainText(ADMIN_TEXT.orderWaiting);
  await expect(firstService(page)).toContainText(second);
  await page.reload();
  await expect(firstService(page)).toContainText(second);
  await axe(page);

  await order.getByRole("button", { name: ADMIN_TEXT.discardOrder }).click();
  await page
    .getByRole("dialog", { name: ADMIN_TEXT.discardOrderTitle })
    .getByRole("button", { name: ADMIN_TEXT.discardOrder })
    .click();
  await expect(order).toBeHidden();
  await expect(firstService(page)).toContainText(first);
});
