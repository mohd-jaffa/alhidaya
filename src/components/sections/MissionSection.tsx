import type { ReactNode } from "react";

import { Words } from "@/components/motion/Words";
import { UI_TEXT } from "@/constants/messages";
import type { Section } from "@/lib/validation";

import { MissionPanels } from "./MissionPanels";
import { SectionBand } from "./SectionFrame";

type MissionContent = Extract<Section, { type: "MISSION" }>["content"];

/** The logo's medical cross, assembled from its four arms, never a heart (D137). */
const MEDICAL_CROSS = (
  <svg viewBox="0 0 160 160" fill="currentColor" aria-hidden="true" focusable="false" className="size-36 sm:size-40">
    <g data-art-part data-from-y="-24" className="text-leaf">
      <path d="M66 24a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v42H66Z" />
    </g>
    <g data-art-part data-from-x="24" className="text-sky">
      <path d="M94 66h42a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H94Z" />
    </g>
    <g data-art-part data-from-y="24">
      <path d="M66 94h28v42a4 4 0 0 1-4 4H70a4 4 0 0 1-4-4Z" />
    </g>
    <g data-art-part data-from-x="-24">
      <path d="M24 66h42v28H24a4 4 0 0 1-4-4V70a4 4 0 0 1 4-4Z" />
    </g>
    <path d="M66 66h28v28H66Z" />
  </svg>
);

/** A globe whose circle, meridian and latitude open into place with the paired cross. */
const VISION_GLOBE = (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    focusable="false"
    className="size-36 text-forest sm:size-40"
  >
    <g data-art-part>
      <circle cx="80" cy="80" r="58" />
    </g>
    <g data-art-part data-from-x="-24">
      <ellipse cx="80" cy="80" rx="25" ry="58" />
    </g>
    <g data-art-part data-from-y="24">
      <ellipse cx="80" cy="80" rx="58" ry="25" />
    </g>
    <path d="M22 80h116M80 22v116" className="opacity-30" />
  </svg>
);

/** Distinct paired statements (D137): deep-blue Mission, pale-green Vision, the company's own words. */
export function MissionSection({ anchor, content }: { anchor: string; content: MissionContent }) {
  const statements: {
    kind: "mission" | "vision";
    heading: string;
    text: string;
    art: ReactNode;
    tone: string;
    ink: string;
  }[] = [
    {
      kind: "mission",
      heading: UI_TEXT.mission,
      text: content.mission.en,
      art: MEDICAL_CROSS,
      tone: "bg-deep text-on-deep",
      ink: "text-on-deep-2",
    },
    {
      kind: "vision",
      heading: UI_TEXT.vision,
      text: content.vision.en,
      art: VISION_GLOBE,
      tone: "bg-leaf-pale text-navy",
      ink: "text-ink-2",
    },
  ];
  return (
    <SectionBand anchor={anchor} tone="mist" named={false}>
      <MissionPanels>
        {statements.map((statement) => (
          <div key={statement.heading} data-mission-panel className="mission-scene">
            <article
              tabIndex={0}
              aria-label={statement.heading}
              className={`mission-panel mission-panel--${statement.kind} relative isolate flex h-full flex-col rounded-card p-7 sm:p-10 lg:p-12 ${statement.tone}`}
            >
              <span aria-hidden="true" className="mission-sheen" />
              <div aria-hidden="true" className="mb-8 flex items-center gap-8">
                <span data-mission-rule className="h-px grow bg-current opacity-25" />
                <span className={`mission-emblem mission-emblem--${statement.kind} relative shrink-0`}>
                  {statement.art}
                </span>
              </div>
              <h2 className="mb-5 text-display font-semibold">
                <Words text={statement.heading} />
              </h2>
              <p data-mission-statement className={`max-w-measure text-lead whitespace-pre-line ${statement.ink}`}>
                {statement.text}
              </p>
            </article>
          </div>
        ))}
      </MissionPanels>
    </SectionBand>
  );
}
