import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { EnquiriesScreen } from "@/features/enquiries/components/EnquiriesScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.enquiries };

type Params = Promise<Record<"status" | "form" | "q" | "page", string | string[] | undefined>>;

/** One enquiry, open in the inbox: where the alert email's link leads (plan §10.4). */
export default async function Enquiry({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Params;
}) {
  return <EnquiriesScreen searchParams={await searchParams} open={(await params).id} />;
}
