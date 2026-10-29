import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";

import { Pictogram } from "./pictogram";

/**
 * A message about what happened (plan §30.3): its words and an icon, never
 * colour alone. An error interrupts a screen reader; the others wait their
 * turn.
 */
const TONES: Record<"info" | "success" | "error", { pictogram: PictogramName; frame: string; icon: string }> = {
  info: { pictogram: "info", frame: "bg-mist", icon: "text-deep" },
  success: { pictogram: "check", frame: "bg-mist", icon: "text-deep" },
  error: { pictogram: "error", frame: "border border-error bg-ground", icon: "text-error" },
};

export function Notice({
  tone,
  title,
  titleId,
  children,
}: {
  tone: keyof typeof TONES;
  title: string;
  /** For what the title names: a success that takes focus is labelled by it. */
  titleId?: string;
  children?: ReactNode;
}) {
  const { pictogram, frame, icon } = TONES[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-panel p-4 ${frame}`}>
      <Pictogram name={pictogram} size="md" className={icon} />
      <div className="grid gap-1">
        <p id={titleId} className="font-semibold">
          {title}
        </p>
        {children ? <div className="text-ink-2">{children}</div> : null}
      </div>
    </div>
  );
}
