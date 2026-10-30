"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Logo } from "@/components/site/Logo";
import { SkipLink } from "@/components/site/SkipLink";
import { Dialog } from "@/components/ui/dialog";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/routes";
import { AuthClient } from "@/features/auth/api.client";
import { applicationsKey } from "@/features/careers/api.client";
import { enquiriesKey } from "@/features/enquiries/api.client";
import { todayKey } from "@/lib/inbox/keys";
import { useApiMutation } from "@/lib/query/useApiMutation";
import { useApiQuery } from "@/lib/query/useApiQuery";

interface Station {
  label: string;
  href: string;
  /** How many wait there, and how a screen reader says so. */
  count?: { value: number; said: string };
}

/** A station is where the admin is when they are on its page, or under it (Today only on its own). */
const isHere = (pathname: string, href: string) =>
  href === ADMIN_ROUTES.overview ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The admin's sections as stations on the line (R6.1): the line runs down
 * the rail, the current section is the white station, and what waits shows
 * in a sky count.
 */
function Stations({
  groups,
  onNavigate,
}: {
  groups: { label?: string; stations: Station[] }[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={ADMIN_TEXT.navigation}
      className="relative ps-7 before:absolute before:start-[0.5rem] before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-sky/35"
    >
      {groups.map((group) => (
        <div key={group.label ?? "home"} className="grid gap-1">
          {group.label ? (
            <p className="-ms-7 mt-5 mb-1 bg-navy py-1 ps-7 text-small font-semibold text-on-deep-2/80">
              {group.label}
            </p>
          ) : null}
          <ul className="grid gap-1">
            {group.stations.map((station) => {
              const here = isHere(pathname, station.href);
              return (
                <li key={station.href}>
                  <Link
                    href={station.href}
                    aria-current={here ? "page" : undefined}
                    onClick={onNavigate}
                    className={`relative flex min-h-touch items-center justify-between gap-3 rounded-control px-3 ${
                      here
                        ? "bg-on-deep/10 font-bold text-on-deep"
                        : "text-on-deep-2 hover:bg-on-deep/5 hover:text-on-deep"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-1/2 -translate-y-1/2 rounded-full border-[3px] ${
                        here
                          ? "-start-[1.75rem] size-4 border-on-deep bg-on-deep"
                          : "-start-[1.6875rem] size-3.5 border-sky bg-navy"
                      }`}
                    />
                    {station.label}
                    {station.count && station.count.value > 0 ? (
                      <span className="rounded-full bg-sky px-2 text-small font-bold text-navy tabular-nums">
                        <span aria-hidden="true">{station.count.value}</span>
                        <span className="sr-only">{station.count.said}</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Who is signed in, and the way out. */
function SignOut({ adminName }: { adminName: string }) {
  const router = useRouter();
  const leave = () => router.replace(ADMIN_ROUTES.login);
  const { submit, submitting } = useApiMutation(AuthClient.signOut, { onSuccess: leave, onError: leave });
  return (
    <div className="grid gap-1 text-small">
      <p className="text-on-deep-2/80">{ADMIN_TEXT.signedInAs(adminName)}</p>
      <button
        type="button"
        onClick={() => submit(undefined)}
        disabled={submitting}
        className="min-h-touch justify-self-start font-semibold text-on-deep underline underline-offset-4"
      >
        {ADMIN_TEXT.signOut}
      </button>
    </div>
  );
}

/**
 * The admin's frame (plan §16, R6.1): the navy rail on a wide screen; on a
 * phone a navy bar naming the section, with the rail in a menu. The page
 * beside it is white and quiet. No smooth scroll, no motion of the public
 * site's.
 */
export function AdminShell({ adminName, children }: { adminName: string; children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const needs = useApiQuery<{ total: number }>(todayKey({ needsYou: true }));
  const freshEnquiries = useApiQuery<{ total: number }>(enquiriesKey({ status: "NEW" }));
  const freshApplications = useApiQuery<{ total: number }>(applicationsKey({ status: "NEW" }));
  const count = (total: number | undefined, said: (count: number) => string) =>
    total === undefined ? undefined : { value: total, said: said(total) };

  const groups: { label?: string; stations: Station[] }[] = [
    {
      stations: [
        {
          label: ADMIN_TEXT.today,
          href: ADMIN_ROUTES.overview,
          count: count(needs.data?.total, ADMIN_TEXT.needsYouCount),
        },
      ],
    },
    {
      label: ADMIN_TEXT.inbox,
      stations: [
        {
          label: ADMIN_TEXT.enquiries,
          href: ADMIN_ROUTES.enquiries,
          count: count(freshEnquiries.data?.total, ADMIN_TEXT.newCount),
        },
        {
          label: ADMIN_TEXT.applications,
          href: ADMIN_ROUTES.applications,
          count: count(freshApplications.data?.total, ADMIN_TEXT.newCount),
        },
      ],
    },
  ];
  const current = groups.flatMap((group) => group.stations).find((station) => isHere(pathname, station.href));

  return (
    <div className="min-h-dvh bg-ground lg:grid lg:grid-cols-[15.5rem_1fr]">
      <SkipLink />
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 overflow-y-auto bg-navy px-5 py-6 lg:flex">
        <Link href={ADMIN_ROUTES.overview} className="grid gap-1 text-on-deep">
          <Logo variant="white" className="h-9 w-auto" />
          <span className="text-small text-on-deep-2/80">{ADMIN_TEXT.admin}</span>
        </Link>
        <Stations groups={groups} />
        <div className="mt-auto">
          <SignOut adminName={adminName} />
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex items-center gap-3 bg-navy px-gutter py-2 text-on-deep lg:hidden">
        <Link href={ADMIN_ROUTES.overview} aria-label={ADMIN_TEXT.today} className="shrink-0">
          <Logo variant="white" className="h-8 w-auto" />
        </Link>
        <span className="ms-auto truncate font-semibold">{current?.label}</span>
        <button
          type="button"
          onClick={() => setMenu(true)}
          className="grid size-touch place-items-center rounded-control hover:bg-on-deep/10"
          aria-label={ADMIN_TEXT.menu}
        >
          <Pictogram name="menu" size="md" />
        </button>
      </header>
      <Dialog open={menu} onClose={() => setMenu(false)} title={ADMIN_TEXT.menu}>
        <div className="grid gap-6 rounded-panel bg-navy p-5">
          <Stations groups={groups} onNavigate={() => setMenu(false)} />
          <SignOut adminName={adminName} />
        </div>
      </Dialog>

      <main id="main" tabIndex={-1} className="min-w-0 px-gutter py-8 focus:outline-none lg:px-12 lg:py-10">
        {children}
      </main>
    </div>
  );
}
