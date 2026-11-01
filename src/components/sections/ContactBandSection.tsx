import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import type { Section, SiteDocument } from "@/lib/validation";

import { ContactWays } from "./ContactWays";
import { headingId, SectionBand } from "./SectionFrame";

type ContactBandContent = Extract<Section, { type: "CONTACT_BAND" }>["content"];

/**
 * The way to reach the company at the end of a page (plan §6.1, D9, D135):
 * on Home's pale-green band, the admin's heading rising in word by word and
 * their words, beside the ways to reach it from Settings, as Home sets them
 * beside its quote.
 */
export function ContactBandSection({
  anchor,
  content,
  site,
}: {
  anchor: string;
  content: ContactBandContent;
  site: SiteDocument | null;
}) {
  return (
    <SectionBand
      anchor={anchor}
      tone="leaf"
      className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16"
    >
      <div className="grid content-start gap-4">
        <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
          <RiseWords text={content.heading.en} />
        </h2>
        {content.text.en ? (
          <p className="max-w-[46ch] text-lead whitespace-pre-line text-ink-2">{content.text.en}</p>
        ) : null}
      </div>
      {site ? (
        <Reveal>
          <ContactWays site={site} />
        </Reveal>
      ) : null}
    </SectionBand>
  );
}
