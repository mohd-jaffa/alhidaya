import { writeFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import lighthouse from "lighthouse";

import { ROUTES } from "@/constants/routes";
import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { interact, observePerformance, scrollPerformance, settlePage } from "@tests/support/performance-browser";
import { MISSING_PERFORMANCE_ROUTE, PUBLIC_PERFORMANCE_ROUTES } from "@tests/support/performance-routes";
import {
  initialScripts,
  PERFORMANCE_BUDGET as BUDGET,
  PERFORMANCE_PROFILE,
  scriptBytes,
} from "@tests/support/performance";

for (const route of PUBLIC_PERFORMANCE_ROUTES) {
  test(`${route} stays inside the public performance budgets (§31)`, async ({ page, request }, testInfo) => {
    // This first response warms only the server's published-content cache, not browser assets.
    const answer = await request.get(route);
    const missing = route === MISSING_PERFORMANCE_ROUTE;
    expect(answer.status()).toBe(missing ? 404 : 200);
    const html = await answer.text();
    await writeFile(testInfo.outputPath("page.html"), html);
    const initial = await scriptBytes(initialScripts(html));
    expect(initial.files.length).toBeGreaterThan(0);
    expect.soft(initial.total, "initial modern JavaScript, gzip bytes").toBeLessThanOrEqual(BUDGET.initialJavaScript);

    // Application and missing pages intentionally opt out of indexing.
    const noindex = route === ROUTES.applyGeneral || route.endsWith("/apply") || missing;
    const result = await lighthouse(`${E2E_ORIGIN}${route}`, {
      port: 9224,
      output: ["json", "html"],
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      throttling: PERFORMANCE_PROFILE,
      throttlingMethod: "simulate",
      ...(noindex ? { skipAudits: ["is-crawlable", ...(missing ? ["http-status-code"] : [])] } : {}),
      // Only this deliberate missing page may answer 404; all published pages must answer 200.
      ...(missing ? { ignoreStatusCode: true } : {}),
    });
    if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError));
    const { lhr } = result;
    const initialSet = new Set(initial.files.map((file) => file.url));
    const networkDetails = lhr.audits["network-requests"].details;
    const deferredUrls = [
      ...new Set(
        (networkDetails?.type === "table" ? networkDetails.items : []).flatMap((item) => {
          const url = new URL(String(item.url));
          return url.origin === E2E_ORIGIN &&
            url.pathname.startsWith("/_next/static/") &&
            url.pathname.endsWith(".js") &&
            !initialSet.has(url.pathname)
            ? [url.pathname]
            : [];
        }),
      ),
    ];
    const deferred = await scriptBytes(deferredUrls);
    const summary = {
      route,
      profile: PERFORMANCE_PROFILE,
      initial,
      deferred,
      lcp: lhr.audits["largest-contentful-paint"].numericValue,
      cls: lhr.audits["cumulative-layout-shift"].numericValue,
      categories: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, value.score])),
      intentionalExceptions: [
        ...(noindex ? ["is-crawlable: this page is intentionally noindex"] : []),
        ...(missing ? ["http-status-code: the missing-page template must return 404"] : []),
      ],
    };
    await writeFile(testInfo.outputPath("summary.json"), JSON.stringify(summary, null, 2));
    await writeFile(testInfo.outputPath("lighthouse.json"), result.report[0]);
    await writeFile(testInfo.outputPath("lighthouse.html"), result.report[1]);
    await testInfo.attach("performance-summary", { path: testInfo.outputPath("summary.json") });
    console.log(JSON.stringify(summary));
    expect.soft(summary.lcp, "mobile lab LCP, ms").toBeLessThanOrEqual(BUDGET.lcp);
    expect.soft(summary.cls, "mobile lab CLS").toBeLessThanOrEqual(BUDGET.cls);
    for (const [category, score] of Object.entries(summary.categories)) {
      expect.soft(score, `Lighthouse ${category}`).toBeGreaterThanOrEqual(BUDGET.lighthouse);
    }

    // Runtime interactions and scrolling are measured separately from Lighthouse navigation.
    await observePerformance(page, true);
    await settlePage(page, route);
    await interact(page);
    const runtime = await scrollPerformance(page, true);
    await writeFile(testInfo.outputPath("runtime.json"), JSON.stringify(runtime, null, 2));
    await testInfo.attach("runtime-performance", { path: testInfo.outputPath("runtime.json") });
    console.log(JSON.stringify({ route, runtime }));
    expect(runtime.frameCount, "nonempty full-page touch scroll sample").toBeGreaterThan(30);
    expect(runtime.interactionCount, "real interactions were observed").toBeGreaterThan(0);
    expect.soft(runtime.inpUpperBound, "scripted-interaction INP upper bound, ms").toBeLessThanOrEqual(BUDGET.inp);
    expect.soft(runtime.cls, "CLS including the full-page scroll").toBeLessThanOrEqual(BUDGET.cls);
    expect
      .soft(runtime.maxScrollTask, "longest task during full-page touch scroll, ms")
      .toBeLessThanOrEqual(BUDGET.longTask);
  });
}
