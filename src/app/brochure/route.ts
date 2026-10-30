import { getBrochureUrl } from "@/features/settings/api";

/**
 * The brochure's one address (plan §12, D94): it sends a visitor on to the
 * published PDF, whichever it is now, so the address never changes; with no
 * brochure published, there is nothing here.
 */
export async function GET() {
  const url = await getBrochureUrl();
  return url
    ? new Response(null, { status: 307, headers: { location: url, "cache-control": "no-store" } })
    : new Response(null, { status: 404, headers: { "cache-control": "no-store" } });
}
