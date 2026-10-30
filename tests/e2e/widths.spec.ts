import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { ROUTES } from "@/constants/routes";
import { seedJob } from "@/db/seed/content";

/**
 * Every public page at the widths between the phone and the desktop journeys
 * (plan §32, R6B.5): the smallest phone, a tablet upright and on its side.
 * Nothing scrolls sideways, and axe finds nothing.
 */
const PAGES = [
  ROUTES.home,
  ROUTES.about,
  ROUTES.services,
  ROUTES.service("home-nursing-care"),
  ROUTES.careers,
  ROUTES.job(seedJob("2026-10-01").slug),
  ROUTES.applyGeneral,
  ROUTES.contact,
  ROUTES.quote,
  ROUTES.privacy,
  ROUTES.terms,
];

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the widths are set here, so once is enough");
});

for (const width of [320, 768, 1024]) {
  test(`every public page fits ${width} px and passes axe`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of PAGES) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), path).toBe(0);
      expect((await new AxeBuilder({ page }).analyze()).violations, path).toEqual([]);
    }
  });
}
