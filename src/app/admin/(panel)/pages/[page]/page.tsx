import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PAGE_NAMES } from "@/constants/messages";
import { pageFromSlug } from "@/constants/sections";
import { PageEditor } from "@/features/content/components/PageEditor";

type Params = Promise<{ page: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = pageFromSlug((await params).page);
  return { title: page ? ADMIN_TEXT.pageTitle(PAGE_NAMES[page]) : ADMIN_TEXT.pages };
}

/** One page's editor (R6.3, D88); an address that is not a page answers 404. */
export default async function Page({ params }: { params: Params }) {
  const page = pageFromSlug((await params).page);
  if (!page) notFound();
  return <PageEditor key={page} page={page} />;
}
