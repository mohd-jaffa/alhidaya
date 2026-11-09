import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";

import { ADMIN_MANUAL, ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { E2E_ORIGIN } from "@tests/support/e2e-app";

const email = `manual-${crypto.randomUUID()}@example.com`;
const password = "a long manual training password";
test.afterAll(async () => {
  await getDb().delete(authUser).where(eq(authUser.email, email));
  await closeDb();
});

test("manual lessons are private, playable, categorized and accessible", async ({ page }, testInfo) => {
  const asset = ADMIN_API_ROUTES.adminManualAsset("02-sign-in.mp4");
  expect((await page.request.get(asset)).status()).toBe(401);
  await page.goto(ADMIN_ROUTES.userManual);
  await expect(page).toHaveURL(/\/admin\/login/);
  await createAdmin({ email, name: "Training Admin", password });
  expect(
    (
      await page.request.post(ADMIN_API_ROUTES.adminSession, {
        data: { email, password },
        headers: { origin: E2E_ORIGIN },
      })
    ).ok(),
  ).toBe(true);
  await page.goto(ADMIN_ROUTES.overview);
  if (testInfo.project.name === "phone") await page.getByRole("button", { name: ADMIN_TEXT.menu, exact: true }).click();
  await page.getByRole("link", { name: ADMIN_TEXT.userManual, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.userManual })).toBeVisible();
  const video = page.locator("video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
  expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeGreaterThan(15);
  await video.evaluate((v: HTMLVideoElement) => {
    v.muted = true;
    return v.play();
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.1);
  await video.evaluate((v: HTMLVideoElement) => v.pause());
  const partial = await page.request.get(asset, { headers: { range: "bytes=0-99" } });
  expect(partial.status()).toBe(206);
  expect((await partial.body()).length).toBe(100);
  for (const category of ADMIN_MANUAL) {
    await page
      .getByRole("navigation", { name: ADMIN_TEXT.manualTopics })
      .getByRole("button", { name: category.title, exact: true })
      .click();
    await expect(page.getByRole("group", { name: ADMIN_TEXT.manualLessons }).getByRole("button")).toHaveCount(
      category.lessons.length,
    );
  }
  await page
    .getByRole("navigation", { name: ADMIN_TEXT.manualTopics })
    .getByRole("button", { name: "Pages and publishing", exact: true })
    .click();
  await page.getByRole("group", { name: ADMIN_TEXT.manualLessons }).getByRole("button").last().click();
  await expect(
    page.getByText("If a cleared optional field still shows old text, reload the editor to see its restored value."),
  ).toBeVisible();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await video.evaluate((v: HTMLVideoElement) => {
    v.muted = true;
    return v.play();
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.1);
  await video.evaluate((v: HTMLVideoElement) => v.pause());
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: testInfo.outputPath("user-manual.png"), fullPage: true });
});
