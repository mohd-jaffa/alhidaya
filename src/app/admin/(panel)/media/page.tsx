import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { MediaScreen } from "@/features/media/components/MediaScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.media };

/** The media library: its images, uploaded, described and deleted (D93). */
export default function Media() {
  return <MediaScreen />;
}
