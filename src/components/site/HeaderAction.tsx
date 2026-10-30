import { Pictogram } from "@/components/ui/pictogram";
import { PillLink } from "@/components/ui/pill";
import { pillClasses } from "@/components/ui/pill-classes";
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
  className,
  onNavigate,
}: {
  site: SiteDocument | null;
  className?: string;
  onNavigate?: () => void;
}) {
  if (site?.brochure)
    return (
      <a
        href={ROUTES.brochure}
        download={SITE.brochureFilename}
        onClick={onNavigate}
        className={pillClasses({}, className)}
      >
        <Pictogram name="download" size="sm" />
        <span>{UI_TEXT.brochureButton}</span>
      </a>
    );
  return (
    <PillLink href={ROUTES.quote} arrow onClick={onNavigate} className={className}>
      {UI_TEXT.requestQuote}
    </PillLink>
  );
}
