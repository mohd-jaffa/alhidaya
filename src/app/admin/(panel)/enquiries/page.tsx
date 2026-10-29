import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { EnquiriesScreen } from "@/features/enquiries/components/EnquiriesScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.enquiries };

type Params = Promise<Record<"status" | "form" | "q" | "page", string | string[] | undefined>>;

/** The enquiries inbox (plan §10.5). */
export default async function Enquiries({ searchParams }: { searchParams: Params }) {
  return <EnquiriesScreen searchParams={await searchParams} />;
}
