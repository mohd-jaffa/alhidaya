"use no memo"; // Small and rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { Pictogram } from "@/components/ui/pictogram";
import { PillLink } from "@/components/ui/pill";
import { type PillSize, type PillVariant, pillClasses } from "@/components/ui/pill-classes";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import type { SiteDocument } from "@/lib/validation";

/**
 * The header's one action (D107, D116): the brochure to download, the PDF the
 * admin published in Settings (the old site's `profile.pdf` at launch, D91);
 * until there is one, Request a quote, so it never leads nowhere. A plain link:
 * `/brochure` answers with the file, not a page, saved under the company's
 * name rather than the stored file's.
 */
export function HeaderAction({
  site,
  variant,
  size,
  className,
  onNavigate,
}: {
  site: SiteDocument | null;
  /** The look the place gives it: the phone menu's deep blue takes a white one (D167). */
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
  onNavigate?: () => void;
}) {
  if (site?.brochure)
    return (
      <a
        href={ROUTES.brochure}
        download={SITE.brochureFilename}
        onClick={onNavigate}
        className={pillClasses({ variant, size }, className)}
      >
        <Pictogram name="download" size="sm" />
        <span>{UI_TEXT.brochureButton}</span>
      </a>
    );
  return (
    <PillLink href={ROUTES.quote} variant={variant} size={size} arrow onClick={onNavigate} className={className}>
      {UI_TEXT.requestQuote}
    </PillLink>
  );
}
