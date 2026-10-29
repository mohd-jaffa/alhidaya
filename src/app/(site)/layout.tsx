import { draftMode } from "next/headers";
import { connection } from "next/server";

import { MotionProvider } from "@/components/motion/MotionProvider";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { PreviewBar } from "@/components/site/PreviewBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipLink } from "@/components/site/SkipLink";
import { getPublishedSite } from "@/features/settings/api";

/**
 * The public site's frame (plan R2.6): the skip link, the preview bar for the
 * admin, the sign bar, the page, the footer and the floating WhatsApp button,
 * from the published site content. Its motion lives here, so the admin never
 * loads it (plan §30.4). Read at request time until caching arrives (R3.6).
 */
export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const [site, preview] = await Promise.all([getPublishedSite(), draftMode()]);
  return (
    <MotionProvider>
      <SkipLink />
      <PreviewBar active={preview.isEnabled} />
      <SiteHeader site={site} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <SiteFooter site={site} />
      <FloatingWhatsApp site={site} />
    </MotionProvider>
  );
}
