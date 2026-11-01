import type { PictogramName } from "@/assets/brand/pictograms";
import { Reveal } from "@/components/motion/Reveal";
import { IconChip } from "@/components/ui/icon-chip";
import { UI_TEXT } from "@/constants/messages";
import type { Section } from "@/lib/validation";

import { SectionBand } from "./SectionFrame";

type MissionContent = Extract<Section, { type: "MISSION" }>["content"];

/**
 * The mission and the vision (plan §6.2, D135): on Home's pastel-blue band,
 * two rounded white cards side by side, each named by its heading beside its
 * icon in a deep-blue round, the statement below.
 */
export function MissionSection({ anchor, content }: { anchor: string; content: MissionContent }) {
  const statements: { heading: string; text: string; pictogram: PictogramName }[] = [
    { heading: UI_TEXT.mission, text: content.mission.en, pictogram: "heart" },
    { heading: UI_TEXT.vision, text: content.vision.en, pictogram: "globe" },
  ];
  return (
    <SectionBand anchor={anchor} tone="mist" named={false} className="grid gap-5 md:grid-cols-2">
      {statements.map((statement, at) => (
        <Reveal
          key={statement.heading}
          order={at}
          className="grid content-start gap-6 rounded-card bg-card p-6 shadow-raised sm:p-8 lg:p-10"
        >
          <div className="flex items-center gap-4">
            <IconChip name={statement.pictogram} tone="deep" />
            <h2 className="text-title font-semibold">{statement.heading}</h2>
          </div>
          <p className="text-lead whitespace-pre-line text-ink-2">{statement.text}</p>
        </Reveal>
      ))}
    </SectionBand>
  );
}
