import type { Metadata } from "next";

import { TodayScreen } from "@/components/admin/TodayScreen";
import { ADMIN_TEXT } from "@/constants/admin-messages";

export const metadata: Metadata = { title: ADMIN_TEXT.today };

/** Today (R6.1): what needs the admin. */
export default async function Today({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[]; page?: string | string[] }>;
}) {
  return <TodayScreen searchParams={await searchParams} />;
}
