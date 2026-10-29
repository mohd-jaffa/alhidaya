import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheLine } from "@/components/motion/TheLine";
import { pageStations } from "@/components/sections/anchors";
import { PageSections } from "@/components/sections/PageSections";
import { getPageMetadata, getPublishedPageContent } from "@/features/content/api";
import { contentView } from "@/lib/content/view";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("CAREERS");
}

/** Careers (plan §6.5): the sign, the open jobs or the empty state, the general application, on the nurses' line. */
export default async function Careers() {
  const content = await getPublishedPageContent("CAREERS", await contentView());
  if (!content) notFound();
  const { document, data } = content;
  return (
    <>
      <TheLine stations={pageStations("CAREERS", document.sections, data)} tone="leaf" />
      <PageSections page="CAREERS" sections={document.sections} data={data} />
    </>
  );
}
