import { UI_TEXT } from "@/constants/messages";
import { mailtoHref, telHref, whatsappHref } from "@/lib/contact";

import { PillLink } from "./pill";
import type { PillVariant } from "./pill-classes";

/**
 * A family's way to reach the company (plan D9): a WhatsApp chat with its
 * first line written, a call, an email, as a round action (D97). The number
 * or address comes from the published site content.
 */
const KINDS = {
  whatsapp: { label: UI_TEXT.whatsapp, href: (to: string) => whatsappHref(to, UI_TEXT.whatsappPrefill) },
  call: { label: UI_TEXT.call, href: telHref },
  email: { label: UI_TEXT.email, href: mailtoHref },
} as const;

export function ContactAction({
  kind,
  to,
  variant = "deep",
  size,
  arrow = false,
  className,
}: {
  kind: keyof typeof KINDS;
  /** The E.164 number, or the email address. */
  to: string;
  variant?: PillVariant;
  size?: "md" | "lg";
  arrow?: boolean;
  className?: string;
}) {
  const { label, href } = KINDS[kind];
  return (
    <PillLink href={href(to)} variant={variant} size={size} arrow={arrow} className={className}>
      {label}
    </PillLink>
  );
}
