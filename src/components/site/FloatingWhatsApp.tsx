import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { whatsappHref } from "@/lib/contact";
import type { SiteDocument } from "@/lib/validation";

/**
 * The WhatsApp button that floats on every page, as on today's site (plan
 * D67): a family's fastest way to reach the company, clear of the phone's
 * edges. The admin can turn it off in the site content.
 */
export function FloatingWhatsApp({ site }: { site: SiteDocument | null }) {
  if (!site?.whatsappButton) return null;
  return (
    <a
      href={whatsappHref(site.contact.whatsapp, UI_TEXT.whatsappPrefill)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed end-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-(--z-header) grid size-14 place-items-center rounded-full bg-deep text-on-deep shadow-raised transition-transform duration-(--duration-press) ease-out hover:bg-navy active:scale-95"
    >
      <Pictogram name="chat" label={UI_TEXT.whatsappButton} />
    </a>
  );
}
