import { readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

/** Plan §31. KiB is used consistently with the original D65 measurements. */
export const PERFORMANCE_BUDGET = {
  initialJavaScript: 170 * 1024,
  lcp: 2000,
  inp: 150,
  cls: 0.05,
  longTask: 50,
  droppedFrames: 0.05,
  lighthouse: 0.95,
} as const;

/** Android lab profile: 4× CPU, Fast 4G (40 ms RTT, 9,216 Kbps down, 1,536 Kbps up). */
export const PERFORMANCE_PROFILE = {
  cpuSlowdownMultiplier: 4,
  rttMs: 40,
  throughputKbps: 9 * 1024,
  requestLatencyMs: 40,
  downloadThroughputKbps: 9 * 1024,
  uploadThroughputKbps: 1.5 * 1024,
};

/** Only scripts declared in the HTML: modern browsers do not load noModule polyfills. */
export function initialScripts(html: string): string[] {
  const urls = new Set<string>();
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bnomodule\b/i.test(attributes)) continue;
    const src = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (src?.startsWith("/_next/static/")) urls.add(new URL(src, "http://localhost").pathname);
    // Next's streamed payload also declares initial boundary chunks without a literal script tag.
    // They are not motion and must not disappear from the budget just because they arrive via Flight.
    if (!src && /\bself\.__next_f\.push\(/.test(body)) {
      for (const match of body.matchAll(/\/_next\/static\/[^"'\\\s<>]+\.js\b/g)) urls.add(match[0]);
    }
  }
  return [...urls];
}

export async function scriptBytes(urls: string[]): Promise<{ total: number; files: { url: string; gzip: number }[] }> {
  const files = await Promise.all(
    urls.map(async (url) => ({
      url,
      gzip: gzipSync(await readFile(path.join(".next", url.slice("/_next/".length)))).length,
    })),
  );
  return { total: files.reduce((sum, file) => sum + file.gzip, 0), files };
}

/** Approximate missed vsyncs, calibrated to this browser's measured refresh interval. */
export function droppedFrameRatio(intervals: number[], baseline: number): number {
  const missed = intervals.reduce((sum, interval) => sum + Math.max(0, Math.round(interval / baseline) - 1), 0);
  return missed / (intervals.length + missed);
}
