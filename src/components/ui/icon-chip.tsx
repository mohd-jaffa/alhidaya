import type { PictogramName } from "@/assets/brand/pictograms";

import { Pictogram } from "./pictogram";

const TONES = {
  /** Beside words on white or mist: the pale leaf, its icon forest. */
  pale: "bg-leaf-pale text-forest",
  /** On a card's corner, or where it must stand out: forest, its icon white. */
  forest: "bg-forest text-on-forest",
  /** On a photo: white, its icon forest. */
  ground: "bg-ground text-forest",
} as const;

const SIZES = {
  /** Set inline in a heading or a statement, as tall as its words. */
  inline: { box: "size-[1.05em] align-[-0.12em] mx-[0.12em]", icon: "inline" },
  /** Beside a line of a list: a tick before each thing a service includes. */
  sm: { box: "size-7", icon: "xs" },
  md: { box: "size-11", icon: "sm" },
  lg: { box: "size-14", icon: "md" },
} as const;

/** A pictogram in a round chip (D97): what the words beside it are about. Decoration, hidden from screen readers. */
export function IconChip({
  name,
  tone = "pale",
  size = "md",
  className,
}: {
  name: PictogramName;
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-full ${TONES[tone]} ${SIZES[size].box} ${className ?? ""}`}
    >
      <Pictogram name={name} size={SIZES[size].icon} />
    </span>
  );
}
