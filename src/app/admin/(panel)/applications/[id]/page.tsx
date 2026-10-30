import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ApplicationsScreen } from "@/features/careers/components/ApplicationsScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.applications };

type Params = Promise<Record<"status" | "job" | "q" | "page", string | string[] | undefined>>;

/** One application, open in the inbox: where the HR email's link leads (plan §9.3). */
export default async function Application({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Params;
}) {
  return <ApplicationsScreen searchParams={await searchParams} open={(await params).id} />;
}
