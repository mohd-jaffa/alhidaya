import type { Metadata } from "next";
import { headers } from "next/headers";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ProfileScreen } from "@/features/auth/components/ProfileScreen";
import { getAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: ADMIN_TEXT.profile };

/** The signed-in admin's profile (D115); the panel's layout has already checked the session. */
export default async function Profile() {
  const admin = (await getAdminSession(await headers()))!;
  return <ProfileScreen name={admin.name} email={admin.email} />;
}
