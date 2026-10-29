import { expect, test } from "@playwright/test";

import { ROUTES } from "@/constants/routes";
import { SEED_SERVICES } from "@/db/seed/content";

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
});
