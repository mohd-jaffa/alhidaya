import type { SiteDocument } from "@/lib/validation";

export type NavigationLink = SiteDocument["navigation"][number];

/** The header's links the admin has left showing (plan §13). */
export function visibleLinks(site: SiteDocument | null): NavigationLink[] {
  return (site?.navigation ?? []).filter((link) => link.visible);
}

/** Whether a link leads to the page the visitor is on, or to one inside it. */
export function isHere(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
