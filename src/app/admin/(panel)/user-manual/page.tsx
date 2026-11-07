import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { UserManual } from "@/features/settings/components/UserManual";

export const metadata: Metadata = { title: ADMIN_TEXT.userManual };

export default function UserManualPage() {
  return <UserManual />;
}
