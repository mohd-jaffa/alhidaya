import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PagesScreen } from "@/features/content/components/PagesScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.pages };

/** The eight pages, each with where it stands (D88). */
export default function Pages() {
  return <PagesScreen />;
}
