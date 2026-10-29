import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheLine } from "@/components/motion/TheLine";
import { pageStations } from "@/components/sections/anchors";
import { PageSections } from "@/components/sections/PageSections";
import { getPageMetadata, getPublishedPageContent } from "@/features/content/api";
import { contentView } from "@/lib/content/view";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("HOME");
}

/**
 * Home (plan §6.1, §30.1): the sign with the three lines beneath it, then
 * each section a station on the deep-blue line.
 */
export default async function Home() {
  const content = await getPublishedPageContent("HOME", await contentView());
  if (!content) notFound();
  const { document, data } = content;
  return (
    <>
      <TheLine stations={pageStations("HOME", document.sections, data)} tone="deep" />
      <PageSections page="HOME" sections={document.sections} data={data} />
    </>
  );
}
