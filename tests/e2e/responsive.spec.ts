import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { FONT_IDS, FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import { PUBLIC_PERFORMANCE_ROUTES } from "@tests/support/performance-routes";

/** D161: the same content/tasks, with phone proportions and unchanged desktop roles. */
test("all public templates retain readable type, usable fields and no overflow after mobile adaptation", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const phone = testInfo.project.name === "phone";
  await page.goto(ROUTES.home);
  const mainHeaderHeight = (await page.getByRole("banner").boundingBox())!.height;
  for (const route of PUBLIC_PERFORMANCE_ROUTES) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    if (route === ROUTES.careers || route === ROUTES.contact) {
      await expect(page.getByRole("banner")).toHaveCSS("background-color", "rgb(252, 253, 254)");
      expect((await page.getByRole("banner").boundingBox())!.height, route).toBe(mainHeaderHeight);
    }
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();
    const size = await heading.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(size, route).toBeLessThanOrEqual(phone ? 40 : 96);
    for (const field of await page.locator("main").getByRole("textbox").all()) {
      if (!(await field.isVisible())) continue;
      expect(await field.evaluate((e) => parseFloat(getComputedStyle(e).fontSize)), route).toBeGreaterThanOrEqual(16);
      expect((await field.boundingBox())!.height, route).toBeGreaterThanOrEqual(44);
    }
    expect((await new AxeBuilder({ page }).analyze()).violations, route).toEqual([]);
  }
  await page.goto(ROUTES.home);
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator(".opening-blend");
  if (phone) {
    expect((await hero.boundingBox())!.height).toBeLessThanOrEqual(680);
    const footer = page.getByRole("contentinfo").locator(".footer-content");
    expect(await footer.evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length)).toBe(2);
  } else {
    await expect(page.getByRole("heading", { level: 1 }).first()).toHaveCSS("font-size", "68px");
    expect((await hero.boundingBox())!.height).toBe(780);
  }
});

test("public layouts and menu adapt from narrow phones through tablet and short landscape", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [320, 740],
    [414, 896],
    [768, 1024],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    for (const route of [ROUTES.home, ROUTES.contact, ROUTES.service("school-nurse-staffing"), ROUTES.applyGeneral]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${route}`).toBe(
        true,
      );
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    }
    await page.getByRole("button", { name: UI_TEXT.menu, exact: true }).click();
    const menu = page.getByRole("dialog", { name: UI_TEXT.menu });
    const contact = menu.getByRole("link", { name: new RegExp(`^${UI_TEXT.whatsappUs}`) });
    await contact.scrollIntoViewIfNeeded();
    expect((await contact.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(contact).toBeInViewport();
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
  }
});

test("the expanded phone menu reflows all fonts at normal and doubled text sizes", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "one complete menu text/size matrix");
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const scale of [100, 200]) {
      await page.evaluate((value) => {
        document.documentElement.style.fontSize = `${value}%`;
      }, scale);
      for (const font of FONT_IDS) {
        await page.locator(".site-world").evaluate(
          async (world, { font, roles, stack }) => {
            for (const role of roles) (world as HTMLElement).style.setProperty(`--type-${role}`, stack);
            await document.fonts.load(`600 32px ${getComputedStyle(world).getPropertyValue(`--font-${font}`)}`);
            await document.fonts.ready;
          },
          { font, roles: FONT_ROLES, stack: FONT_STACKS[font] },
        );
        await page.getByRole("button", { name: UI_TEXT.menu, exact: true }).click();
        const menu = page.getByRole("dialog", { name: UI_TEXT.menu });
        const layout = await menu.evaluate((dialog) => ({
          overflow: dialog.scrollWidth - dialog.clientWidth,
          clipped: [...dialog.querySelectorAll<HTMLElement>("a,button,span")].filter(
            (el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1,
          ).length,
          targets: [...dialog.querySelectorAll<HTMLElement>("a,button")].every((el) => {
            const b = el.getBoundingClientRect();
            return b.width >= 44 && b.height >= 44;
          }),
        }));
        expect(layout, `${width} / ${scale}% / ${font}`).toEqual({ overflow: 0, clipped: 0, targets: true });
        const close = menu.getByRole("button", { name: UI_TEXT.close, exact: true });
        await close.click();
        await expect(menu).toBeHidden();
      }
    }
  }
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "100%";
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: UI_TEXT.menu, exact: true }).click();
  const menu = page.getByRole("dialog", { name: UI_TEXT.menu });
  await menu.evaluate((sheet) =>
    Promise.all(sheet.getAnimations({ subtree: true }).map((animation) => animation.finished)),
  );
  await menu.getByRole("button", { name: UI_TEXT.close, exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(menu).toBeHidden();
  await expect(page.getByRole("button", { name: UI_TEXT.menu, exact: true })).toBeFocused();
});
