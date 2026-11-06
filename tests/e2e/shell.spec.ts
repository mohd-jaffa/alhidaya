import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { SEED_SITE } from "@/db/seed/content";

/** The public site's frame, from the published seed (plan R2.6, global-setup.ts). */
const wide = (width: number | undefined) => (width ?? 0) >= 1024;

test("the first Tab reaches the skip link, which moves focus to the page's content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: UI_TEXT.skipToContent });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("the header lists the published pages, or opens them as a menu on a phone", async ({ page }) => {
  await page.goto("/");
  const labels = SEED_SITE.navigation.filter((link) => link.visible).map((link) => link.label.en);
  if (wide(page.viewportSize()?.width)) {
    const main = page.getByRole("navigation", { name: UI_TEXT.mainNavigation });
    await expect(main.getByRole("link")).toHaveText(labels);
    await expect(page.getByRole("link", { name: "+974 3130 6555" }).first()).toBeVisible();
    return;
  }
  const button = page.getByRole("button", { name: UI_TEXT.menu });
  await button.click();
  const menu = page.getByRole("dialog", { name: UI_TEXT.menu });
  await expect(menu.getByRole("navigation").getByRole("link")).toHaveText(labels);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();
});

test("the WhatsApp button floats on the page, opening the company's chat", async ({ page }) => {
  await page.goto("/");
  const whatsapp = page.getByRole("link", { name: UI_TEXT.whatsappButton });
  await expect(whatsapp).toBeInViewport();
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/97431306555\?text=/);
});

test("the footer carries the contact details, the social links and the admin's columns (D114)", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: SEED_SITE.contact.email })).toBeVisible();
  await expect(footer.getByText(SEED_SITE.contact.hours.en!)).toBeVisible();
  for (const social of SEED_SITE.social)
    await expect(footer.getByRole("list", { name: UI_TEXT.followUs }).getByRole("link")).toHaveAttribute(
      "href",
      social.url,
    );
  // The address is on the Contact page, not the footer.
  await expect(footer.getByText(SEED_SITE.contact.address[0].en)).toHaveCount(0);
  for (const column of SEED_SITE.footer) {
    await expect(footer.getByRole("navigation", { name: column.heading.en })).toBeVisible();
  }
  const artwork = footer.locator(".footer-art");
  await expect(artwork).toHaveAttribute("aria-hidden", "true");
  await expect(artwork).toHaveCSS("pointer-events", "none");
  await expect(artwork).toHaveCSS("animation-name", "none");
  await expect(artwork.locator("svg")).toHaveCount(0);
  const scene = artwork.locator("img");
  await expect(scene).toHaveAttribute("alt", "");
  await expect(scene).toHaveAttribute("loading", "lazy");
  await footer.scrollIntoViewIfNeeded();
  await expect.poll(() => scene.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const email = footer.getByRole("link", { name: SEED_SITE.contact.email });
  await email.scrollIntoViewIfNeeded();
  expect(
    await email.evaluate((link) => {
      const box = link.getBoundingClientRect();
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest("a") === link;
    }),
  ).toBe(true);
});

test("nothing scrolls sideways, down to a 320 px phone", async ({ page }) => {
  for (const width of [320, 360]) {
    await page.setViewportSize({ width, height: 740 });
    for (const path of ["/", "/kit", "/missing"]) {
      await page.goto(path);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
        `${path} at ${width}`,
      ).toBe(0);
    }
  }
});
