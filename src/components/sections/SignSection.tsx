import { ContactAction } from "@/components/ui/contact-action";
import { PillLink } from "@/components/ui/pill";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { PageKey } from "@/constants/sections";
import type { SiteImage } from "@/features/media/types";
import type { Section, SiteDocument } from "@/lib/validation";

import { PageHero } from "./PageHero";
import { PageSplit } from "./PageSplit";

type SignContent = Extract<Section, { type: "SIGN" }>["content"];

/**
 * What a page's opening offers beside WhatsApp (D109), fixed like Home's: a
 * quote where families and institutions read about the company, a call on
 * Contact. Careers, the quote page and the legal pages lead on with what
 * follows them instead.
 */
const SECOND_ACTION: Partial<Record<PageKey, "quote" | "call">> = {
  ABOUT: "quote",
  SERVICES: "quote",
  CONTACT: "call",
};

/** The pages that keep Phase 6B's opening, as the user chose (D135); every other opens in Theme 6's straight lines. */
export const KEEPS_HERO: readonly PageKey[] = ["CONTACT", "CAREERS"];

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
  const second = SECOND_ACTION[page];
  const Opening = KEEPS_HERO.includes(page) ? PageHero : PageSplit;
  return (
    <Opening
      anchor={anchor}
      label={PAGE_NAMES[page]}
      headline={content.headline.en}
      highlight={content.highlight.en}
      lede={content.lede.en}
      image={image}
    >
      {second && site ? (
        <>
          <ContactAction kind="whatsapp" to={site.contact.whatsapp} size="lg" arrow />
          {second === "quote" ? (
            <PillLink href={ROUTES.quote} variant="line" size="lg">
              {UI_TEXT.requestQuote}
            </PillLink>
          ) : (
            <ContactAction kind="call" to={site.contact.phone} variant="line" size="lg" />
          )}
        </>
      ) : null}
    </Opening>
  );
}
