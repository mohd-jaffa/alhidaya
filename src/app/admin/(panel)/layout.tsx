import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { getAdminSession } from "@/lib/auth/session";

/**
 * Every admin screen but signing in (plan §26.1): the session is checked on
 * the server for each page, not only the cookie the proxy saw; without one,
 * sign in.
 */
export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await getAdminSession(await headers());
  if (!admin) redirect(ADMIN_ROUTES.login);
  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
