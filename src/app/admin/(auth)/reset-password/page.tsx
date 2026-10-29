import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ResetPasswordScreen } from "@/features/auth/components/ResetPasswordScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.resetTitle };

/** A new password from the emailed link (plan §26.4). */
export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordScreen token={typeof token === "string" && token ? token : null} />;
}
