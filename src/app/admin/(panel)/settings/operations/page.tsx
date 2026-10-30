import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { OperationsScreen } from "@/features/settings/components/OperationsScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.operations };

/** How the site runs: recipients, keeping periods, the server's room (D95). */
export default function Operations() {
  return <OperationsScreen />;
}
