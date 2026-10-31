import { Pictogram } from "./pictogram";

const TONES = {
  /** On the leaf footer: navy lines, a navy focus ring. */
  leaf: "border-on-leaf/40 hover:bg-on-leaf/10 has-focus-visible:outline-focus-on-leaf",
  /** On white or mist: the rule's line, navy marks. */
  ground: "border-rule text-navy hover:bg-navy/5 has-focus-visible:outline-focus",
} as const;

/**
 * The pause for what moves on its own (WCAG 2.2.2; D113, D124): a checkbox
 * drawn as a round pause, then a play, so the page's own CSS stops what moves,
 * with no script. With motion reduced nothing moves, and it is hidden.
 */
export function PauseToggle({
  label,
  tone,
  className,
}: {
  label: string;
  tone: keyof typeof TONES;
  className?: string;
}) {
  return (
    <label
      className={[
        "grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border has-focus-visible:outline-3 has-focus-visible:outline-offset-3 motion-reduce:hidden",
        TONES[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input type="checkbox" aria-label={label} className="loop-pause peer sr-only" />
      <Pictogram name="pause" size="sm" className="peer-checked:hidden" />
      <Pictogram name="play" size="sm" className="hidden peer-checked:block" />
    </label>
  );
}
