import type { PictogramName } from "@/assets/brand/pictograms";
import { IconChip } from "@/components/ui/icon-chip";
import { UI_TEXT } from "@/constants/messages";
import { displayPhone, mailtoHref, telHref, whatsappHref } from "@/lib/contact";
import type { SiteDocument } from "@/lib/validation";

/** One way to reach the company: its mark, what it is, and the number or address. */
function Way({
  pictogram,
  label,
  value,
  href,
  tiles,
  cards,
}: {
  pictogram: PictogramName;
  label: string;
  value: string;
  href: string;
  tiles: boolean;
  cards: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        className={`group flex items-center gap-4 ${tiles ? "rounded-inset bg-deep/10 p-4" : cards ? "rounded-card bg-card p-4" : ""}`}
      >
        <IconChip
          name={pictogram}
          tone={
            tiles
              ? pictogram === "chat"
                ? "whatsapp"
                : "navy"
              : pictogram === "chat"
                ? "leaf"
                : cards
                  ? "navy"
                  : "blue"
          }
          size="md"
          className={tiles ? "quote-contact-icon" : cards ? "contact-card-icon" : undefined}
        />
        <span className="grid min-w-0">
          <span className="text-small text-ink-2">{label}</span>
          <span className="text-title font-semibold wrap-anywhere text-navy tabular-nums underline decoration-transparent underline-offset-4 group-hover:decoration-current">
            {value}
          </span>
        </span>
      </a>
    </li>
  );
}

/**
 * The ways to reach the company on a pale-green band (D130, D135), from
 * Settings: WhatsApp, a call at any hour and the email, each a row with its
 * round mark.
 */
export function ContactWays({
  site,
  className,
  tiles = false,
  cards = false,
}: {
  site: SiteDocument;
  className?: string;
  tiles?: boolean;
  cards?: boolean;
}) {
  return (
    <ul className={[tiles ? "grid gap-3" : "grid gap-5", className].filter(Boolean).join(" ")}>
      <Way
        tiles={tiles}
        cards={cards}
        pictogram="chat"
        label={UI_TEXT.whatsappUs}
        value={displayPhone(site.contact.whatsapp)}
        href={whatsappHref(site.contact.whatsapp, UI_TEXT.whatsappPrefill)}
      />
      <Way
        tiles={tiles}
        cards={cards}
        pictogram="phone"
        label={cards ? UI_TEXT.callUs : UI_TEXT.callUs247}
        value={displayPhone(site.contact.phone)}
        href={telHref(site.contact.phone)}
      />
      <Way
        tiles={tiles}
        cards={cards}
        pictogram="mail"
        label={UI_TEXT.emailUs}
        value={site.contact.email}
        href={mailtoHref(site.contact.email)}
      />
    </ul>
  );
}
