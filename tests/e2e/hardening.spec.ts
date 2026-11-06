import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SettleText } from "@/components/motion/SettleText";
import { Words } from "@/components/motion/Words";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";

test("long published words and contact details wrap without losing content or widening the page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);
  await page.evaluate(() => document.fonts.ready);
  const footerEmail = page.locator('footer a[href^="mailto:"]');
  const instagram = page.getByRole("contentinfo").getByRole("link", { name: "Instagram", exact: true });
  const emailIcon = footerEmail.locator("..").locator("svg");
  const socialIcon = instagram.locator("svg");
  expect((await socialIcon.boundingBox())!.x).toBe((await emailIcon.boundingBox())!.x - 2);
  expect((await socialIcon.boundingBox())!.width).toBe((await emailIcon.boundingBox())!.width);
  const socialTextStart = await instagram.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element.lastChild!);
    return range.getBoundingClientRect().x;
  });
  expect(Math.abs(socialTextStart - (await footerEmail.boundingBox())!.x)).toBeLessThan(1);
  const word = "Nursing".repeat(16);
  const email = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.com`;
  await page
    .locator("main h1")
    .first()
    .evaluate(
      (element, html) => {
        element.innerHTML = html;
      },
      renderToStaticMarkup(createElement(Words, { text: `${word}, nursing care`, highlight: word })),
    );
  const contact = page.locator('footer a[href^="mailto:"]');
  await contact.evaluate((element, value) => {
    element.textContent = value;
  }, email);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await expect(contact).toHaveText(email);
  const wordBox = await page
    .locator("main h1 [data-word]")
    .first()
    .evaluate((element) => ({ width: element.clientWidth, scroll: element.scrollWidth }));
  expect(wordBox.scroll).toBeLessThanOrEqual(wordBox.width + 1);
  for (const link of await page.locator("footer a, .desktop-nav a").all()) {
    if (!(await link.isVisible())) continue;
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  for (const name of [UI_TEXT.readAboutUs, UI_TEXT.allServices])
    expect((await page.getByRole("link", { name, exact: true }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.goto(ROUTES.careers);
  const headline = page.getByRole("main").getByRole("heading", { level: 1 });
  await headline.evaluate(
    (element, html) => {
      element.innerHTML = html;
    },
    renderToStaticMarkup(createElement(SettleText, { text: word, highlight: word })),
  );
  const highlighted = await headline.evaluate((element) => ({
    width: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(highlighted.scroll).toBeLessThanOrEqual(highlighted.width + 1);
});

test("public pages and sign-in remain readable with 200% text enlargement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [ROUTES.home, ROUTES.about, ROUTES.contact, ADMIN_ROUTES.login]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    await expect(page.getByRole("main").getByRole("heading", { level: 1 }).first()).toBeVisible();
  }
});

test("phone sign-in has a content-sized brand band and a full-size recovery link", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "the desktop keeps its full-height side panel");
  await page.goto(ADMIN_ROUTES.login);
  await page.evaluate(() => document.fonts.ready);
  const band = await page.locator("header").boundingBox();
  const logo = await page.locator("header img").boundingBox();
  // Content plus the existing vertical padding; no free grid space assigned to the band.
  expect(band!.height - logo!.height).toBeLessThanOrEqual(49);
  const recovery = page.getByRole("link", { name: ADMIN_TEXT.forgotPassword });
  expect((await recovery.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await recovery.focus();
  await expect(recovery).toBeFocused();
});
