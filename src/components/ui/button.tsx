import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";

import { Pictogram } from "./pictogram";

/**
 * The admin's actions (plan §30.3; the site's are pills since D97): one
 * primary per view. They look like actions, never decoration, and press in
 * by transform alone.
 */
const VARIANTS = {
  primary: "bg-deep text-on-deep hover:bg-navy",
  secondary: "border-2 border-navy bg-ground text-navy hover:bg-mist",
  /** The admin's lesser actions beside a main one (R6.3): words in deep blue, no frame. */
  quiet: "text-deep hover:bg-mist",
  /** What cannot be undone, deleting an image (D126): white on the error red, asked first. */
  danger: "bg-error text-on-deep hover:bg-error/90",
} as const;

const SIZES = {
  md: "min-h-touch px-5 text-body",
  lg: "min-h-14 px-6 text-lead",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

interface Look {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  /** A pictogram before the words. */
  pictogram?: PictogramName;
}

export function buttonClasses({ variant = "primary", size = "md" }: Look, className?: string): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold leading-tight no-underline",
    "transition-transform duration-(--duration-press) ease-out active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress",
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function Content({ pictogram, children }: { pictogram?: PictogramName; children: ReactNode }) {
  return (
    <>
      {pictogram ? <Pictogram name={pictogram} size="sm" /> : null}
      <span>{children}</span>
    </>
  );
}

/**
 * An action on this page. `pending` keeps it in place, says so to screen
 * readers and stops a second press while the first is under way.
 */
export function Button({
  variant,
  size,
  pictogram,
  pending = false,
  className,
  children,
  type = "button",
  ...props
}: Look & ComponentProps<"button"> & { pending?: boolean }) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size }, className)}
      aria-busy={pending || undefined}
      disabled={pending || props.disabled}
      {...props}
    >
      <Content pictogram={pictogram}>{children}</Content>
    </button>
  );
}

/**
 * An action that goes somewhere: a page of this site through Next's link, or
 * a call, a chat or another site through a plain link (another site opens in
 * a new tab).
 */
export function ButtonLink({
  href,
  variant,
  size,
  pictogram,
  className,
  children,
  ...props
}: Look & Omit<ComponentProps<"a">, "href"> & { href: string }) {
  const classes = buttonClasses({ variant, size }, className);
  const content = <Content pictogram={pictogram}>{children}</Content>;
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
