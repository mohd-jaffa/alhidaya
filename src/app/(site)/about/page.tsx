import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheLine } from "@/components/motion/TheLine";
import { pageStations } from "@/components/sections/anchors";
import { PageSections } from "@/components/sections/PageSections";
import { getPageMetadata, getPublishedPageContent } from "@/features/content/api";
import { contentView } from "@/lib/content/view";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ABOUT");
}

/** About (plan §6.2): the sign, who we are, mission and vision, values, clients and the contact band. */
export default async function About() {
  const content = await getPublishedPageContent("ABOUT", await contentView());
  if (!content) notFound();
  const { document, data } = content;
  return (
    <>
      <TheLine stations={pageStations("ABOUT", document.sections, data)} tone="deep" />
      <PageSections page="ABOUT" sections={document.sections} data={data} />
    </>
  );
}
