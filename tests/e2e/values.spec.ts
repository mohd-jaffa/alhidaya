import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

import { ROUTES } from "@/constants/routes";
import { FONT_IDS, FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import { inspectLayout } from "@tests/support/layout-consistency";

const SIZES = [
  [320, 740],
  [360, 800],
  [390, 844],
  [414, 896],
  [640, 900],
  [768, 1024],
  [844, 390],
  [1024, 900],
  [1440, 900],
] as const;

test("About's three commitment panels shine on hover while the cards stay stationary", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(ROUTES.about);
  const values = page.getByRole("region", { name: "What we stand for" });
  const cards = values.getByRole("article");
  await expect(cards).toHaveCount(3);
  await expect(values.getByRole("list")).toHaveCount(0);
  for (const [index, colour] of ["rgb(15, 100, 172)", "rgb(238, 245, 226)", "rgb(241, 246, 251)"].entries())
    await expect(cards.nth(index)).toHaveCSS("background-color", colour);
  const card = cards.first();
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el.parentElement!).opacity)).toBe("1");
  const before = await card.boundingBox();
  await card.hover();
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el, "::before").animationName))
    .toBe("value-card-shine");
  await expect(card).toHaveCSS("transform", "none");
  await expect(card).toHaveCSS("translate", "none");
  const after = await card.boundingBox();
  expect(Math.abs(after!.x - before!.x)).toBeLessThan(0.5);
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(0.5);
  await expect.poll(() => card.evaluate((el) => Number(getComputedStyle(el, "::before").opacity) > 0.05)).toBe(true);
  await expect.poll(() => card.evaluate((el) => Number(getComputedStyle(el, "::before").opacity))).toBe(0);
  await page.mouse.move(0, 0);
  await card.hover();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el, "::before").animationName)).toBe("none");
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el, "::before").opacity)).toBe("0");
});

test("the commitment panels fit every supported font at phone, tablet and laptop sizes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one Values font/size matrix");
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.about);
  const rows = [];
  for (const [width, height] of SIZES) {
    await page.setViewportSize({ width, height });
    for (const font of FONT_IDS) {
      await page.locator(".site-world").evaluate(
        async (el, { roles, stack, font }) => {
          for (const role of roles) (el as HTMLElement).style.setProperty(`--type-${role}`, stack);
          const family = getComputedStyle(el).getPropertyValue(`--font-${font}`).split(",")[0].trim();
          await document.fonts.load(`600 32px ${family}`);
          await document.fonts.load(`400 21px ${family}`);
          await document.fonts.ready;
        },
        { roles: FONT_ROLES, stack: FONT_STACKS[font], font },
      );
      const result = await inspectLayout(page);
      rows.push({
        width,
        height,
        font,
        overflow: result.overflow,
        clippedText: result.clippedText,
        smallTargets: result.smallTargets,
      });
    }
  }
  await writeFile(testInfo.outputPath("values-font-layouts.json"), JSON.stringify(rows, null, 2));
  expect(rows.filter((row) => row.overflow || row.clippedText.length || row.smallTargets.length)).toEqual([]);
});

test("About's description starts beside its photo on wide screens and follows it on phones", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.about);
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );
    const photo = await page.locator(".intro-align-photo .intro-photo").boundingBox();
    const copy = await page.locator(".intro-align-photo .intro-copy").boundingBox();
    if (width >= 1024) expect(Math.abs(photo!.y - copy!.y)).toBeLessThan(1);
    else expect(copy!.y).toBeGreaterThanOrEqual(photo!.y + photo!.height);
  }
});

test("About and Services contact cards use navy icon squares and the shorter call label", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [ROUTES.about, ROUTES.services]) {
    await page.goto(path);
    const contact = page.getByRole("region", { name: "Talk to us" });
    await expect(contact.getByRole("link")).toHaveCount(3);
    await expect(contact.getByText("Call us", { exact: true })).toBeVisible();
    await expect(contact.getByText("Call us, 24/7", { exact: true })).toHaveCount(0);
    const icons = contact.locator(".contact-card-icon");
    await expect(icons).toHaveCount(3);
    for (const index of [1, 2]) {
      await expect(icons.nth(index)).toHaveCSS("background-color", "rgb(11, 36, 64)");
      await expect(icons.nth(index)).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(icons.nth(index)).toHaveCSS("border-radius", "6px");
    }
  }
});
