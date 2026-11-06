import { writeFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { PERFORMANCE_BUDGET as BUDGET } from "@tests/support/performance";
import { observePerformance, scrollPerformance, settlePage } from "@tests/support/performance-browser";
import { PUBLIC_PERFORMANCE_ROUTES } from "@tests/support/performance-routes";

for (const route of PUBLIC_PERFORMANCE_ROUTES) {
  test(`${route} scrolls without long tasks or missed frame budget (§31)`, async ({ page }, testInfo) => {
    await observePerformance(page, false);
    await settlePage(page, route);
    const runtime = await scrollPerformance(page, false);
    await writeFile(testInfo.outputPath("desktop-scroll.json"), JSON.stringify({ route, runtime }, null, 2));
    await testInfo.attach("desktop-scroll", { path: testInfo.outputPath("desktop-scroll.json") });
    console.log(JSON.stringify({ route, desktopScroll: runtime }));
    expect(runtime.frameCount, "nonempty full-page frame sample").toBeGreaterThan(30);
    expect.soft(runtime.maxScrollTask, "longest desktop scroll task, ms").toBeLessThanOrEqual(BUDGET.longTask);
    expect.soft(runtime.cls, "desktop CLS including scrolling").toBeLessThanOrEqual(BUDGET.cls);
    expect.soft(runtime.droppedFrameRatio, "missed vsync estimate (rAF cadence)").toBeLessThan(BUDGET.droppedFrames);
  });
}
