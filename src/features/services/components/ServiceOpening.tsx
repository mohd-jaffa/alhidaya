import { InlineText } from "@/components/ui/inline-text";
import { PageSplit } from "@/components/sections/PageSplit";
import { PillLink } from "@/components/ui/pill";
import type { SiteImage } from "@/features/media/types";
import type { ServiceDocument } from "@/lib/validation";

/** D164: the shared fading photo opening, preserving the optional published actions. */
export function ServiceOpening({ service, image }: { service: ServiceDocument; image: SiteImage | null }) {
  const buttons = service.headerButtons ?? [];
  return (
    <PageSplit
      anchor="start"
      label={service.name.en}
      headline={service.name.en}
      lede={service.summary.en}
      image={image}
      blend
      className="service-opening"
    >
      {buttons.length > 0
        ? buttons.map((button, index) => (
            <PillLink
              key={index}
              href={button.href}
              variant={index === 0 ? "deep" : "line"}
              size="lg"
              arrow={index === 0}
            >
              <InlineText text={button.label.en} />
            </PillLink>
          ))
        : null}
    </PageSplit>
  );
}
