import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/ui/media-image";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionOpening } from "./SectionFrame";

type InstitutionsContent = Extract<Section, { type: "FOR_INSTITUTIONS" }>["content"];

/** Each face of the reach card, set on its ring: where it sits, and how large. */
const ORBIT = [
  "start-[18%] top-[20%] size-12",
  "end-[16%] top-[8%] size-10",
  "end-[10%] top-[44%] size-14",
  "start-[40%] top-[34%] size-9",
] as const;

/**
 * For hospitals, clinics and schools (plan §30.1, D97, D105): its pill and
 * heading, then three cards (a team of faces with its words; a photo with its
 * words; Doha's reach, faces on soft rings), and a row of real figures that
 * count up (D99).
 */
export function ForInstitutionsSection({
  anchor,
  content,
  image,
}: {
  anchor: string;
  content: InstitutionsContent;
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  const faces = (refs: readonly { mediaId: string }[]) =>
    refs.map(image).filter((face): face is SiteImage => face !== null);
  const team = faces(content.team.avatars);
  const reach = faces(content.reach.avatars);
  const photo = image(content.photo.image);
  return (
    <SectionFrame anchor={anchor} className="grid gap-12 py-section">
      <Reveal>
        <SectionOpening
          anchor={anchor}
          label={content.label.en}
          start={content.headingStart.en}
          pictogram={content.pictogram}
          end={content.headingEnd.en}
        />
      </Reveal>
      <ul className="grid gap-4 lg:grid-cols-[1.55fr_1fr_1fr]">
        <li>
          <Reveal className="flex h-full min-h-[21rem] flex-col justify-between gap-8 rounded-card bg-mist p-6 lg:p-8">
            <ul className="flex items-center justify-center -space-x-2 rtl:space-x-reverse">
              {team.map((face, at) => (
                <li
                  key={face.id}
                  className={`overflow-hidden rounded-full ring-4 ring-mist ${at === Math.floor(team.length / 2) ? "size-16 sm:size-24" : "size-12 sm:size-16"}`}
                >
                  <MediaImage image={face} sizes="96px" decorative className="size-full object-cover" />
                </li>
              ))}
            </ul>
            <div className="grid max-w-[34ch] gap-2">
              <h3 className="text-title font-medium">{content.team.title.en}</h3>
              {content.team.text.en ? (
                <p className="text-small whitespace-pre-line text-ink-2">{content.team.text.en}</p>
              ) : null}
            </div>
          </Reveal>
        </li>
        <li>
          <Reveal order={1} className="flex h-full min-h-[21rem] flex-col gap-5 rounded-card bg-mist p-4">
            <div className="relative min-h-48 grow overflow-hidden rounded-[1.25rem] bg-ground">
              {photo ? (
                <MediaImage
                  image={photo}
                  sizes="(min-width: 64rem) 22vw, 100vw"
                  className="absolute inset-0 size-full object-cover"
                />
              ) : null}
            </div>
            {content.photo.text.en ? (
              <p className="px-2 pb-2 text-small whitespace-pre-line text-ink-2">{content.photo.text.en}</p>
            ) : null}
          </Reveal>
        </li>
        <li>
          <Reveal
            order={2}
            className="relative flex h-full min-h-[21rem] flex-col justify-end overflow-hidden rounded-card bg-mist p-6"
          >
            <div aria-hidden="true" className="absolute inset-0">
              <span className="absolute -end-24 -top-24 size-80 rounded-full border border-rule" />
              <span className="absolute -end-10 -top-10 size-52 rounded-full border border-rule" />
              {reach.slice(0, ORBIT.length).map((face, at) => (
                <span key={face.id} className={`absolute overflow-hidden rounded-full ring-3 ring-mist ${ORBIT[at]}`}>
                  <MediaImage image={face} sizes="56px" decorative className="size-full object-cover" />
                </span>
              ))}
            </div>
            <h3 className="relative max-w-[14ch] text-title font-medium">{content.reach.title.en}</h3>
          </Reveal>
        </li>
      </ul>
      {content.facts.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {content.facts.map((fact, at) => (
            <Reveal key={fact.label.en} order={at} className="grid gap-2">
              <dt className="order-2 text-small text-ink-2">{fact.label.en}</dt>
              <dd className="order-1 text-figure font-light">
                <CountUp value={fact.value.en} />
              </dd>
            </Reveal>
          ))}
        </dl>
      ) : null}
    </SectionFrame>
  );
}
