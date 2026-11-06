import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { FONT_IDS, FONT_STACKS } from "@/constants/typography";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { E2E_ORIGIN } from "@tests/support/e2e-app";

const RUN = crypto.randomUUID().slice(0, 8);
test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `polish-${RUN}-%`));
  await closeDb();
});

test("compact service rows stay aligned with mixed title lengths and every supported font", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "one complete compact-card matrix");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const rows = [];
  for (const path of [ROUTES.services, ROUTES.service("school-nurse-staffing")]) {
    await page.goto(path);
    for (const width of [320, 390, 640, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const font of FONT_IDS) {
        await page.locator(".service-summary > span:last-child").evaluateAll((titles, family) => {
          for (const [index, title] of titles.entries()) {
            title.textContent =
              index % 2 === 0
                ? "Nursing care"
                : "Specialist nursing care for patients, families and healthcare partners";
            (title as HTMLElement).style.fontFamily = family;
          }
        }, FONT_STACKS[font]);
        await page.evaluate(() => document.fonts.ready);
        const boxes = await page.locator(".service-summary").evaluateAll((cards) =>
          cards.map((card) => ({
            y: card.getBoundingClientRect().y,
            height: card.getBoundingClientRect().height,
            overflow: card.scrollWidth - card.clientWidth,
          })),
        );
        for (const box of boxes) {
          expect(box.overflow).toBeLessThanOrEqual(1);
          const sameRow = boxes.filter((other) => Math.abs(other.y - box.y) < 1);
          expect(
            Math.max(...sameRow.map((other) => other.height)) - Math.min(...sameRow.map((other) => other.height)),
          ).toBeLessThan(1);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        rows.push({ path, width, font, boxes });
      }
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await writeFile(info.outputPath("compact-card-alignment.json"), JSON.stringify(rows, null, 2));
});

test("Preview clearly waits for the editor's save and cannot open an outdated draft", async ({ page }, info) => {
  const email = `polish-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  const password = "a long polish test password";
  await createAdmin({ email, name: "Polish reviewer", password });
  expect(
    (
      await page.request.post(ADMIN_API_ROUTES.adminSession, {
        data: { email, password },
        headers: { origin: E2E_ORIGIN },
      })
    ).ok(),
  ).toBe(true);
  await page.goto(ADMIN_ROUTES.fonts);
  const field = page.getByRole("combobox", { name: ADMIN_TEXT.fontRoleLabels.h1 });
  await expect(field).toBeVisible();
  const original = await field.inputValue();
  await field.selectOption(original === "inter" ? "dm-sans" : "inter");
  let release = () => {};
  const hold = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**${ADMIN_API_ROUTES.adminTypography}`, async (route) => {
    if (route.request().method() === "PUT") {
      await hold;
      // Exercise failure recovery without changing the stored draft.
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Please try again.", requestId: "polish-test" },
        }),
      });
    } else await route.continue();
  });
  try {
    await page.getByRole("button", { name: ADMIN_TEXT.saveDraft, exact: true }).click();
    const preview = page.getByRole("link", { name: ADMIN_TEXT.preview, exact: true });
    await expect(preview).toHaveAttribute("aria-disabled", "true");
    await expect(preview).toHaveAttribute("tabindex", "-1");
    await expect(preview).toHaveCSS("opacity", "0.5");
    await expect(field).toBeDisabled();
    const pages = page.context().pages().length;
    await preview.click({ force: true });
    await page.screenshot({ path: info.outputPath("preview-waiting.png") });
    expect(page.context().pages()).toHaveLength(pages);
    release();
    await expect(page.getByRole("group", { name: ADMIN_TEXT.fontManager }).getByRole("alert")).toBeVisible();
    await expect(preview).not.toHaveAttribute("aria-disabled");
    await expect(preview).toHaveCSS("opacity", "1");
    await expect(field).toBeEnabled();
    expect(await field.inputValue()).not.toBe(original);
    await field.selectOption(original);
  } finally {
    release();
  }
});
