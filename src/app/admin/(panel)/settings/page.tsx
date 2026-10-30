import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { SettingsEditor } from "@/features/settings/components/SettingsEditor";

export const metadata: Metadata = { title: ADMIN_TEXT.settings };

/** The site's content in one editor (D94). */
export default function Settings() {
  return <SettingsEditor />;
}
