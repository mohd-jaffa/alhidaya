import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ServicesScreen } from "@/features/services/components/ServicesScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.services };

/** The services in their order, each opening its editor (D92). */
export default function Services() {
  return <ServicesScreen />;
}
