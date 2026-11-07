import { plainText } from "@/lib/text/inline";
import { RiseWords } from "@/components/motion/RiseWords";
import { MediaImage } from "@/components/ui/media-image";
import type { PublishedClient } from "@/features/clients/api";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { ClientsRows } from "./ClientsRows";
import { headingId, SectionFrame } from "./SectionFrame";

type ClientsContent = Extract<Section, { type: "CLIENTS" }>["content"];

/** The clients whose logos can be shown, each with its logo named by the organisation. */
export function shownClients(clients: readonly PublishedClient[], images: ReadonlyMap<string, SiteImage>) {
  return clients.flatMap((client) => {
    const logo = images.get(client.published.logo.mediaId);
    return logo
      ? [{ client: client.published, id: client.id, logo: { ...logo, alt: plainText(client.published.name.en) } }]
      : [];
  });
}

/**
 * The organisations Al Hidaya works with (plan §11, D7, D133): the heading
 * centred over the short blue and green line, then their logos in two
 * running rows, each named by the organisation. With no logos (until the
 * client supplies them and their permission), the section is not shown.
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
  const shown = shownClients(clients, images);
  if (shown.length === 0) return null;

  return (
    <SectionFrame anchor={anchor} className="grid grid-cols-[minmax(0,1fr)] gap-10">
      <div className="grid justify-items-center gap-4 text-center">
        <h2 id={headingId(anchor)} className="text-display font-semibold">
          <RiseWords text={content.heading.en} />
        </h2>
        <span
          aria-hidden="true"
          className="h-1 w-12 rounded-pill bg-[linear-gradient(90deg,var(--color-deep)_0_55%,var(--color-leaf)_55%)]"
        />
      </div>
      <div className="min-w-0 lg:mx-[calc(50%_-_50vw)]">
        <ClientsRows
          clients={shown.map(({ client, id, logo }) => ({
            id,
            name: plainText(client.name.en),
            url: client.url,
            logo: (
              <MediaImage
                image={logo}
                sizes="(min-width: 40rem) 12rem, 9rem"
                decorative
                className="absolute inset-2.5 size-[calc(100%-1.25rem)] object-contain"
              />
            ),
          }))}
        />
      </div>
    </SectionFrame>
  );
}
