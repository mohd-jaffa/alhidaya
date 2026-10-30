import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { findJobToApply, getApplyMetadata } from "@/features/careers/api";
import { ApplyPage } from "@/features/careers/components/ApplyPage";
import { contentView } from "@/lib/content/view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getApplyMetadata((await params).slug);
}

/**
 * Apply for a job (plan §9.3): an address it had before moves on for good; a
 * closed job sends the visitor to its page, which says so (§6.6).
 */
export default async function ApplyForJob({ params }: Props) {
  const job = await findJobToApply((await params).slug, await contentView());
  if (!job) notFound();
  if ("movedTo" in job) permanentRedirect(ROUTES.applyForJob(job.movedTo));
  if (!job.open) redirect(ROUTES.job(job.published.slug));
  return <ApplyPage job={job} />;
}
