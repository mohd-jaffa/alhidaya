import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ClientEditor } from "@/features/clients/components/ClientEditor";

export const metadata: Metadata = { title: ADMIN_TEXT.clientTitle(ADMIN_TEXT.newClient) };

/** A new client logo, made on its first save (D92). */
export default function NewClient() {
  return <ClientEditor id={null} />;
}
