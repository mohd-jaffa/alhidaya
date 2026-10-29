import { draftMode } from "next/headers";

import { ROUTES } from "@/constants/routes";
import { withApiHandler } from "@/lib/api/handler";

/** Leaves the preview (plan §14): draft mode off, back to what is published. Anyone may leave; nothing is shown. */
export function GET(request: Request) {
  return withApiHandler(request, async () => {
    (await draftMode()).disable();
    return new Response(null, { status: 303, headers: { location: ROUTES.home, "cache-control": "no-store" } });
  });
}
