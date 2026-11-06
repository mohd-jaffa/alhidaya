import AxeBuilder from "@axe-core/playwright";
import { devices, expect, type Page, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { SEED_SERVICES } from "@/db/seed/content";

/** The motion system on the kit page (plan §30.4, D64). */
const KIT = "/kit";
const LAST = SEED_SERVICES.at(-1)!;

/** The rows of the phone menu (D117), opened on Home. */
async function openMenu(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: UI_TEXT.menu }).click();
  return page.getByRole("dialog", { name: UI_TEXT.menu }).getByRole("listitem");
}

test("the footer logo stays stationary while its diagonal shine repeats, and reduced motion hides the shine", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  const logo = footer.getByRole("img", { name: UI_TEXT.siteName });
  await logo.scrollIntoViewIfNeeded();
  const before = (await logo.boundingBox())!;
  const shine = footer.locator(".footer-logo-shine");
  await expect(shine).toHaveAttribute("aria-hidden", "true");
  await expect(shine).toHaveCSS("mask-size", "contain");
  await expect(logo).toHaveCSS("object-fit", "contain");
  expect(await shine.evaluate((element) => getComputedStyle(element).maskImage)).toContain(
    (await logo.getAttribute("src"))!,
  );
  const frames = await shine.evaluate((element) => {
    const [animation] = element.getAnimations({ subtree: true });
    animation.pause();
    const sample = (time: number) => {
      animation.currentTime = time;
      const style = getComputedStyle(element, "::after");
      return { transform: style.transform, opacity: Number(style.opacity), iterations: style.animationIterationCount };
    };
    const effect = animation.effect as KeyframeEffect;
    return {
      duration: effect.getTiming().duration,
      offsets: effect.getKeyframes().map((frame) => frame.computedOffset),
      samples: [sample(0), sample(2500), sample(6000), sample(7600), sample(8050)],
    };
  });
  expect(frames.duration).toBe(7250);
  const sweep = (frames.offsets.at(-2)! - frames.offsets[1]) * Number(frames.duration);
  expect(sweep).toBeCloseTo(4500, 2);
  expect(Number(frames.duration) - sweep).toBeCloseTo(2750, 2);
  expect(frames.samples[0].opacity).toBe(0);
  expect(frames.samples[1].opacity).toBeGreaterThan(0);
  expect(frames.samples[1].transform).not.toBe(frames.samples[0].transform);
  expect(frames.samples[2].opacity).toBe(0);
  expect(frames.samples[3].opacity).toBe(0);
  expect(frames.samples[4].opacity).toBeGreaterThan(0);
  expect(frames.samples[1].iterations).toBe("infinite");
  expect((await logo.boundingBox())!.width).toBe(before.width);
  expect((await logo.boundingBox())!.height).toBe(before.height);
  await expect(logo).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(shine).toBeHidden();
  await expect(logo).toBeVisible();
});

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

  test("the menu's sheet drops in and its rows settle one after another; it lifts away, rows fading, before it closes (D117, D167)", async ({
    page,
  }) => {
    const rows = await openMenu(page);
    const menu = page.getByRole("dialog", { name: UI_TEXT.menu });
    await expect(menu).toHaveCSS("animation-name", "menu-in");
    await expect(rows.first()).toHaveCSS("animation-name", "menu-row-in");
    const delays = await rows.evaluateAll((items) =>
      items.map((item) => parseFloat(getComputedStyle(item).animationDelay)),
    );
    expect(delays).toEqual([...delays].sort((a, b) => a - b));
    expect(new Set(delays).size).toBe(delays.length);
    await expect(rows.last()).toHaveCSS("opacity", "1");
    // At rest the sheet is in place (the finished animation reads as the identity matrix).
    await expect(menu).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);

    // Closing: the rows fade as the sheet lifts; the dialog stays open until it has gone.
    await menu.getByRole("button", { name: UI_TEXT.close }).click();
    await expect(menu).toHaveAttribute("data-closing", "");
    await expect(menu).toHaveCSS("animation-name", "menu-out");
    await expect(rows.first()).toHaveCSS("animation-name", "menu-fade");
    await expect(menu).toBeHidden();
    // A closed dialog has no role to find it by; it is still the same element.
    await expect(page.locator("dialog.menu-sheet")).not.toHaveAttribute("data-closing");
    await expect(page.getByRole("button", { name: UI_TEXT.menu })).toBeFocused();

    // Escape and a chosen page leave the same way.
    await page.getByRole("button", { name: UI_TEXT.menu }).click();
    await expect(menu).toHaveCSS("animation-name", "menu-in");
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("data-closing", "");
    await expect(menu).toBeHidden();
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

  test("the phone menu appears with its rows in place", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const rows = await openMenu(page);
    await expect(rows.first()).toHaveCSS("animation-name", "none");
    await expect(rows.first()).toHaveCSS("opacity", "1");
    // With nothing to animate, it goes at once, leaving nothing marked behind.
    const menu = page.getByRole("dialog", { name: UI_TEXT.menu });
    await expect(menu).toHaveCSS("animation-name", "none");
    await menu.getByRole("button", { name: UI_TEXT.close }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator("dialog.menu-sheet")).not.toHaveAttribute("data-closing");
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
