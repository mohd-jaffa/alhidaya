import type { PictogramName } from "@/assets/brand/pictograms";
import { Reveal } from "@/components/motion/Reveal";
import { IconChip } from "@/components/ui/icon-chip";
import { UI_TEXT } from "@/constants/messages";
import type { Section } from "@/lib/validation";

import { SectionFrame } from "./SectionFrame";

type MissionContent = Extract<Section, { type: "MISSION" }>["content"];

/**
 * The mission and the vision (plan §6.2, D97), side by side: the mission on
 * the leaf card, the vision on mist, each named by its heading beside its
 * icon, the statement below.
 */
export function MissionSection({ anchor, content }: { anchor: string; content: MissionContent }) {
  const statements: { heading: string; text: string; pictogram: PictogramName; card: string }[] = [
    { heading: UI_TEXT.mission, text: content.mission.en, pictogram: "heart", card: "bg-leaf text-on-leaf" },
    { heading: UI_TEXT.vision, text: content.vision.en, pictogram: "globe", card: "bg-mist" },
  ];
  return (
    <SectionFrame anchor={anchor} named={false}>
      <div className="grid gap-4 md:grid-cols-2">
        {statements.map((statement, at) => (
          <Reveal
            key={statement.heading}
            order={at}
            className={`flex min-h-80 flex-col justify-between gap-10 rounded-card p-6 sm:p-8 lg:p-10 ${statement.card}`}
          >
            <div className="flex items-center gap-3">
              <IconChip name={statement.pictogram} tone={at === 0 ? "ground" : "leaf"} />
              <h2 className="text-title font-medium">{statement.heading}</h2>
            </div>
            <p className="text-lead whitespace-pre-line">{statement.text}</p>
          </Reveal>
        ))}
      </div>
    </SectionFrame>
  );
}
