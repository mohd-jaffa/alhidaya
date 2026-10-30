import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ApplicationsScreen } from "@/features/careers/components/ApplicationsScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.applications };

type Params = Promise<Record<"status" | "job" | "q" | "page", string | string[] | undefined>>;

/** The applications inbox (plan §9.5). */
export default async function Applications({ searchParams }: { searchParams: Params }) {
  return <ApplicationsScreen searchParams={await searchParams} />;
}
