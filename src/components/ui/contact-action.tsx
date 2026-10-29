import { UI_TEXT } from "@/constants/messages";
import { mailtoHref, telHref, whatsappHref } from "@/lib/contact";

import { type ButtonVariant, ButtonLink } from "./button";

/**
 * A family's way to reach the company (plan D9): a WhatsApp chat with its
 * first line written, a call, an email. The number or address comes from the
 * published site content.
 */
const KINDS = {
  whatsapp: {
    pictogram: "chat",
    label: UI_TEXT.whatsapp,
    href: (to: string) => whatsappHref(to, UI_TEXT.whatsappPrefill),
  },
  call: { pictogram: "phone", label: UI_TEXT.call, href: telHref },
  email: { pictogram: "mail", label: UI_TEXT.email, href: mailtoHref },
} as const;

export function ContactAction({
  kind,
  to,
  variant = "primary",
  size,
  className,
}: {
  kind: keyof typeof KINDS;
  /** The E.164 number, or the email address. */
  to: string;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  className?: string;
}) {
  const { pictogram, label, href } = KINDS[kind];
  return (
    <ButtonLink href={href(to)} variant={variant} size={size} pictogram={pictogram} className={className}>
      {label}
    </ButtonLink>
  );
}
