import { expect, test } from "@playwright/test";

import { ROUTES } from "@/constants/routes";
import { SEED_SERVICES, SEED_SITE } from "@/db/seed/content";
import { MISSING_PERFORMANCE_ROUTE, PUBLIC_PERFORMANCE_ROUTES } from "@tests/support/performance-routes";

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

  test("each page has a share picture, drawn from its published sign", async ({ page, request }) => {
    for (const path of [ROUTES.home, ROUTES.about, ROUTES.contact, ROUTES.service("elderly-care")]) {
      await page.goto(path);
      const image = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(image, path).toBeTruthy();
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
      const response = await request.get(new URL(image ?? "", page.url()).pathname);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"]).toBe("image/png");
    }
  });

  test("social crawlers receive complete share cards in the HTML head without JavaScript", async ({ request }) => {
    const routes = PUBLIC_PERFORMANCE_ROUTES.filter((path) => path !== MISSING_PERFORMANCE_ROUTE);
    for (const path of routes) {
      const response = await request.get(path, { headers: { "user-agent": "WhatsApp/2.24.1" } });
      expect(response.status(), path).toBe(200);
      const head = (await response.text()).match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
      for (const property of ["title", "description", "url", "image", "image:alt"])
        expect(head, `${path}: og:${property}`).toMatch(new RegExp(`<meta property="og:${property}" content="[^"]+"`));
      expect(head).toContain('<meta property="og:image:width" content="1200"');
      expect(head).toContain('<meta property="og:image:height" content="630"');
      expect(head).toContain('<meta name="twitter:card" content="summary_large_image"');
      expect(head).toMatch(/<meta name="twitter:image" content="https?:\/\//);
      const image = head.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? "";
      expect(image).toMatch(/^https?:\/\//);
      const picture = await request.get(new URL(image).pathname);
      expect(picture.status(), image).toBe(200);
      expect(picture.headers()["content-type"]).toBe("image/png");
      const bytes = await picture.body();
      expect(bytes.readUInt32BE(16)).toBe(1200);
      expect(bytes.readUInt32BE(20)).toBe(630);
      expect(bytes.length).toBeLessThan(300_000);
    }
    for (const agent of [
      "facebookexternalhit/1.1",
      "Twitterbot/1.0",
      "LinkedInBot/1.0",
      "Slackbot-LinkExpanding 1.0",
    ]) {
      const response = await request.get(ROUTES.home, { headers: { "user-agent": agent } });
      expect(response.status(), agent).toBe(200);
      const head = (await response.text()).match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
      expect(head, agent).toContain('<meta property="og:image"');
      expect(head, agent).toContain('<meta property="og:title"');
    }
  });
});
