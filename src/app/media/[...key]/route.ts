import { getServerEnv } from "@/lib/env/server";
import { readMediaFile } from "@/lib/storage/media";

const NOT_FOUND = () => new Response(null, { status: 404 });

/**
 * The media folder served by the app itself, locally and in the browser
 * tests only (`SERVE_MEDIA`): on the server Apache serves it (plan §21.3) and
 * this answers 404. Only keys the app made are read; each file is served
 * with its own type, never sniffed, and cached for a year (its name never
 * changes).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if (!getServerEnv().SERVE_MEDIA) return NOT_FOUND();
  try {
    const { bytes, mime } = await readMediaFile((await params).key.join("/"));
    return new Response(bytes, {
      headers: {
        "content-type": mime,
        "x-content-type-options": "nosniff",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NOT_FOUND();
  }
}
