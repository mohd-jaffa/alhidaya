import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheLine } from "@/components/motion/TheLine";
import { pageStations } from "@/components/sections/anchors";
import { PageSections } from "@/components/sections/PageSections";
import { getPageMetadata, getPublishedPageContent } from "@/features/content/api";
import { contentView } from "@/lib/content/view";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("SERVICES");
}

/** Services (plan §6.3): the sign, every service on its line, the staffing offer and the contact band. */
export default async function Services() {
  const content = await getPublishedPageContent("SERVICES", await contentView());
  if (!content) notFound();
  const { document, data } = content;
  return (
    <>
      <TheLine stations={pageStations("SERVICES", document.sections, data)} tone="deep" />
      <PageSections page="SERVICES" sections={document.sections} data={data} />
    </>
  );
}
