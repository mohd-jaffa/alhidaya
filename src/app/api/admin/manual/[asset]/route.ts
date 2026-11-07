import { manualVideoResponse } from "@/features/settings/manual-video";
import { withAdminRoute } from "@/lib/api/admin";

export function GET(request: Request, { params }: { params: Promise<{ asset: string }> }) {
  return withAdminRoute(request, async ({ requestId }) =>
    manualVideoResponse((await params).asset, request, requestId),
  );
}
