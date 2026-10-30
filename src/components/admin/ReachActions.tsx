import { ButtonLink } from "@/components/ui/button";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { mailtoHref, telHref, whatsappHref } from "@/lib/contact";

/** The ways to answer someone from an opened row (R6.1): call them, WhatsApp them, email them. */
export function ReachActions({ phone, email }: { phone: string; email: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ButtonLink href={telHref(phone)} pictogram="phone">
        {ADMIN_TEXT.call}
      </ButtonLink>
      <ButtonLink href={whatsappHref(phone)} variant="secondary" pictogram="chat">
        {ADMIN_TEXT.whatsapp}
      </ButtonLink>
      <ButtonLink href={mailtoHref(email)} variant="secondary" pictogram="mail">
        {ADMIN_TEXT.emailAction}
      </ButtonLink>
    </div>
  );
}
