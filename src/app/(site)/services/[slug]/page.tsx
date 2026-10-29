import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { getPublishedServicePage, getServiceMetadata } from "@/features/services/api";
import { ServicePage } from "@/features/services/components/ServicePage";
import { contentView } from "@/lib/content/view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getServiceMetadata((await params).slug);
}

/** A service (plan §6.4); an address it had before moves on to the current one for good (§8). */
export default async function Service({ params }: Props) {
  const page = await getPublishedServicePage((await params).slug, await contentView());
  if (!page) notFound();
  if ("movedTo" in page) permanentRedirect(ROUTES.service(page.movedTo));
  return <ServicePage {...page} />;
}
