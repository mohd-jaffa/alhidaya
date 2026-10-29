import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";

/** The admin panel (plan §16): never indexed, its pages named under "Website admin". */
export const metadata: Metadata = {
  title: { default: ADMIN_TEXT.admin, template: `%s · ${ADMIN_TEXT.admin}` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
