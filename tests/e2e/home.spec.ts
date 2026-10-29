import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SEED_SERVICES, SEED_SITE, seedJob, seedPages } from "@/db/seed/content";
import { SEED_PHOTOS } from "@/db/seed/photos";

const sign = seedPages().HOME.sections[0];

test("Home opens on its sign and the three lines, each line's actions working (plan §6.1)", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(SEED_SITE.seo.title.en);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  if (sign.type !== "SIGN") throw new Error("Home opens with its sign");
  await expect(page.getByRole("heading", { level: 1, name: sign.content.headline.en })).toBeVisible();

  const lines = page.getByRole("main").locator("#start");
  await expect(lines.getByText(UI_TEXT.youAreHere, { exact: true })).toBeVisible();
  for (const name of [UI_TEXT.lineCareAtHome, UI_TEXT.lineStaffing, UI_TEXT.lineCareers])
    await expect(lines.getByRole("heading", { level: 2, name })).toBeVisible();
  await expect(lines.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/97431306555\?text=/,
  );
  await expect(lines.getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
  // The sign's photograph (D75), served in its made sizes and loaded first.
  const photo = lines.getByRole("img", { name: SEED_PHOTOS.careAtHome.alt });
  await expect(photo).toHaveAttribute("fetchpriority", "high");
  await expect
    .poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth))
    .toBeGreaterThan(0);
  await lines.getByRole("link", { name: UI_TEXT.requestQuote }).click();
  await expect(page).toHaveURL(ROUTES.quote);
});

test("Home shows every published service on its line, the open job and the way to reach us", async ({ page }) => {
  await page.goto("/");
  const services = page.getByRole("region", { name: "Our services" });
  for (const service of SEED_SERVICES)
    await expect(services.getByRole("link", { name: service.name.en })).toHaveAttribute(
      "href",
      ROUTES.service(service.slug),
    );

  const job = seedJob("2026-10-29");
  await expect(
    page.getByRole("region", { name: "Nurses: join us" }).getByRole("link", { name: job.title.en }),
  ).toHaveAttribute("href", ROUTES.job(job.slug));
  await expect(
    page.getByRole("region", { name: "Talk to us" }).getByRole("link", { name: UI_TEXT.whatsapp }),
  ).toBeVisible();
  // No client has given its logo yet (D7): the section is not on the page, nor on the line.
  await expect(page.locator("#clients")).toHaveCount(0);
});

test("on a wide screen each section is a station on the line, and a station takes the visitor there", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the line in the margin is drawn on a wide screen");
  await page.goto("/");
  const line = page.getByRole("navigation", { name: UI_TEXT.onThisPage });
  await expect(line.getByRole("link")).toHaveText([
    "Home",
    "Who we are",
    "Our services",
    "Why Al Hidaya",
    "Nurse staffing for hospitals, clinics and schools",
    "Nurses: join us",
    "Talk to us",
  ]);
  await line.getByRole("link", { name: "Why Al Hidaya" }).click();
  await expect(page).toHaveURL(/#values$/);
  await expect(page.getByRole("heading", { level: 2, name: "Why Al Hidaya" })).toBeInViewport();
});

test("Home passes axe", async ({ page }) => {
  await page.goto("/");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
});

test("the site's own typeface loads, from the site itself (plan D61, §22.4)", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(new URL(request.url()).host);
  });
  await page.goto("/");

  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((face) => face.status === "loaded").map((face) => face.family);
  });
  expect(loaded.some((family) => family.toLowerCase().includes("atkinson"))).toBe(true);
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
