/**
 * The site's round actions (D97): the forest pill is the one main action in a
 * view, with an arrow that steps forward under the pointer; the pale pill is
 * the action beside it. They press in by transform alone. Their look alone,
 * apart from the components, for a page that takes it without them (a failed
 * page, which reloads in full).
 */
const VARIANTS = {
  forest: "bg-forest text-on-forest hover:bg-forest-2",
  pale: "bg-leaf-pale text-forest hover:bg-forest hover:text-on-forest",
  /** On the forest footer or an accent card: white, its words forest. */
  onForest: "bg-ground text-forest hover:bg-leaf-pale focus-visible:outline-focus-on-deep",
  /** Beside it on forest: outlined in white. */
  onForestQuiet: "border border-on-forest text-on-forest hover:bg-on-forest/10 focus-visible:outline-focus-on-deep",
} as const;

export type PillVariant = keyof typeof VARIANTS;

const SIZES = {
  md: "min-h-touch px-5 text-body",
  lg: "min-h-13 px-6 text-body sm:min-h-14 sm:px-7 sm:text-lead",
} as const;

export type PillSize = keyof typeof SIZES;

export function pillClasses(
  { variant = "forest", size = "md" }: { variant?: PillVariant; size?: PillSize },
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
