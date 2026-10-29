import { LogoTile } from "@/components/ui/frames";
import { MediaImage } from "@/components/ui/media-image";
import type { PublishedClient } from "@/features/clients/api";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type ClientsContent = Extract<Section, { type: "CLIENTS" }>["content"];

/**
 * The organisations Al Hidaya works with (plan §11, D7): each logo on its own
 * tile, named by the organisation, linked to its site when the admin gave
 * one. With no logos (until the client supplies them and their permission),
 * the section is not shown at all.
 */
export function ClientsSection({
  anchor,
  content,
  clients,
  images,
}: {
  anchor: string;
  content: ClientsContent;
  clients: readonly PublishedClient[];
  images: ReadonlyMap<string, SiteImage>;
}) {
  const shown = clients.flatMap((client) => {
    const logo = images.get(client.published.logo.mediaId);
    return logo ? [{ client: client.published, id: client.id, logo: { ...logo, alt: client.published.name.en } }] : [];
  });
  if (shown.length === 0) return null;

  return (
    <SectionFrame anchor={anchor} className="grid gap-10">
      <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map(({ client, id, logo }) => {
          const tile = (
            <LogoTile>
              <MediaImage image={logo} sizes="(min-width: 64rem) 12rem, (min-width: 40rem) 30vw, 45vw" />
            </LogoTile>
          );
          return (
            <li key={id}>
              {client.url ? (
                <a href={client.url} target="_blank" rel="noopener noreferrer" className="block rounded-panel">
                  {tile}
                </a>
              ) : (
                tile
              )}
            </li>
          );
        })}
      </ul>
    </SectionFrame>
  );
}
