import { expect, type Page } from "@playwright/test";

import { UI_TEXT } from "@/constants/messages";
import { droppedFrameRatio, PERFORMANCE_PROFILE } from "@tests/support/performance";

interface Probe {
  events: { id: number; duration: number; name: string; target: string; inputDelay: number; processing: number }[];
  tasks: { start: number; duration: number; name: string }[];
  frames: number[];
  shifts: {
    start: number;
    value: number;
    sources: { node: string; before: DOMRectReadOnly; after: DOMRectReadOnly }[];
  }[];
  scrolling: boolean;
}

declare global {
  interface Window {
    performanceProbe: Probe;
  }
}

/** Observers are test-only; no performance library or analytics is shipped to visitors. */
export async function observePerformance(page: Page, mobile: boolean): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: mobile ? PERFORMANCE_PROFILE.cpuSlowdownMultiplier : 1 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: PERFORMANCE_PROFILE.rttMs,
    downloadThroughput: (PERFORMANCE_PROFILE.downloadThroughputKbps * 1000) / 8,
    uploadThroughput: (PERFORMANCE_PROFILE.uploadThroughputKbps * 1000) / 8,
  });
  await page.addInitScript(() => {
    const probe: Probe = { events: [], tasks: [], frames: [], shifts: [], scrolling: false };
    window.performanceProbe = probe;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const event = entry as PerformanceEventTiming & { interactionId: number };
        if (event.interactionId)
          probe.events.push({
            id: event.interactionId,
            duration: event.duration,
            name: event.name,
            target: event.target instanceof Element ? event.target.outerHTML.slice(0, 180) : "",
            inputDelay: event.processingStart - event.startTime,
            processing: event.processingEnd - event.processingStart,
          });
      }
    }).observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        probe.tasks.push({ start: entry.startTime, duration: entry.duration, name: entry.name });
      }
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
          sources: { node: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[];
        };
        if (!shift.hadRecentInput)
          probe.shifts.push({
            start: entry.startTime,
            value: shift.value,
            sources: shift.sources.map((source) => ({
              node:
                source.node instanceof Element ? source.node.outerHTML.slice(0, 200) : (source.node?.nodeName ?? ""),
              before: source.previousRect.toJSON(),
              after: source.currentRect.toJSON(),
            })),
          });
      }
    }).observe({ type: "layout-shift", buffered: true });
    const frame = (time: number) => {
      if (probe.scrolling) probe.frames.push(time);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

export async function settlePage(page: Page, route: string): Promise<void> {
  // Lighthouse opens a separate target. Event Timing must measure a foreground, painting document.
  await page.bringToFront();
  await page.goto(route);
  expect(await page.evaluate(() => document.visibilityState)).toBe("visible");
  await expect(page.locator("main")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  // The engine loads in an idle callback (timeout 2 s); this exercises the enhanced page.
  await page.waitForTimeout(2500);
}

/** Menu and real form fields exercise hydration, dialogs and the delayed validation import. No submission. */
export async function interact(page: Page): Promise<void> {
  await page.getByRole("button", { name: UI_TEXT.menu, exact: true }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: UI_TEXT.close, exact: true }).tap();
  for (const field of await page.locator("main").getByRole("textbox").all()) {
    if (!(await field.isVisible()) || !(await field.isEditable())) continue;
    await field.tap();
    await field.pressSequentially("Test", { delay: 80 });
    await field.press("Tab");
  }
  await page.waitForTimeout(300);
}

export async function scrollPerformance(page: Page, mobile: boolean) {
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(750);
  const baseline = await page.evaluate(async () => {
    const frames: number[] = [];
    await new Promise<void>((resolve) => {
      const frame = (time: number) => {
        frames.push(time);
        if (frames.length < 40) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    const intervals = frames
      .slice(1)
      .map((time, index) => time - frames[index])
      .sort((a, b) => a - b);
    return intervals[Math.floor(intervals.length / 2)];
  });
  const start = await page.evaluate(() => {
    window.performanceProbe.frames = [];
    window.performanceProbe.scrolling = true;
    return performance.now();
  });
  const viewport = page.viewportSize()!;
  const distance = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  // Native touch gestures on mobile, wheel gestures through Lenis on desktop.
  await cdp.send("Input.synthesizeScrollGesture", {
    x: Math.round(viewport.width / 2),
    y: Math.round(viewport.height / 2),
    // Travel beyond the document's last pixel, like a continuing human swipe.
    // A gesture of exactly the nominal range can stop short after touch rounding/inertia.
    yDistance: -(distance + viewport.height),
    speed: 650,
    gestureSourceType: mobile ? "touch" : "mouse",
  });
  await page.waitForTimeout(750);
  const end = await page.evaluate(() => {
    window.performanceProbe.scrolling = false;
    return performance.now();
  });
  // Observer delivery follows the task; collect after the final frame too.
  await page.waitForTimeout(200);
  const data = await page.evaluate(() => ({
    ...window.performanceProbe,
    interactionCount: (performance as Performance & { interactionCount: number }).interactionCount,
    reachedBottom: scrollY + innerHeight >= document.documentElement.scrollHeight - 3,
  }));
  expect(data.reachedBottom, "the performance trace must cover the whole page").toBe(true);
  const interactions = [...new Set(data.events.map((event) => event.id))].map((id) =>
    Math.max(...data.events.filter((event) => event.id === id).map((event) => event.duration)),
  );
  interactions.sort((a, b) => b - a);
  // The longest interaction minus one outlier for each 50 interactions (INP). Values under 16 ms
  // are not observable here; report their upper bound rather than claiming a zero-ms interaction.
  const inpUpperBound = interactions[Math.floor(data.interactionCount / 50)] ?? 16;
  const tasks = data.tasks.filter((task) => task.start < end && task.start + task.duration > start);
  let cls = 0;
  let session = 0;
  let first = 0;
  let last = 0;
  for (const shift of data.shifts) {
    session = shift.start - last < 1000 && shift.start - first < 5000 ? session + shift.value : shift.value;
    if (session === shift.value) first = shift.start;
    last = shift.start;
    cls = Math.max(cls, session);
  }
  return {
    inpUpperBound,
    interactionCount: data.interactionCount,
    interactions,
    slowEvents: data.events.filter((event) => event.duration > 150),
    cls,
    shifts: data.shifts,
    scrollLongTasks: tasks,
    maxScrollTask: Math.max(0, ...tasks.map((task) => task.duration)),
    droppedFrameRatio: droppedFrameRatio(
      data.frames.slice(1).map((time, i) => time - data.frames[i]),
      baseline,
    ),
    refreshInterval: baseline,
    frameCount: data.frames.length,
  };
}
