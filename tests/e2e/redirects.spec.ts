import { expect, test } from "@playwright/test";

import { OLD_SITE_REDIRECTS } from "@/constants/redirects";

test.describe("the current site's addresses move for good (plan §5.3)", () => {
  for (const { source, destination } of OLD_SITE_REDIRECTS) {
    const from = source.replace(":slug*", "wound-care");
    test(`${from} → ${destination}`, async ({ request }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "one pass is enough: there is no page to lay out");
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers().location).toBe(destination);
    });
  }
});
