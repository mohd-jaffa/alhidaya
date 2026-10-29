import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ForgotPasswordScreen } from "@/features/auth/components/ForgotPasswordScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.forgotTitle };

/** A link to choose a new password (plan §26.4). */
export default function ForgotPassword() {
  return <ForgotPasswordScreen />;
}
