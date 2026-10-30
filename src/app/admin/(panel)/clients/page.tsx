import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ClientsScreen } from "@/features/clients/components/ClientsScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.clients };

/** The client logos in their order, each opening its editor (D92). */
export default function Clients() {
  return <ClientsScreen />;
}
