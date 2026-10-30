import { DIRECTIONAL_PICTOGRAMS, PICTOGRAMS, type PictogramName } from "@/assets/brand/pictograms";

/** The sizes a pictogram is drawn at: inline with text, beside a control, on a line, on a sign. */
const SIZES = {
  sm: "size-5",
  md: "size-6",
  lg: "size-10",
  xl: "size-14",
  /** Inside a chip set among words: in proportion to the words (D97). */
  inline: "size-[0.62em]",
} as const;

interface PictogramProps {
  name: PictogramName;
  size?: keyof typeof SIZES;
  /** What it means, when nothing beside it says so; without one it is decoration, hidden from screen readers. */
  label?: string;
  className?: string;
}

/**
 * One of the site's pictograms (plan §30.1), in the colour of the text around
 * it. Most sit beside words that already say what they mean, so they are
 * hidden from screen readers unless given a label.
 */
export function Pictogram({ name, size = "md", label, className }: PictogramProps) {
  const classes = [SIZES[size], "shrink-0", DIRECTIONAL_PICTOGRAMS.includes(name) && "rtl:-scale-x-100", className]
    .filter(Boolean)
    .join(" ");
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={classes}
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {PICTOGRAMS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
