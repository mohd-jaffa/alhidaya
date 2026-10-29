import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageSections } from "@/components/sections/PageSections";
import { PAGE_NAMES } from "@/constants/messages";
import { getPublishedPageContent } from "@/features/content/api";

export const metadata: Metadata = { title: PAGE_NAMES.PRIVACY };

/** The privacy notice (plan §6.9): the admin's text, drafted from what the site actually does (Q18). */
export default async function Privacy() {
  const content = await getPublishedPageContent("PRIVACY");
  if (!content) notFound();
  const { document, data } = content;
  // One run of text: no line of stations, which would only repeat the page's name.
  return <PageSections page="PRIVACY" sections={document.sections} data={data} />;
}
