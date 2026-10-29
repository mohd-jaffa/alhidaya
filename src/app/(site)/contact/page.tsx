import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheLine } from "@/components/motion/TheLine";
import { pageStations } from "@/components/sections/anchors";
import { PageSections } from "@/components/sections/PageSections";
import { PAGE_NAMES } from "@/constants/messages";
import { getPublishedPageContent } from "@/features/content/api";

export const metadata: Metadata = { title: PAGE_NAMES.CONTACT };

/** Contact (plan §6.7): the sign, every way to reach the company, and the Contact form (R4.1). */
export default async function Contact() {
  const content = await getPublishedPageContent("CONTACT");
  if (!content) notFound();
  const { document, data } = content;
  return (
    <>
      <TheLine stations={pageStations("CONTACT", document.sections, data)} tone="deep" />
      <PageSections page="CONTACT" sections={document.sections} data={data} />
    </>
  );
}
