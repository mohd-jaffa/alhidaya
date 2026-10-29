import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";

test("Home names the company and passes axe", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(UI_TEXT.siteName);
  await expect(page.getByRole("heading", { level: 1, name: UI_TEXT.siteName })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

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
