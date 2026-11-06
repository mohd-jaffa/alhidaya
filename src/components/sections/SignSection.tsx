import { ContactAction } from "@/components/ui/contact-action";
import { PillLink } from "@/components/ui/pill";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { PageKey } from "@/constants/sections";
import type { SiteImage } from "@/features/media/types";
import type { Section, SiteDocument } from "@/lib/validation";

import { PageHero } from "./PageHero";
import { PageSplit } from "./PageSplit";
import { ContactOpening } from "./ContactOpening";

type SignContent = Extract<Section, { type: "SIGN" }>["content"];

/**
 * What a page's opening offers beside WhatsApp (D109), fixed like Home's: a
 * quote where families and institutions read about the company. Contact
 * uses its approved type-led opening (D145/D147). Careers, the quote page and the legal pages lead on with what
 * follows them instead.
 */
const OFFERS_QUOTE: readonly PageKey[] = ["ABOUT", "SERVICES"];

/** The pages that keep Phase 6B's opening, as the user chose (D135); every other opens in Theme 6's straight lines. */
export const KEEPS_HERO: readonly PageKey[] = ["CAREERS"];

/**
 * The sign every page but Home opens with (plan §6, §7.2, D109, D135): the
 * page's name, the admin's headline, highlight, supporting line and photo,
 * and the page's ways to reach the company.
 */
export function SignSection({
  page,
  anchor,
  content,
  image,
  site,
}: {
  page: Exclude<PageKey, "HOME">;
  anchor: string;
  content: SignContent;
  image: SiteImage | null;
  site: SiteDocument | null;
}) {
  if (page === "CONTACT") return <ContactOpening anchor={anchor} content={content} />;
  const Opening = KEEPS_HERO.includes(page) ? PageHero : PageSplit;
  return (
    <Opening
      anchor={anchor}
      label={PAGE_NAMES[page]}
      headline={content.headline.en}
      highlight={content.highlight.en}
      lede={content.lede.en}
      image={image}
      blend={OFFERS_QUOTE.includes(page)}
    >
      {OFFERS_QUOTE.includes(page) && content.showActions === true && site ? (
        <>
          <ContactAction kind="whatsapp" to={site.contact.whatsapp} size="lg" arrow />
          <PillLink href={ROUTES.quote} variant="line" size="lg">
            {UI_TEXT.requestQuote}
          </PillLink>
        </>
      ) : null}
    </Opening>
  );
}
