import AxeBuilder from "@axe-core/playwright";
import { devices, expect, test } from "@playwright/test";

import { SEED_SERVICES } from "@/db/seed/content";

/** The motion system on the kit page (plan §30.4, D64). */
const KIT = "/kit";
const LAST = SEED_SERVICES.at(-1)!;

test.describe("with a mouse or trackpad", () => {
  test("Lenis smooths the wheel once the page has painted", async ({ page }) => {
    await page.goto(KIT);
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
    await page.mouse.move(600, 400);
    await page.mouse.wheel(0, 2000);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("a block below the fold rises into view, and one on screen never hides", async ({ page }) => {
    await page.goto(KIT);
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveCSS("opacity", "1");

    const below = page.getByText(LAST.summary.en);
    await expect.poll(() => below.evaluate((element) => getComputedStyle(element.parentElement!).opacity)).toBe("0");
    await below.scrollIntoViewIfNeeded();
    await expect.poll(() => below.evaluate((element) => getComputedStyle(element.parentElement!).opacity)).toBe("1");
  });

  test("the kit page passes axe", async ({ page }) => {
    await page.goto(KIT);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations).toEqual([]);
  });
});

test.describe("on a touch screen", () => {
  const phone = devices["Pixel 7"];
  test.use({ hasTouch: true, isMobile: true, viewport: phone.viewport, userAgent: phone.userAgent });

  test("the platform keeps its own scrolling", async ({ page }) => {
    await page.goto(KIT);
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
  });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing smooths, scrubs or reveals: every block is in place", async ({ page }) => {
    await page.goto(KIT);
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    await expect(page.getByText(LAST.summary.en)).toBeVisible();
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every word is on the page, visible", async ({ page }) => {
    await page.goto(KIT);
    for (const service of SEED_SERVICES) {
      await expect(page.getByRole("heading", { name: service.name.en })).toBeVisible();
      await expect(page.getByText(service.summary.en)).toBeVisible();
    }
  });
});
