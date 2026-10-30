import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { JobsScreen } from "@/features/careers/components/JobsScreen";

export const metadata: Metadata = { title: ADMIN_TEXT.jobs };

/** The jobs grouped by where they stand, each opening its editor (D92). */
export default function Jobs() {
  return <JobsScreen />;
}
