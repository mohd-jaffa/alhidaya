// The admin manual's lesson videos, served from disk with range support.
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ADMIN_MANUAL } from "@/constants/admin-messages";
import { notFoundError } from "@/lib/errors";

const assets = new Set<string>(
  ADMIN_MANUAL.flatMap((category) => category.lessons.flatMap((lesson) => [`${lesson.id}.mp4`, `${lesson.id}.vtt`])),
);

/** Small, fixed lesson files only; no uploaded or caller-chosen filesystem paths. */
export async function manualVideoResponse(asset: string, request: Request, requestId: string): Promise<Response> {
  if (!assets.has(asset)) throw notFoundError("NOT_FOUND");
  const bytes = await readFile(path.join(process.cwd(), "resources", "admin-manual", asset));
  const headers = new Headers({
    "Content-Type": asset.endsWith(".vtt") ? "text/vtt; charset=utf-8" : "video/mp4",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "x-request-id": requestId,
    "Accept-Ranges": "bytes",
  });
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start = match?.[1] ? Number(match[1]) : Math.max(0, bytes.length - Number(match?.[2]));
    const end = match?.[1] && match[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
    if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || start > end || start >= bytes.length) {
      headers.set("Content-Range", `bytes */${bytes.length}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${bytes.length}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(new Uint8Array(bytes.subarray(start, end + 1)), { status: 206, headers });
  }
  headers.set("Content-Length", String(bytes.length));
  return new Response(new Uint8Array(bytes), { headers });
}
