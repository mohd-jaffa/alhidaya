import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheLine } from "@/components/motion/TheLine";
import { pageStations } from "@/components/sections/anchors";
import { PageSections } from "@/components/sections/PageSections";
import { PAGE_NAMES } from "@/constants/messages";
import { getPublishedPageContent } from "@/features/content/api";

export const metadata: Metadata = { title: PAGE_NAMES.QUOTE };

/** Request a Quote (plan §6.8): the sign and the Quote form (R4.1). */
export default async function RequestAQuote() {
  const content = await getPublishedPageContent("QUOTE");
  if (!content) notFound();
  const { document, data } = content;
  return (
    <>
      <TheLine stations={pageStations("QUOTE", document.sections, data)} tone="deep" />
      <PageSections page="QUOTE" sections={document.sections} data={data} />
    </>
  );
}
