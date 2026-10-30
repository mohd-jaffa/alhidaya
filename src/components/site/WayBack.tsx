import { pillClasses } from "@/components/ui/pill-classes";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";

/**
 * The ways back from a system page (plan §6.10, D97): home, the services,
 * contact, each a pale pill. Plain links that load the page whole: after a
 * failed page the router is not trusted, and the failed page carries no
 * more script than it needs.
 */
export function WayBack() {
  return (
    <ul className="flex flex-wrap gap-3">
      {[
        [ROUTES.home, UI_TEXT.home],
        [ROUTES.services, UI_TEXT.services],
        [ROUTES.contact, UI_TEXT.contact],
      ].map(([href, label]) => (
        <li key={href}>
          <a href={href} className={pillClasses({ variant: "pale" })}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
