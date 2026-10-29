import { connection } from "next/server";

import { UI_TEXT } from "@/constants/messages";
import { getPageShareImage } from "@/features/content/api";
import { SHARE_IMAGE_SIZE } from "@/lib/seo/share-image";

export const alt = UI_TEXT.siteName;
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

/** The page's share picture (plan §19), drawn from what is published when it is asked for. */
export default async function Image() {
  await connection();
  return getPageShareImage("QUOTE");
}
