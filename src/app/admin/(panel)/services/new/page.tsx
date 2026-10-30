import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ServiceEditor } from "@/features/services/components/ServiceEditor";

export const metadata: Metadata = { title: ADMIN_TEXT.serviceTitle(ADMIN_TEXT.newService) };

/** A new service, made on its first save (D92). */
export default function NewService() {
  return <ServiceEditor id={null} />;
}
