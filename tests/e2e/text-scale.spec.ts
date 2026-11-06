import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { PUBLIC_PERFORMANCE_ROUTES } from "@tests/support/performance-routes";

const RUN = crypto.randomUUID().slice(0, 8);
test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `scale-${RUN}-%`));
  await closeDb();
});

test("public pages and admin tasks remain usable with doubled text on a narrow phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "one enlarged-text reflow matrix");
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 900 });
  const email = `scale-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  const password = "a long text scale review password";
  await createAdmin({ email, name: "Scale reviewer", password });
  expect(
    (
      await page.request.post(ADMIN_API_ROUTES.adminSession, {
        data: { email, password },
        headers: { origin: E2E_ORIGIN },
      })
    ).ok(),
  ).toBe(true);
  const rows = [];
  for (const path of [
    ...PUBLIC_PERFORMANCE_ROUTES,
    ADMIN_ROUTES.login,
    ADMIN_ROUTES.overview,
    ADMIN_ROUTES.pages,
    ADMIN_ROUTES.page("HOME"),
    ADMIN_ROUTES.services,
    ADMIN_ROUTES.newService,
    ADMIN_ROUTES.newJob,
    ADMIN_ROUTES.newClient,
    ADMIN_ROUTES.fonts,
    ADMIN_ROUTES.settings,
    ADMIN_ROUTES.operations,
    ADMIN_ROUTES.media,
    ADMIN_ROUTES.profile,
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      offenders: [
        ...document.querySelectorAll<HTMLElement>("header, main input, main select, main textarea, main button"),
      ]
        .filter((el) => el.checkVisibility() && el.getBoundingClientRect().right > innerWidth + 1)
        .map((el) => ({ tag: el.tagName, classes: el.className, width: el.getBoundingClientRect().width })),
    }));
    rows.push({ path, ...result });
    if (result.overflow) await page.screenshot({ path: testInfo.outputPath(path.replaceAll("/", "-") + ".png") });
  }
  await writeFile(testInfo.outputPath("text-scale-layouts.json"), JSON.stringify(rows, null, 2));
  expect(rows.filter((row) => row.overflow > 0)).toEqual([]);
});
