import { jsonLd, type StructuredData } from "@/lib/seo/structured-data";

/** Structured data in the page for search engines (plan §19); escaped so it can never break out of its tag. */
export function JsonLd({ data }: { data: StructuredData }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
