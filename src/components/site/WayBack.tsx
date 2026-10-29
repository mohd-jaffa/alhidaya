import { ArrowLink } from "@/components/ui/arrow-link";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";

/** The ways back from a system page (plan §6.10): home, the services, contact. */
export function WayBack() {
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-2">
      {[
        [ROUTES.home, UI_TEXT.home],
        [ROUTES.services, UI_TEXT.services],
        [ROUTES.contact, UI_TEXT.contact],
      ].map(([href, label]) => (
        <li key={href}>
          <ArrowLink href={href} tone="onDeep">
            {label}
          </ArrowLink>
        </li>
      ))}
    </ul>
  );
}
