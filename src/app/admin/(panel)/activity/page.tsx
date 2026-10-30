import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ActivityScreen } from "@/features/activity/components/ActivityScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.activity };

type Params = Promise<Record<"kind" | "page", string | string[] | undefined>>;

/** Activity: the admin's changes, a day at a time (D96). */
export default async function Activity({ searchParams }: { searchParams: Params }) {
  return <ActivityScreen searchParams={await searchParams} />;
}
