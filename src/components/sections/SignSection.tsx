import { ButtonLink } from "@/components/ui/button";
import { ContactAction } from "@/components/ui/contact-action";
import { ImageFrame } from "@/components/ui/frames";
import { LineRow } from "@/components/ui/line-row";
import { LineStart } from "@/components/ui/line-start";
import { MediaImage } from "@/components/ui/media-image";
import { SignPanel } from "@/components/ui/sign-panel";
import type { SiteImage } from "@/features/media/types";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { Section, SiteDocument } from "@/lib/validation";

type SignContent = Extract<Section, { type: "SIGN" }>["content"];

/**
 * The three lines (plan §6.1, D9, D71) from where the visitor stands: care at
 * home with WhatsApp and a call, staffing with a quote, nurses with Careers.
 * Their names, actions and colours are fixed; the numbers are the site's.
 */
export function HomeLines({ site }: { site: SiteDocument | null }) {
  return (
    <LineStart>
      <LineRow tone="sky" pictogram="careAtHome" title={UI_TEXT.lineCareAtHome}>
        {site ? (
          <>
            <ContactAction kind="whatsapp" to={site.contact.whatsapp} variant="sky" />
            <ContactAction kind="call" to={site.contact.phone} variant="sky" />
          </>
        ) : null}
      </LineRow>
      <LineRow tone="deep" pictogram="staffing" title={UI_TEXT.lineStaffing}>
        <ButtonLink href={ROUTES.quote}>{UI_TEXT.requestQuote}</ButtonLink>
      </LineRow>
      <LineRow tone="leaf" pictogram="careers" title={UI_TEXT.lineCareers}>
        <ButtonLink href={ROUTES.careers} variant="leaf">
          {UI_TEXT.careers}
        </ButtonLink>
      </LineRow>
    </LineStart>
  );
}

/**
 * The sign a page opens with (plan §6, §7.2): its headline, supporting line
 * and photo, the photo fetched first as the page's largest paint. On Home the
 * three lines follow it.
 */
export function SignSection({
  anchor,
  content,
  image,
  site,
  withLines = false,
}: {
  anchor: string;
  content: SignContent;
  image: SiteImage | null;
  site: SiteDocument | null;
  withLines?: boolean;
}) {
  return (
    <div id={anchor} className="mx-auto grid w-full max-w-site gap-12 px-gutter">
      <SignPanel
        headline={content.headline.en}
        lede={content.lede.en}
        media={
          image ? (
            <ImageFrame ratio="landscape">
              <MediaImage image={image} sizes="(min-width: 78rem) 34rem, (min-width: 64rem) 40vw, 100vw" priority />
            </ImageFrame>
          ) : null
        }
      />
      {withLines ? <HomeLines site={site} /> : null}
    </div>
  );
}
