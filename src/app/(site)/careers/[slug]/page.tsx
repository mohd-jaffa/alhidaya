import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { getJobMetadata, getPublishedJobPage } from "@/features/careers/api";
import { JobPage } from "@/features/careers/components/JobPage";
import { contentView } from "@/lib/content/view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getJobMetadata((await params).slug);
}

/** A job (plan §6.6), open or closed; an address it had before moves on to the current one for good. */
export default async function Job({ params }: Props) {
  const page = await getPublishedJobPage((await params).slug, await contentView());
  if (!page) notFound();
  if ("movedTo" in page) permanentRedirect(ROUTES.job(page.movedTo));
  return <JobPage {...page} />;
}
