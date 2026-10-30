import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Pictogram } from "./pictogram";
import { pillClasses, type PillSize, type PillVariant } from "./pill-classes";

interface Look {
  variant?: PillVariant;
  size?: PillSize;
  /** An arrow after the words, for an action that moves the visitor on. */
  arrow?: boolean;
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
