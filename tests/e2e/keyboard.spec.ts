import { expect, test } from "@playwright/test";

import { ROUTES } from "@/constants/routes";
import { GOOGLE_MAPS } from "@/constants/site";

/**
 * The keyboard's way through the public pages (plan §32, AGENTS.md §18,
 * R6B.5): every stop the Tab key reaches is on the page and shows its focus
 * ring. Google's map draws its own focus while the walk continues through
 * that frame; it ends at the bot check's frame, which draws its own.
 */
const STOPS = 40;

for (const path of [
  ROUTES.home,
  ROUTES.services,
  ROUTES.service("home-nursing-care"),
  ROUTES.careers,
  ROUTES.contact,
]) {
  test(`every stop on ${path} shows where the keyboard is`, async ({ page }) => {
    await page.goto(path);
    let visited = 0;
    for (let stop = 0; stop < STOPS; stop++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate((mapsEmbed) => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body) return { done: true } as const;
        if (element.tagName === "IFRAME") {
          if (element.getAttribute("src")?.startsWith(mapsEmbed)) return { done: false, external: true } as const;
          return { done: true } as const;
        }
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return {
          done: false,
          name: `${element.tagName.toLowerCase()} ${element.textContent?.trim().slice(0, 40) ?? ""}`,
          ring: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
          drawn: box.width > 0 && box.height > 0,
        } as const;
      }, GOOGLE_MAPS.embed);
      if (focused.done) break;
      if ("external" in focused) continue;
      expect(focused.ring, `focus ring on ${focused.name}`).toBe(true);
      expect(focused.drawn, `${focused.name} is drawn`).toBe(true);
      visited++;
    }
    // The skip link, the header's links and the page's own actions at least.
    expect(visited).toBeGreaterThanOrEqual(8);
  });
}
