import { UI_TEXT } from "@/constants/messages";
import { getJobShareImage } from "@/features/careers/api";
import { SHARE_IMAGE_SIZE } from "@/lib/seo/share-image";

export const alt = UI_TEXT.siteName;
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

/** An application page's share picture (plan §19): the job's own. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return getJobShareImage((await params).slug);
}
