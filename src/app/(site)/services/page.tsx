import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheLine } from "@/components/motion/TheLine";
import { pageStations } from "@/components/sections/anchors";
import { PageSections } from "@/components/sections/PageSections";
import { PAGE_NAMES } from "@/constants/messages";
import { getPublishedPageContent } from "@/features/content/api";

export const metadata: Metadata = { title: PAGE_NAMES.SERVICES };

/** Services (plan §6.3): the sign, every service on its line, the staffing offer and the contact band. */
export default async function Services() {
  const content = await getPublishedPageContent("SERVICES");
  if (!content) notFound();
  const { document, data } = content;
  return (
    <>
      <TheLine stations={pageStations("SERVICES", document.sections, data)} tone="deep" />
      <PageSections page="SERVICES" sections={document.sections} data={data} />
    </>
  );
}
