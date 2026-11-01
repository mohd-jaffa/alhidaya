/**
 * The site's actions (D132): the deep-blue button, white words, is the one
 * main action in a view, with an arrow that steps forward under the pointer;
 * the outlined one is the action beside it. Both have rounded corners, and
 * press in by transform alone. Their look alone, apart from the components,
 * for a page that takes it without them (a failed page, which reloads in
 * full).
 */
const VARIANTS = {
  deep: "bg-deep text-on-deep shadow-raised hover:bg-navy",
  line: "text-deep ring-[1.5px] ring-deep ring-inset hover:bg-mist",
  /** On the leaf footer or a green card: white, its words navy. */
  onLeaf: "bg-ground text-navy hover:bg-leaf-pale focus-visible:outline-focus-on-leaf",
  /** Beside it on the leaf: outlined in navy. */
  onLeafQuiet: "border border-on-leaf text-on-leaf hover:bg-on-leaf/10 focus-visible:outline-focus-on-leaf",
} as const;

export type PillVariant = keyof typeof VARIANTS;

const SIZES = {
  md: "min-h-touch px-5 text-body",
  lg: "min-h-13 px-6 text-body sm:min-h-14 sm:px-7 sm:text-lead",
} as const;

export type PillSize = keyof typeof SIZES;

export function pillClasses(
  { variant = "deep", size = "md" }: { variant?: PillVariant; size?: PillSize },
  className?: string,
): string {
  return [
    "group inline-flex items-center justify-center gap-2 rounded-button font-semibold leading-tight no-underline",
    "transition-[background-color,color,transform] duration-(--duration-state) ease-out active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress",
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
