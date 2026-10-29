import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TheLine } from "@/components/motion/TheLine";
import { pageStations } from "@/components/sections/anchors";
import { PageSections } from "@/components/sections/PageSections";
import { getPageMetadata, getPublishedPageContent } from "@/features/content/api";
import { enquiryForms } from "@/features/enquiries/components/EnquiryForms";
import { contentView } from "@/lib/content/view";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("QUOTE");
}

/** Request a Quote (plan §6.8): the sign and the Quote form (§10.1), on the service the visitor came from. */
export default async function RequestAQuote({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const content = await getPublishedPageContent("QUOTE", await contentView());
  if (!content) notFound();
  const { document, data } = content;
  return (
    <>
      <TheLine stations={pageStations("QUOTE", document.sections, data)} tone="deep" />
      <PageSections
        page="QUOTE"
        sections={document.sections}
        data={data}
        forms={enquiryForms(data, (await searchParams).service)}
      />
    </>
  );
}
