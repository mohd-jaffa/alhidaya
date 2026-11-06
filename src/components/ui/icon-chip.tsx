"use no memo"; // Small and rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import type { PictogramName } from "@/assets/brand/pictograms";

import { Pictogram } from "./pictogram";

const TONES = {
  /** Beside words on white or mist: the pale leaf, its icon forest. */
  pale: "bg-leaf-pale text-forest",
  /** On a card's corner, or where it must stand out: the logo's leaf, its icon navy (D122). */
  leaf: "bg-leaf text-on-leaf",
  /** On a photo: white, its icon forest. */
  ground: "bg-ground text-forest",
  /** On the pale-green band (D130): white, its icon deep blue. */
  blue: "bg-ground text-deep",
  /** On a leaf tile (D167): a faint navy disc, its icon navy. */
  onLeaf: "bg-on-leaf/10 text-on-leaf",
  /** On a white tile (D167): the page's mist, its icon deep blue. */
  mist: "bg-mist text-deep",
  /** On a white card (D135): the logo's deep blue, its icon white. */
  deep: "bg-deep text-on-deep",
  /** Home's requested WhatsApp-green square, with a readable navy mark. */
  whatsapp: "bg-whatsapp text-navy",
  /** Home's Call and Email squares, with white marks on navy. */
  navy: "bg-navy text-on-deep",
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
