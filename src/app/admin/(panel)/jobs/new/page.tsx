import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { JobEditor } from "@/features/careers/components/JobEditor";

export const metadata: Metadata = { title: ADMIN_TEXT.jobTitle(ADMIN_TEXT.newJob) };

/** A new job, made on its first save (D92). */
export default function NewJob() {
  return <JobEditor id={null} />;
}
