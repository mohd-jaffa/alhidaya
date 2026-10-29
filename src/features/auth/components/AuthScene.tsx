import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/site/Logo";
import { ADMIN_TEXT } from "@/constants/admin-messages";

/**
 * The frame of the admin's way in (R6.1): the navy rail's colour with the
 * logo and the line's one station on a wide screen, a navy band on a phone;
 * the form on white beside it, alone, with one way elsewhere under it.
 */
export function AuthScene({
  title,
  intro,
  aside,
  children,
}: {
  title: string;
  intro?: string;
  /** The other way out: "Forgot your password?", "Back to sign in". */
  aside?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh md:grid-cols-[minmax(18rem,26rem)_1fr]">
      <header className="flex flex-col gap-10 bg-navy px-gutter py-6 text-on-deep-2 md:px-10 md:py-12">
        <Logo variant="white" priority className="h-10 w-auto self-start md:h-12" />
        <p className="relative hidden ps-8 font-semibold text-on-deep before:absolute before:start-[0.45rem] before:top-1 before:h-40 before:w-[3px] before:rounded-full before:bg-sky/40 md:block">
          <span
            aria-hidden="true"
            className="absolute start-0 top-0 size-4 rounded-full border-[3px] border-on-deep bg-on-deep"
          />
          {ADMIN_TEXT.admin}
        </p>
      </header>
      <main id="main" className="grid content-start px-gutter py-10 md:content-center md:px-16">
        <div className="grid w-full max-w-md gap-8">
          <div className="grid gap-3">
            <h1 className="text-section font-bold">{title}</h1>
            {intro ? <p className="text-ink-2">{intro}</p> : null}
          </div>
          {children}
          {aside ? (
            <Link href={aside.href} className="justify-self-start font-semibold text-deep underline underline-offset-4">
              {aside.label}
            </Link>
          ) : null}
        </div>
      </main>
    </div>
  );
}
