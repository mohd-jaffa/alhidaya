import type { CDPSession, Page } from "@playwright/test";

const sessions = new WeakMap<Page, CDPSession>();

/** Trusted touch input, kept inside the viewport on Linux and macOS Chromium. */
export async function swipe(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
  speed = 650,
): Promise<void> {
  let cdp = sessions.get(page);
  if (!cdp) {
    cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    sessions.set(page, cdp);
    // The page owns the protocol session. Keep emulation stable between swipes;
    // detaching after each swipe can reset pointer media queries during the sample.
    page.once("close", () => sessions.delete(page));
  }
  const steps = Math.max(2, Math.ceil((Math.hypot(to.x - from.x, to.y - from.y) / speed) * 30));
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...from, id: 1 }] });
  for (let step = 1; step <= steps; step++) {
    await page.waitForTimeout(1000 / 30);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps, id: 1 },
      ],
    });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
