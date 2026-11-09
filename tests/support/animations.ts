import type { Page } from "@playwright/test";

/**
 * Waits for the page's finite animations (a page opening in, words rising) to end, so a scan sees
 * the page at rest. Endless loops (the clients' rows, a typewriter) are left running.
 */
export async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}
