import { ContactAction } from "@/components/ui/contact-action";
import { PillLink } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { Audience } from "@/constants/statuses";
import type { SiteDocument } from "@/lib/validation";

/**
 * How each audience takes its next step (plan D9, D111): a family on WhatsApp
 * or by a call, an institution with a quote, for the service already chosen
 * when there is one (§6.8). Without published numbers, a family's wait.
 */
export function AudienceActions({
  audience,
  site,
  service,
  size,
}: {
  audience: Audience;
  site: SiteDocument | null;
  /** The service the quote is for. */
  service?: string;
  size?: "md" | "lg";
}) {
  if (audience === "INSTITUTIONS")
    return (
      <PillLink href={service ? ROUTES.quoteFor(service) : ROUTES.quote} size={size} arrow>
        {UI_TEXT.requestQuote}
      </PillLink>
    );
  return site ? (
    <>
      <ContactAction kind="whatsapp" to={site.contact.whatsapp} size={size} arrow />
      <ContactAction kind="call" to={site.contact.phone} variant="line" size={size} />
    </>
  ) : null;
}
