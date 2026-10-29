import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageSections } from "@/components/sections/PageSections";
import { getPageMetadata, getPublishedPageContent } from "@/features/content/api";
import { contentView } from "@/lib/content/view";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("TERMS");
}

/** The terms of use (plan §6.9): the admin's text (Q18). */
export default async function Terms() {
  const content = await getPublishedPageContent("TERMS", await contentView());
  if (!content) notFound();
  const { document, data } = content;
  // One run of text: no line of stations, which would only repeat the page's name.
  return <PageSections page="TERMS" sections={document.sections} data={data} />;
}
