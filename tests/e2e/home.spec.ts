import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SEED_CLIENTS } from "@/db/seed/clients";
import { SEED_SERVICES, SEED_SITE, seedPages } from "@/db/seed/content";
import { SEED_PHOTOS } from "@/db/seed/photos";

const sign = seedPages().HOME.sections[0];
if (sign.type !== "SIGN") throw new Error("Home opens with its sign");
const slides = sign.content.slides;

test("Home opens on its slides: the first headline, its words and its photo first, the controls beside (D128)", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(SEED_SITE.seo.title.en);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const hero = page.getByRole("region", { name: UI_TEXT.slidesLabel });
  await expect(page.getByRole("heading", { level: 1, name: slides[0].headline.en })).toBeVisible();
  await expect(hero.getByText(slides[0].text.en!)).toBeVisible();
  await expect(hero.getByText(`01 / 0${slides.length}`)).toBeVisible();
  // The first slide's photograph, from the current site (D118), served in its made sizes and loaded first.
  const photo = hero.getByRole("img", { name: SEED_PHOTOS.currentHomeVisit.alt });
  await expect(photo).toHaveAttribute("fetchpriority", "high");
  await expect
    .poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth))
    .toBeGreaterThan(0);
  // No button at launch: the admin may give a slide one (D128).
  await expect(hero.getByRole("link")).toHaveCount(0);
});

test("the slides move by their arrows and their bars, round the ends, and pause by their button (D128)", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: UI_TEXT.slidesLabel });
  await hero.getByRole("button", { name: UI_TEXT.pauseSlides }).click();
  await expect(hero).toHaveAttribute("data-paused");
  await hero.getByRole("button", { name: UI_TEXT.nextSlide }).click();
  await expect(page.getByRole("heading", { level: 1, name: slides[1].headline.en })).toBeVisible();
  await hero.getByRole("button", { name: UI_TEXT.previousSlide }).click();
  await hero.getByRole("button", { name: UI_TEXT.previousSlide }).click();
  await expect(page.getByRole("heading", { level: 1, name: slides.at(-1)!.headline.en })).toBeVisible();
  await expect(hero.getByText(`0${slides.length} / 0${slides.length}`)).toBeVisible();
});

test("the slides move on by themselves when their bar fills (D128)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: slides[1].headline.en })).toBeVisible({ timeout: 9000 });
});

test("Home follows Theme 6: About, the services row, the clients and the short quote (D129 – D133)", async ({
  page,
}) => {
  await page.goto("/");
  const about = page.locator("#about");
  await expect(about.getByRole("link", { name: UI_TEXT.readAboutUs })).toHaveAttribute("href", ROUTES.about);
  await expect(about.getByRole("listitem")).toHaveCount(3);

  const services = page.getByRole("region", { name: "What we do" });
  for (const service of SEED_SERVICES)
    await expect(services.getByRole("link", { name: new RegExp(service.name.en) })).toHaveAttribute(
      "href",
      ROUTES.service(service.slug),
    );
  await expect(services.getByRole("link", { name: UI_TEXT.allServices })).toHaveAttribute("href", ROUTES.services);

  // The current site's client logos, in its order (D118), each named once for a screen reader.
  const clients = page.locator("#clients");
  await clients.scrollIntoViewIfNeeded();
  for (const client of SEED_CLIENTS) await expect(clients.getByRole("button", { name: client.name })).toHaveCount(1);

  const quote = page.getByRole("region", { name: /Get a free quote/ });
  await expect(quote.getByText(UI_TEXT.quoteCardTitle)).toBeVisible();
  await expect(quote.getByRole("button", { name: UI_TEXT.sendShortQuote })).toBeVisible();
  await expect(quote.getByRole("link", { name: new RegExp(SEED_SITE.contact.email) })).toHaveAttribute(
    "href",
    `mailto:${SEED_SITE.contact.email}`,
  );
});

test("the services row moves by its arrows (D131)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The arrows show from a small tablet up; a phone swipes the row.");
  await page.goto("/");
  const services = page.getByRole("region", { name: "What we do" });
  await services.scrollIntoViewIfNeeded();
  const row = services.getByRole("list");
  await expect(services.getByRole("button", { name: UI_TEXT.previousServices })).toBeDisabled();
  await services.getByRole("button", { name: UI_TEXT.nextServices }).click();
  await expect.poll(() => row.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await expect(services.getByRole("button", { name: UI_TEXT.previousServices })).toBeEnabled();
});

test("the clients' rows run opposite ways, and a chosen logo stops its row until let go (D133)", async ({ page }) => {
  await page.goto("/");
  const clients = page.locator("#clients");
  await clients.scrollIntoViewIfNeeded();
  const [first, second] = [clients.locator(".logo-track").first(), clients.locator(".logo-track").nth(1)];
  const offset = (track: typeof first) =>
    track.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
  const state = (track: typeof first) => track.evaluate((element) => getComputedStyle(element).animationPlayState);
  await page.mouse.move(0, 0);
  const before = await offset(first);
  await expect.poll(() => offset(first)).not.toBe(before);
  expect(await second.evaluate((element) => getComputedStyle(element).animationDirection)).toBe("reverse");

  const logo = clients.getByRole("button", { name: SEED_CLIENTS[0].name });
  await logo.evaluate((element: HTMLElement) => element.click());
  await expect(logo).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await expect.poll(() => state(first)).toBe("paused");
  await page.locator("footer").click({ position: { x: 5, y: 5 } });
  await expect(logo).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => state(first)).toBe("running");
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

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("everything is in place: the slides still until moved, the rows standing in place, no pause shown", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    const hero = page.getByRole("region", { name: UI_TEXT.slidesLabel });
    await expect(hero.getByRole("button", { name: UI_TEXT.pauseSlides })).toBeHidden();
    await page.waitForTimeout(6500);
    await expect(page.getByRole("heading", { level: 1, name: slides[0].headline.en })).toBeVisible();
    const style = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((element) => getComputedStyle(element).animationName);
    expect(await style(".logo-track")).toBe("none");
    await expect(page.locator(".logo-copy").first()).toBeHidden();
  });
});

test("no rail runs down the page; the header slides away going down and comes back going up (D101, D132)", async ({
  page,
}) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toBeInViewport();
  await expect(page.getByRole("navigation", { name: "On this page" })).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect(header).toHaveAttribute("data-hidden");
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(header).not.toHaveAttribute("data-hidden");
  await expect(header).toBeInViewport();
});

test("the menu's deep-blue pill slides to the page opened, then rests there (D134)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The pill of pages shows from 1024 px; a phone has the menu.");
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: UI_TEXT.mainNavigation });
  const about = menu.getByRole("link", { name: "About" });
  await about.click();
  await expect(about).toHaveAttribute("aria-current", "page");
  const pill = about.locator(".nav-pill");
  const moving = () => pill.evaluate((element) => getComputedStyle(element).transform);
  await expect.poll(moving, { intervals: [20] }).not.toBe("none");
  await expect.poll(moving).toBe("none");
  await expect(menu.locator(".nav-pill")).toHaveCount(1);
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
