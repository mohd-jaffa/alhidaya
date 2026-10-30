import { UI_TEXT } from "@/constants/messages";
import { getGeneralApplicationShareImage } from "@/features/careers/api";
import { SHARE_IMAGE_SIZE } from "@/lib/seo/share-image";

export const alt = UI_TEXT.siteName;
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

/** The general application's share picture (plan §19). */
export default function Image() {
  return getGeneralApplicationShareImage();
}
