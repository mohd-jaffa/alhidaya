import { Reveal } from "@/components/motion/Reveal";
import { Avatars } from "@/components/ui/avatars";
import { IconChip } from "@/components/ui/icon-chip";
import { MediaImage } from "@/components/ui/media-image";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { CountUp } from "@/components/motion/CountUp";

import { SectionFrame } from "./SectionFrame";

type HighlightsContent = Extract<Section, { type: "HIGHLIGHTS" }>["content"];

const PHOTO_SIZES = "(min-width: 78rem) 18rem, (min-width: 64rem) 24vw, (min-width: 40rem) 50vw, 100vw";

/** The green card's globe, in thin lines low in its corner behind the faces, as the reference draws it (D97): decoration. */
function Globe() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="pointer-events-none absolute -end-12 -bottom-14 size-52 text-on-forest/25"
    >
      <circle cx="60" cy="60" r="56" />
      <ellipse cx="60" cy="60" rx="22" ry="56" />
      <ellipse cx="60" cy="60" rx="42" ry="56" />
      <path d="M4 60h112M13 32h94M13 88h94" />
    </svg>
  );
}

/** A photo card: the photo filling it, its words on a white pill at its foot. */
function PhotoCard({ photo, label }: { photo: SiteImage | null; label: string | null }) {
  return (
    <div className="relative h-full min-h-[22rem] overflow-hidden rounded-card bg-mist">
      {photo ? (
        <MediaImage
          image={photo}
          sizes={PHOTO_SIZES}
          decorative={Boolean(label)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      {label ? (
        <p className="absolute start-3 bottom-3 rounded-pill bg-ground px-4 py-2 text-small font-medium">{label}</p>
      ) : null}
    </div>
  );
}

/**
 * The highlights (plan §30.1, D97): four cards in a row: a note with its icon,
 * a photo, the green card with its globe, faces and a real figure (D99), and
 * another photo; they rise in one after another.
 */
export function HighlightsSection({
  anchor,
  content,
  image,
}: {
  anchor: string;
  content: HighlightsContent;
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  const { note, first, accent, second } = content;
  const faces = accent.avatars.map(image).filter((face): face is SiteImage => face !== null);
  return (
    <SectionFrame anchor={anchor} named={false}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li>
          <Reveal className="flex h-full min-h-[22rem] flex-col justify-between gap-10 rounded-card bg-mist p-6">
            {note.pictogram ? <IconChip name={note.pictogram} tone="forest" size="lg" /> : <span />}
            <div className="grid gap-3">
              <h2 className="text-title font-medium">{note.title.en}</h2>
              {note.text.en ? <p className="text-small whitespace-pre-line text-ink-2">{note.text.en}</p> : null}
            </div>
          </Reveal>
        </li>
        <li>
          <Reveal order={1} className="h-full">
            <PhotoCard photo={image(first.image)} label={first.label.en} />
          </Reveal>
        </li>
        <li>
          <Reveal
            order={2}
            className="relative flex h-full min-h-[22rem] flex-col justify-between gap-10 overflow-hidden rounded-card bg-forest p-6 text-on-forest"
          >
            <Globe />
            <div className="relative grid gap-3">
              <h2 className="text-title font-medium">{accent.title.en}</h2>
              {accent.text.en ? (
                <p className="text-small whitespace-pre-line text-on-forest-2">{accent.text.en}</p>
              ) : null}
            </div>
            <div className="relative flex items-center gap-3 rounded-pill bg-on-forest/10 p-2 pe-5">
              <Avatars images={faces} size="sm" />
              {accent.fact.value.en ? (
                <p className="ms-auto grid text-end">
                  <CountUp value={accent.fact.value.en} className="text-title font-medium" />
                  {accent.fact.label.en ? (
                    <span className="text-small text-on-forest">{accent.fact.label.en}</span>
                  ) : null}
                </p>
              ) : null}
            </div>
          </Reveal>
        </li>
        <li>
          <Reveal order={3} className="h-full">
            <PhotoCard photo={image(second.image)} label={second.label.en} />
          </Reveal>
        </li>
      </ul>
    </SectionFrame>
  );
}
