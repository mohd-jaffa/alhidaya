import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageSections } from "@/components/sections/PageSections";
import { getPageMetadata, getPublishedPageContent } from "@/features/content/api";
import { enquiryForms } from "@/features/enquiries/components/EnquiryForms";
import { contentView } from "@/lib/content/view";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("HOME");
}

/**
 * Home (plan §6.1, §30.1, D97): the hero, the statement, the highlights, the
 * two audiences, how it works and the Contact form (D104), in the admin's
 * order.
 */
export default async function Home() {
  const content = await getPublishedPageContent("HOME", await contentView());
  if (!content) notFound();
  const { document, data } = content;
  return <PageSections page="HOME" sections={document.sections} data={data} forms={enquiryForms(data)} />;
}
