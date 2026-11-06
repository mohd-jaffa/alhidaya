import type { Metadata } from "next";

import { siteFontVariables } from "@/app/site-fonts";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { FontManager } from "@/features/settings/components/FontManager";

export const metadata: Metadata = { title: ADMIN_TEXT.fontManager };
export default function Fonts() {
  return (
    <div className={siteFontVariables}>
      <FontManager />
    </div>
  );
}
