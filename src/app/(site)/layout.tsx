import type { Metadata } from "next";
import { connection } from "next/server";

import { MotionProvider } from "@/components/motion/MotionProvider";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { JsonLd } from "@/components/site/JsonLd";
import { PreviewBar } from "@/components/site/PreviewBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipLink } from "@/components/site/SkipLink";
import { getPublishedSite } from "@/features/settings/api";
import { contentView, previewMetadata } from "@/lib/content/view";
import { publicSiteUrl } from "@/lib/env/public";
import { medicalBusiness } from "@/lib/seo/structured-data";

/** A preview is kept out of search engines (plan §19). */
export function generateMetadata(): Promise<Metadata> {
  return previewMetadata();
}

/**
 * The public site's frame (plan R2.6): on its soft-white ground (D132), the
 * skip link, the preview bar for the admin, the header, the page, the footer
 * and the floating WhatsApp button,
 * from the published site content. Its motion lives here, so the admin never
 * loads it (plan §30.4). Rendered per request from cached reads (plan D76);
 * in the admin's preview, from the drafts.
 */
export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const view = await contentView();
  const site = await getPublishedSite(view);
  return (
    <MotionProvider>
      <div className="site-world min-h-dvh">
        <SkipLink />
        <PreviewBar active={view === "preview"} />
        <SiteHeader site={site} />
        <main id="main" tabIndex={-1} className="overflow-x-clip focus:outline-none">
          {children}
        </main>
        <SiteFooter site={site} />
        <FloatingWhatsApp site={site} />
        {site ? <JsonLd data={medicalBusiness(site, publicSiteUrl())} /> : null}
      </div>
    </MotionProvider>
  );
}
