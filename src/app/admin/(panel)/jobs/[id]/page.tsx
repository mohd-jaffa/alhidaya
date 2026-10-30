import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { JobEditor } from "@/features/careers/components/JobEditor";

export const metadata: Metadata = { title: ADMIN_TEXT.jobTitle(ADMIN_TEXT.editJob) };

/** A job's editor (D92); one the site does not hold says so where its form would be. */
export default async function Job({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobEditor key={id} id={id} />;
}
