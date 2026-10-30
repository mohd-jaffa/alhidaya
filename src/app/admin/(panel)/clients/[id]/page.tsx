import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ClientEditor } from "@/features/clients/components/ClientEditor";

export const metadata: Metadata = { title: ADMIN_TEXT.clientTitle(ADMIN_TEXT.editClient) };

/** A client logo's editor (D92); one the site does not hold says so where its form would be. */
export default async function Client({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientEditor key={id} id={id} />;
}
