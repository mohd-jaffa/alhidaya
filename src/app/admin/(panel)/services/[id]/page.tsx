import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ServiceEditor } from "@/features/services/components/ServiceEditor";

export const metadata: Metadata = { title: ADMIN_TEXT.serviceTitle(ADMIN_TEXT.editService) };

/** A service's editor (D92); one the site does not hold says so where its form would be. */
export default async function Service({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceEditor key={id} id={id} />;
}
