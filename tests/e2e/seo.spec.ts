import { expect, test } from "@playwright/test";

import { ROUTES } from "@/constants/routes";
import { SEED_SERVICES, SEED_SITE } from "@/db/seed/content";

test.describe("what search engines read (plan §19)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one pass is enough: there is no page to lay out");
  });

  test("robots.txt opens the public site and closes the admin, the API and the kit", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Allow: /");
    for (const path of ["/admin", "/api", "/kit"]) expect(robots).toContain(`Disallow: ${path}`);
    expect(robots).toMatch(/Sitemap: .+\/sitemap\.xml/);
  });

  test("the sitemap lists the pages and every published service", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.headers()["content-type"]).toContain("xml");
    const sitemap = await response.text();
    for (const path of [ROUTES.about, ROUTES.contact, ...SEED_SERVICES.map((service) => ROUTES.service(service.slug))])
      expect(sitemap).toContain(`${path}</loc>`);
  });

  test("each page names its canonical address, and carries the company's structured data", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", SEED_SITE.seo.description.en);
    const business = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "");
    expect(business).toMatchObject({
      "@type": "MedicalBusiness",
      telephone: "+97431306555",
      openingHours: "Mo-Su 00:00-23:59",
    });

    await page.goto(ROUTES.service("elderly-care"));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/services\/elderly-care$/);
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? "{}")["@type"]));
    expect(types.toSorted()).toEqual(["BreadcrumbList", "MedicalBusiness", "Service"]);
  });
});
