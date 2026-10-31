/**
 * The site's round actions (D97): the leaf pill, the logo's green with navy
 * words (D122), is the one main action in a view, with an arrow that steps
 * forward under the pointer; the pale pill is
 * the action beside it. They press in by transform alone. Their look alone,
 * apart from the components, for a page that takes it without them (a failed
 * page, which reloads in full).
 */
const VARIANTS = {
  leaf: "bg-leaf text-on-leaf hover:bg-leaf-2",
  pale: "bg-leaf-pale text-forest hover:bg-leaf hover:text-on-leaf",
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
  { variant = "leaf", size = "md" }: { variant?: PillVariant; size?: PillSize },
  className?: string,
): string {
  return [
    "group inline-flex items-center justify-center gap-2 rounded-pill font-medium leading-tight no-underline",
    "transition-[background-color,color,transform] duration-(--duration-state) ease-out active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress",
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
