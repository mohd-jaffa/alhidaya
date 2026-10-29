import { UI_TEXT } from "@/constants/messages";
import type { Section } from "@/lib/validation";

import { SectionFrame } from "./SectionFrame";

type MissionContent = Extract<Section, { type: "MISSION" }>["content"];

/** The mission and the vision (plan §6.2), side by side on a quiet panel; each heading names its statement. */
export function MissionSection({ anchor, content }: { anchor: string; content: MissionContent }) {
  const statements = [
    { heading: UI_TEXT.mission, text: content.mission.en },
    { heading: UI_TEXT.vision, text: content.vision.en },
  ];
  return (
    <SectionFrame anchor={anchor} named={false}>
      <div className="grid gap-10 rounded-panel bg-mist p-sign md:grid-cols-2 md:gap-16">
        {statements.map((statement) => (
          <div key={statement.heading} className="grid content-start gap-4">
            <h2 className="text-section font-bold">{statement.heading}</h2>
            <p className="text-lead whitespace-pre-line">{statement.text}</p>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
