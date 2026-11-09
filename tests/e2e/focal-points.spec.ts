import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser, records } from "@/db/schema";
import { SEED_PHOTOS } from "@/db/seed/photos";
import { createAdmin } from "@/features/auth/createAdmin";
import { readDocumentDraft } from "@/lib/content/documents";
import type { PageDocument } from "@/lib/validation";
import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { serviceFixture } from "@tests/support/fixtures/content";

const headers = { origin: E2E_ORIGIN };
const email = `focal-${crypto.randomUUID()}@example.com`;
const password = "a long focal testing password";
test.use({ hasTouch: true });

test.beforeAll(async () => {
  await createAdmin({ email, name: "Training Admin", password });
});
test.afterAll(async () => {
  await getDb().delete(authUser).where(eq(authUser.email, email));
  await closeDb();
});

test("placement framing is keyboard/touch usable, previewed privately and published without changing another use", async ({
  page,
  browser,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect((await page.request.post(ADMIN_API_ROUTES.adminSession, { data: { email, password }, headers })).ok()).toBe(
    true,
  );
  const library = (await (await page.request.get(ADMIN_API_ROUTES.adminMedia)).json()).data;
  const mediaId = library.find((image: { alt: string }) => image.alt === SEED_PHOTOS.careAtHome.alt).id as string;
  const slug = `focal-${crypto.randomUUID().slice(0, 8)}`;
  const doc = serviceFixture({ slug, name: { en: "Focal test care" }, image: { mediaId } });
  const created = await page.request.post(ADMIN_API_ROUTES.adminServices, { data: doc, headers });
  expect(created.status()).toBe(201);
  const id = (await created.json()).data.id as string;
  const original = (await readDocumentDraft<PageDocument>("PAGE:ABOUT"))!.draft;
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const visitor = await context.newPage();
  const endpoint = ADMIN_API_ROUTES.adminService(id);
  try {
    expect((await page.request.post(ADMIN_API_ROUTES.adminServicePublish(id), { headers })).ok()).toBe(true);
    // The same source is independently framed in About's existing opening.
    const about = structuredClone(original);
    const sign = about.sections.find((section) => section.type === "SIGN")!;
    sign.content.image = { mediaId, focalPoint: { x: 80, y: 20 } };
    expect((await page.request.put(ADMIN_API_ROUTES.adminPage("ABOUT"), { data: about, headers })).ok()).toBe(true);
    expect((await page.request.post(ADMIN_API_ROUTES.adminPagePublish("ABOUT"), { headers })).ok()).toBe(true);
    await visitor.goto(ROUTES.service(slug));
    expect(await visitor.locator(".service-opening img").getAttribute("style")).toBeNull();
    await page.goto(ADMIN_ROUTES.service(id));
    await page.getByText(ADMIN_TEXT.framing, { exact: true }).click();
    const x = page.getByRole("slider", { name: new RegExp(ADMIN_TEXT.focalHorizontal) });
    const y = page.getByRole("slider", { name: new RegExp(ADMIN_TEXT.focalVertical) });
    await x.press("Home");
    await y.press("End");
    await expect(x).toHaveValue("0");
    await expect(y).toHaveValue("100");
    const target = page.getByRole("button", { name: ADMIN_TEXT.focalChoose });
    const box = (await target.boundingBox())!;
    const point = { position: { x: box.width * 0.35, y: box.height * 0.4 } };
    if (info.project.name === "phone") await target.tap(point);
    else await target.click(point);
    await expect(x).toHaveValue("35");
    await expect(y).toHaveValue("40");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const framing = page.locator("details").filter({ hasText: ADMIN_TEXT.framing });
    // Capture the entire control without the sticky editor toolbar crossing a tall element screenshot.
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 1600 });
    await framing.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await framing.screenshot({ path: info.outputPath("focal-point.png") });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
        .toBeLessThanOrEqual(1);
    }
    await page.setViewportSize(info.project.use.viewport!);
    const [preview] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("link", { name: ADMIN_TEXT.preview, exact: true }).click(),
    ]);
    await expect(preview.locator(".service-opening img")).toHaveCSS("object-position", "35% 40%");
    await visitor.reload();
    expect(await visitor.locator(".service-opening img").getAttribute("style")).toBeNull();
    await preview.close();
    await page.getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
    await expect(page.getByText(ADMIN_TEXT.isPublished("Focal test care"))).toBeVisible();
    await visitor.reload();
    await expect(visitor.locator(".service-opening img")).toHaveCSS("object-position", "35% 40%");
    for (const width of [320, 390, 768, 1440]) {
      await visitor.setViewportSize({ width, height: 900 });
      await expect(visitor.locator(".service-opening img")).toHaveCSS("object-position", "35% 40%");
      expect(await visitor.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
    await visitor.goto(ROUTES.home);
    await expect(visitor.locator(`.pyramid-track a[href="${ROUTES.service(slug)}"] img`)).toHaveCSS(
      "object-position",
      "35% 40%",
    );
    await visitor.goto(ROUTES.about);
    await expect(visitor.locator(".opening-blend img").first()).toHaveCSS("object-position", "80% 20%");
    await visitor.goto(ROUTES.services);
    await expect(visitor.getByRole("link", { name: /Focal test care/ }).locator("img")).toHaveCSS(
      "object-position",
      "35% 40%",
    );
    await x.press("End");
    await page.getByRole("button", { name: ADMIN_TEXT.saveDraft, exact: true }).click();
    await expect(page.getByText(ADMIN_TEXT.changesNotPublished, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: ADMIN_TEXT.discardDraft, exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: ADMIN_TEXT.discard, exact: true }).click();
    await expect(x).toHaveValue("35");
    const invalid = await page.request.put(endpoint, {
      data: { ...doc, image: { mediaId, focalPoint: { x: -1, y: 50 } } },
      headers,
    });
    expect(invalid.status()).toBe(400);
    expect((await visitor.request.put(endpoint, { data: doc, headers })).status()).toBe(401);
    // Enlarged-text editing remains contained too.
    await page.setViewportSize({ width: 320, height: 844 });
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
  } finally {
    await page.request.put(ADMIN_API_ROUTES.adminPage("ABOUT"), { data: original, headers });
    await page.request.post(ADMIN_API_ROUTES.adminPagePublish("ABOUT"), { headers });
    await page.request.post(ADMIN_API_ROUTES.adminServiceArchive(id), { data: { archived: true }, headers });
    await getDb().delete(records).where(eq(records.id, id));
    await context.close();
  }
});
