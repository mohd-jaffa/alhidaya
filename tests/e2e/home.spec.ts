import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SEED_CLIENTS } from "@/db/seed/clients";
import { SEED_SERVICES, SEED_SITE, seedPages } from "@/db/seed/content";
import { SEED_PHOTOS } from "@/db/seed/photos";

const sign = seedPages().HOME.sections[0];

test("Home opens on its hero: the headline, its words, WhatsApp and the quote, and its photo first (D97)", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(SEED_SITE.seo.title.en);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  if (sign.type !== "SIGN") throw new Error("Home opens with its sign");
  await expect(page.getByRole("heading", { level: 1, name: sign.content.headline.en })).toBeVisible();

  const hero = page.getByRole("main").locator("#start");
  await expect(hero.getByText(sign.content.lede.en!)).toBeVisible();
  for (const chip of sign.content.chips) await expect(hero.getByText(chip.en, { exact: true })).toBeVisible();
  await expect(hero.getByText(sign.content.fact.value.en!, { exact: true })).toBeVisible();
  await expect(hero.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/97431306555\?text=/,
  );
  // The hero's photograph (D75), a nurse against a light wall, served in its made sizes and loaded first.
  const photo = hero.getByRole("img", { name: SEED_PHOTOS.avatarBraids.alt });
  await expect(photo).toHaveAttribute("fetchpriority", "high");
  await expect
    .poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth))
    .toBeGreaterThan(0);
  await hero.getByRole("link", { name: UI_TEXT.requestQuote }).click();
  await expect(page).toHaveURL(ROUTES.quote);
});

test("Home follows the reference's sections, the family services in their card and the Contact form (D97)", async ({
  page,
}) => {
  await page.goto("/");
  // The current site's slides carried into Home's headings (2026-10-31).
  for (const name of [/Trained nurses who deliver/, /Compassionate nursing care/, /Care arranged/])
    await expect(page.getByRole("region", { name })).toBeVisible();
  const families = page.getByRole("region", { name: /Compassionate nursing care/ });
  for (const service of SEED_SERVICES)
    if (service.audience === "FAMILIES")
      await expect(families.getByRole("link", { name: service.name.en })).toHaveAttribute(
        "href",
        ROUTES.service(service.slug),
      );
    else await expect(families.getByRole("link", { name: service.name.en })).toHaveCount(0);
  const steps = page.getByRole("region", { name: /Care arranged/ }).getByRole("listitem");
  await expect(steps).toHaveCount(4);
  const form = page.getByRole("region", { name: "Experience the difference with Al Hidaya" });
  await expect(form.getByRole("button", { name: UI_TEXT.sendMessage })).toBeVisible();
  await expect(form.getByRole("link", { name: SEED_SITE.contact.email })).toHaveAttribute(
    "href",
    `mailto:${SEED_SITE.contact.email}`,
  );
  // The current site's client logos, in its order (D118); each loads as the visitor reaches it.
  const clients = page.locator("#clients");
  await clients.scrollIntoViewIfNeeded();
  await expect(clients.getByRole("img")).toHaveCount(SEED_CLIENTS.length);
  for (const client of SEED_CLIENTS) await expect(clients.getByRole("img", { name: client.name })).toBeVisible();
});

test("the statement darkens with the scroll, and every word stays readable before it does (D97)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  const ink = page.locator("#statement [data-ink]").first();
  await expect.poll(() => ink.evaluate((element) => getComputedStyle(element).opacity)).toBe("0");
  await page.locator("#statement").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  await expect.poll(() => ink.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0);
});

test("the wheel scrolls Home to its very end: the page grows with its content while Lenis runs", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  // Lenis watches the page's size to know how far it may scroll: html must not stay the window's height.
  expect(await page.evaluate(() => document.documentElement.getBoundingClientRect().height)).toBeGreaterThan(
    await page.evaluate(() => window.innerHeight * 2),
  );
  await page.mouse.move(200, 300);
  for (let stroke = 0; stroke < 40; stroke++) await page.mouse.wheel(0, 800);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight - window.scrollY))
    .toBeLessThanOrEqual(2);
});

test("the footer's words run on their own, and their button pauses them (D113)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const words = page.locator(".running-words");
  const offset = () => words.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
  const before = await offset();
  await expect.poll(offset).not.toBe(before);

  await page.locator("footer label").click();
  await expect(page.getByRole("checkbox", { name: UI_TEXT.pauseRunningWords })).toBeChecked();
  await expect.poll(() => words.evaluate((element) => getComputedStyle(element).animationPlayState)).toBe("paused");
  // The pause lands on the next frame drawn: measure from there.
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  const paused = await offset();
  await page.waitForTimeout(500);
  expect(await offset()).toBe(paused);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("everything is in place: the headline, the statement inked, the cards, the footer's words still", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    const style = (selector: string, property: "opacity" | "animationName") =>
      page
        .locator(selector)
        .first()
        .evaluate((element, name) => getComputedStyle(element)[name], property);
    expect(await style(".settle-letter", "animationName")).toBe("none");
    expect(await style("#statement [data-ink]", "opacity")).toBe("1");
    expect(await style("#highlights li > div", "opacity")).toBe("1");
    expect(await style(".running-words", "animationName")).toBe("none");
  });
});

test("no rail runs down the page, and the header scrolls away with it (D101, D107)", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toBeInViewport();
  await expect(page.getByRole("navigation", { name: "On this page" })).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect(header).not.toBeInViewport();
});

test("Home passes axe", async ({ page }) => {
  await page.goto("/");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
});

test("the site's own typeface loads, from the site itself (plan D108, §22.4)", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(new URL(request.url()).host);
  });
  await page.goto("/");

  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((face) => face.status === "loaded").map((face) => face.family);
  });
  expect(loaded.some((family) => family.toLowerCase().replace(" ", "").includes("intertight"))).toBe(true);
  expect(fontRequests.length).toBeGreaterThan(0);
  expect(new Set(fontRequests)).toEqual(new Set([new URL(page.url()).host]));
});

test("the browser finds the site's icons (plan R2.2)", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][href^="/favicon.ico"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);

  for (const [path, type] of [
    ["/favicon.ico", "image/x-icon"],
    ["/apple-icon.png", "image/png"],
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"]).toContain(type);
  }
});
