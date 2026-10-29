import { UI_TEXT } from "@/constants/messages";
import { getServiceShareImage } from "@/features/services/api";
import { SHARE_IMAGE_SIZE } from "@/lib/seo/share-image";

export const alt = UI_TEXT.siteName;
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

/** A service's share picture (plan §19). */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return getServiceShareImage((await params).slug);
}
