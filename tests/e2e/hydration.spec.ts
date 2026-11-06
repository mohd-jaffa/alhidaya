import { writeFile } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_PUBLIC_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT } from "@/constants/messages";
import { PAGE_KEYS } from "@/constants/sections";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { listRecordsForAdmin } from "@/lib/content/records";
import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { MISSING_PERFORMANCE_ROUTE, PUBLIC_PERFORMANCE_ROUTES } from "@tests/support/performance-routes";

/** React's attribute-only diagnostics are development-only; the dev config runs the public group too. */
const HYDRATION_ERROR = /hydrat|server rendered|didn.t match|Minified React error #(418|419|421|422|423|424|425)/i;

async function checkRoutes(page: Page, paths: readonly string[], output: string) {
  const issues: { path: string; kind: string; message: string }[] = [];
  const rows: { path: string; status: number; serverAnnotations: boolean }[] = [];
  let current = "";
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()) && HYDRATION_ERROR.test(message.text()))
      issues.push({ path: current, kind: message.type(), message: message.text() });
  });
  page.on("pageerror", (error) => issues.push({ path: current, kind: "uncaught", message: error.message }));
  for (const path of paths) {
    current = path;
    // Read raw SSR independently: a development reload can discard the browser's
    // CDP response body while React's hydration diagnostics still need checking.
    const raw = await page.request.get(path);
    expect(raw.status(), path).toBe(path === MISSING_PERFORMANCE_ROUTE ? 404 : 200);
    const html = await raw.text();
    const response = await page.goto(path);
    expect(response!.status(), path).toBe(path === MISSING_PERFORMANCE_ROUTE ? 404 : 200);
    rows.push({ path, status: response!.status(), serverAnnotations: /__gcr(?:remoteframetoken|uniqueid)/.test(html) });
    await expect(page.locator("main h1").first()).toBeVisible();
    // Next's first development compilation may reload the document once;
    // retry readiness without discarding any captured hydration diagnostics.
    await expect(async () => {
      await page.evaluate(() => document.fonts.ready);
    }).toPass({ timeout: 10_000 });
    // Exercise real handlers, rather than considering an unhydrated SSR screenshot a pass.
    const publicMenu = page.getByRole("button", { name: UI_TEXT.menu, exact: true });
    if (await publicMenu.isVisible()) {
      await expect(async () => {
        if (!(await page.getByRole("dialog").isVisible())) await publicMenu.click();
        await expect(page.getByRole("dialog")).toBeVisible();
      }).toPass();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
    }
    const passwordToggle = page.getByRole("button", { name: ADMIN_TEXT.showPassword, exact: true }).first();
    if (await passwordToggle.isVisible()) {
      await expect(async () => {
        if (await passwordToggle.isVisible()) await passwordToggle.click();
        await expect(page.getByRole("button", { name: ADMIN_TEXT.hidePassword, exact: true }).first()).toBeVisible();
      }).toPass();
    }
    // Let post-paint enhancements run as well as the initial React hydration.
    await page.waitForTimeout(750);
  }
  await writeFile(output, JSON.stringify({ rows, issues }, null, 2));
  expect(rows.filter((row) => row.serverAnnotations)).toEqual([]);
  expect(issues).toEqual([]);
}

test.describe("public hydration", () => {
  test("every public route and signed-out admin screen hydrates without mismatches or uncaught errors", async ({
    page,
  }, info) => {
    test.setTimeout(300_000);
    await checkRoutes(
      page,
      [...PUBLIC_PERFORMANCE_ROUTES, ...ADMIN_PUBLIC_ROUTES],
      info.outputPath("public-hydration.json"),
    );
  });
});

test.describe("admin hydration", () => {
  const run = crypto.randomUUID().slice(0, 8);
  test.afterAll(async () => {
    await getDb()
      .delete(authUser)
      .where(like(authUser.email, `hydration-${run}-%`));
    await closeDb();
  });
  test("signed-in lists and editors hydrate without mismatches or uncaught errors", async ({ page }, info) => {
    test.setTimeout(300_000);
    const email = `hydration-${run}-${crypto.randomUUID().slice(0, 6)}@example.com`;
    const password = "a long hydration test password";
    await createAdmin({ email, name: "Hydration reviewer", password });
    expect(
      (
        await page.request.post(ADMIN_API_ROUTES.adminSession, {
          data: { email, password },
          headers: { origin: E2E_ORIGIN },
        })
      ).ok(),
    ).toBe(true);
    const [services, jobs, clients] = await Promise.all([
      listRecordsForAdmin("SERVICES"),
      listRecordsForAdmin("JOBS"),
      listRecordsForAdmin("CLIENTS"),
    ]);
    await checkRoutes(
      page,
      [
        ADMIN_ROUTES.overview,
        ADMIN_ROUTES.enquiries,
        ADMIN_ROUTES.applications,
        ADMIN_ROUTES.pages,
        ...PAGE_KEYS.map(ADMIN_ROUTES.page),
        ADMIN_ROUTES.services,
        ADMIN_ROUTES.newService,
        ...services.filter((record) => record.publishedAt !== null).map((record) => ADMIN_ROUTES.service(record.id)),
        ADMIN_ROUTES.jobs,
        ADMIN_ROUTES.newJob,
        ADMIN_ROUTES.job(jobs.find((record) => record.publishedAt !== null)!.id),
        ADMIN_ROUTES.clients,
        ADMIN_ROUTES.newClient,
        ADMIN_ROUTES.client(clients.find((record) => record.publishedAt !== null)!.id),
        ADMIN_ROUTES.media,
        ADMIN_ROUTES.settings,
        ADMIN_ROUTES.fonts,
        ADMIN_ROUTES.operations,
        ADMIN_ROUTES.activity,
        ADMIN_ROUTES.profile,
      ],
      info.outputPath("admin-hydration.json"),
    );
  });
});
