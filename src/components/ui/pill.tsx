import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Pictogram } from "./pictogram";

/**
 * The site's round actions (D97): the forest pill is the one main action in a
 * view, with an arrow that steps forward under the pointer; the pale pill is
 * the action beside it. They press in by transform alone.
 */
const VARIANTS = {
  forest: "bg-forest text-on-forest hover:bg-forest-2",
  pale: "bg-leaf-pale text-forest hover:bg-forest hover:text-on-forest",
  /** On the forest footer or an accent card: white, its words forest. */
  onForest: "bg-ground text-forest hover:bg-leaf-pale focus-visible:outline-focus-on-deep",
} as const;

export type PillVariant = keyof typeof VARIANTS;

const SIZES = {
  md: "min-h-touch px-5 text-body",
  lg: "min-h-13 px-6 text-body sm:min-h-14 sm:px-7 sm:text-lead",
} as const;

interface Look {
  variant?: PillVariant;
  size?: keyof typeof SIZES;
  /** An arrow after the words, for an action that moves the visitor on. */
  arrow?: boolean;
}

export function pillClasses({ variant = "forest", size = "md" }: Omit<Look, "arrow">, className?: string): string {
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

function Content({ arrow, children }: { arrow?: boolean; children: ReactNode }) {
  return (
    <>
      <span>{children}</span>
      {arrow ? (
        <Pictogram
          name="arrow"
          size="sm"
          className="transition-transform duration-(--duration-state) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
        />
      ) : null}
    </>
  );
}

/** A round action that does something on this page; `pending` holds it while the first press is under way. */
export function Pill({
  variant,
  size,
  arrow,
  pending = false,
  className,
  children,
  type = "button",
  ...props
}: Look & ComponentProps<"button"> & { pending?: boolean }) {
  return (
    <button
      type={type}
      className={pillClasses({ variant, size }, className)}
      aria-busy={pending || undefined}
      disabled={pending || props.disabled}
      {...props}
    >
      <Content arrow={arrow}>{children}</Content>
    </button>
  );
}

/**
 * A round action that goes somewhere: a page of this site through Next's
 * link, or a chat, a call or another site through a plain link (another site
 * opens in a new tab).
 */
export function PillLink({
  href,
  variant,
  size,
  arrow,
  className,
  children,
  ...props
}: Look & Omit<ComponentProps<"a">, "href"> & { href: string }) {
  const classes = pillClasses({ variant, size }, className);
  const content = <Content arrow={arrow}>{children}</Content>;
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  const elsewhere = href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a href={href} className={classes} {...elsewhere} {...props}>
      {content}
    </a>
  );
}
