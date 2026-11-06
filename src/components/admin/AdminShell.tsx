"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";

import { Logo } from "@/components/site/Logo";
import { SkipLink } from "@/components/site/SkipLink";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { AuthClient } from "@/features/auth/api.client";
import { applicationsKey } from "@/features/careers/api.client";
import type { JobSummaryItem } from "@/features/careers/types";
import type { ClientListItems } from "@/features/clients/types";
import type { PageStateItem } from "@/features/content/types";
import { enquiriesKey } from "@/features/enquiries/api.client";
import type { ServiceListItems } from "@/features/services/types";
import type { SiteDraftItem } from "@/features/settings/types";
import { todayKey } from "@/lib/inbox/keys";
import { useApiMutation } from "@/lib/query/useApiMutation";
import { useApiQuery } from "@/lib/query/useApiQuery";

interface Station {
  label: string;
  href: string;
  /** Its mark beside its name (D115). */
  pictogram: PictogramName;
  /** How many wait there, and how a screen reader says so. */
  count?: { value: number; said: string };
}

/** A station is where the admin is when they are on its page, or under it (the dashboard only on its own). */
const isHere = (pathname: string, href: string) =>
  href === ADMIN_ROUTES.overview ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/** The station the admin is at: the closest one, so Operations, under Settings, is not Settings as well. */
const currentStation = (pathname: string, stations: Station[]) =>
  stations.filter((station) => isHere(pathname, station.href)).sort((a, b) => b.href.length - a.href.length)[0];

/** A row of the column: a station, the profile, the way out. */
const ROW = "flex min-h-touch w-full items-center gap-3 rounded-control px-3 text-start";
const ROW_IDLE = "text-ink-2 hover:bg-leaf/20 hover:text-navy";
// The current row is marked by its highlight alone, never by a heavier weight (D115).
const ROW_HERE = "bg-leaf text-navy";

/**
 * The admin's sections as a plain list in groups (R6.1, D101, D115): each
 * with its mark, the groups under bold headings and parted by a light rule,
 * the current one marked, and what waits shown in a green count. No line and no
 * station dots since the redesign.
 */
function Stations({
  groups,
  onNavigate,
}: {
  groups: { label?: string; stations: Station[] }[];
  onNavigate?: () => void;
}) {
  const current = currentStation(
    usePathname(),
    groups.flatMap((group) => group.stations),
  );
  return (
    <nav aria-label={ADMIN_TEXT.navigation} className="grid">
      {groups.map((group, at) => (
        <div
          key={group.label ?? "home"}
          className={`grid gap-1 ${at > 0 ? "mt-4 border-t border-forest/20 pt-4" : ""}`}
        >
          {group.label ? <p className="mb-1 px-3 text-body font-bold text-navy">{group.label}</p> : null}
          <ul className="grid gap-1">
            {group.stations.map((station) => {
              const here = station === current;
              return (
                <li key={station.href}>
                  <Link
                    href={station.href}
                    aria-current={here ? "page" : undefined}
                    onClick={onNavigate}
                    className={`${ROW} ${here ? ROW_HERE : ROW_IDLE}`}
                  >
                    <Pictogram name={station.pictogram} size="sm" />
                    <span className="grow">{station.label}</span>
                    {station.count && station.count.value > 0 ? (
                      <span className="rounded-full bg-leaf/30 px-2 text-small font-bold text-navy tabular-nums">
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

/** Who is signed in (D115): their profile, and the way out, asked first, each with its mark. */
function Account({ adminName, onNavigate }: { adminName: string; onNavigate?: () => void }) {
  const router = useRouter();
  const here = usePathname() === ADMIN_ROUTES.profile;
  const [asking, setAsking] = useState(false);
  const leave = () => router.replace(ADMIN_ROUTES.login);
  const { submit, submitting } = useApiMutation(AuthClient.signOut, { onSuccess: leave, onError: leave });
  return (
    <div className="grid gap-1 border-t border-forest/20 pt-4">
      <p className="px-3 pb-1 text-small text-ink-2">{ADMIN_TEXT.signedInAs(adminName)}</p>
      <Link
        href={ADMIN_ROUTES.profile}
        aria-current={here ? "page" : undefined}
        onClick={onNavigate}
        className={`${ROW} ${here ? ROW_HERE : ROW_IDLE}`}
      >
        <Pictogram name="profile" size="sm" />
        {ADMIN_TEXT.profile}
      </Link>
      <button type="button" onClick={() => setAsking(true)} className={`${ROW} ${ROW_IDLE}`}>
        <Pictogram name="logout" size="sm" />
        {ADMIN_TEXT.signOut}
      </button>
      <Dialog open={asking} onClose={() => setAsking(false)} title={ADMIN_TEXT.signOutTitle}>
        <div className="grid gap-5">
          <p>{ADMIN_TEXT.signOutBody}</p>
          <div className="flex flex-wrap gap-3">
            <Button pending={submitting} onClick={() => submit(undefined)}>
              {submitting ? ADMIN_TEXT.signingOut : ADMIN_TEXT.signOut}
            </Button>
            <Button variant="secondary" onClick={() => setAsking(false)}>
              {ADMIN_TEXT.cancel}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

/**
 * The admin's frame (plan §16, R6.1): a column of links in pastel
 * green (D138) on a wide screen; on a phone a pastel-green bar naming the
 * section, with the links in a menu. The page beside it is white and quiet.
 * No smooth scroll, no motion of the public site's.
 */
export function AdminShell({ adminName, children }: { adminName: string; children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const needs = useApiQuery<{ total: number }>(todayKey({ needsYou: true }));
  const freshEnquiries = useApiQuery<{ total: number }>(enquiriesKey({ status: "NEW" }));
  const freshApplications = useApiQuery<{ total: number }>(applicationsKey({ status: "NEW" }));
  const pages = useApiQuery<PageStateItem[]>(ADMIN_API_ROUTES.adminPages);
  const services = useApiQuery<ServiceListItems>(ADMIN_API_ROUTES.adminServices);
  const jobs = useApiQuery<JobSummaryItem[]>(ADMIN_API_ROUTES.adminJobs);
  const clients = useApiQuery<ClientListItems>(ADMIN_API_ROUTES.adminClients);
  const site = useApiQuery<SiteDraftItem>(ADMIN_API_ROUTES.adminSite);
  const waiting = (items: { unpublishedChanges: boolean; archivedAt?: string | null }[]) =>
    items.filter((item) => item.unpublishedChanges && !item.archivedAt).length;
  const count = (total: number | undefined, said: (count: number) => string) =>
    total === undefined ? undefined : { value: total, said: said(total) };

  const groups: { label?: string; stations: Station[] }[] = [
    {
      stations: [
        {
          label: ADMIN_TEXT.dashboard,
          href: ADMIN_ROUTES.overview,
          pictogram: "dashboard",
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
          pictogram: "mail",
          count: count(freshEnquiries.data?.total, ADMIN_TEXT.newCount),
        },
        {
          label: ADMIN_TEXT.applications,
          href: ADMIN_ROUTES.applications,
          pictogram: "careers",
          count: count(freshApplications.data?.total, ADMIN_TEXT.newCount),
        },
      ],
    },
    {
      label: ADMIN_TEXT.theSite,
      stations: [
        {
          label: ADMIN_TEXT.pages,
          href: ADMIN_ROUTES.pages,
          pictogram: "document",
          count: count(pages.data && waiting(pages.data), ADMIN_TEXT.waitingCount),
        },
        {
          label: ADMIN_TEXT.services,
          href: ADMIN_ROUTES.services,
          pictogram: "stethoscope",
          // The order waiting counts as one more.
          count: count(
            services.data && waiting(services.data.items) + Number(services.data.order.unpublishedChanges),
            ADMIN_TEXT.waitingCount,
          ),
        },
        {
          label: ADMIN_TEXT.jobs,
          href: ADMIN_ROUTES.jobs,
          pictogram: "briefcase",
          count: count(jobs.data && waiting(jobs.data), ADMIN_TEXT.waitingCount),
        },
        {
          label: ADMIN_TEXT.clients,
          href: ADMIN_ROUTES.clients,
          pictogram: "staffing",
          count: count(
            clients.data && waiting(clients.data.items) + Number(clients.data.order.unpublishedChanges),
            ADMIN_TEXT.waitingCount,
          ),
        },
        { label: ADMIN_TEXT.media, href: ADMIN_ROUTES.media, pictogram: "image" },
        { label: ADMIN_TEXT.fontManager, href: ADMIN_ROUTES.fonts, pictogram: "typography" },
        {
          label: ADMIN_TEXT.settings,
          href: ADMIN_ROUTES.settings,
          pictogram: "settings",
          count: count(site.data && Number(site.data.unpublishedChanges), ADMIN_TEXT.waitingCount),
        },
      ],
    },
    {
      label: ADMIN_TEXT.runningTheSite,
      stations: [
        { label: ADMIN_TEXT.operations, href: ADMIN_ROUTES.operations, pictogram: "clipboard" },
        { label: ADMIN_TEXT.activity, href: ADMIN_ROUTES.activity, pictogram: "clock" },
      ],
    },
  ];
  // The profile is named in the phone's bar too, though it sits apart from the sections.
  const current = currentStation(pathname, [
    ...groups.flatMap((group) => group.stations),
    { label: ADMIN_TEXT.profile, href: ADMIN_ROUTES.profile, pictogram: "profile" },
  ]);

  return (
    <div className="min-h-dvh bg-ground lg:grid lg:grid-cols-[15.5rem_1fr]">
      <SkipLink />
      {/* The column scrolls on its own; reaching its end never carries on into the page (D115). */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 overflow-y-auto overscroll-contain border-e border-forest/15 bg-leaf-pale px-5 py-6 lg:flex">
        <Link href={ADMIN_ROUTES.overview} className="grid gap-1 text-navy">
          <Logo priority className="h-9 w-auto" />
          <span className="text-small text-ink-2">{ADMIN_TEXT.admin}</span>
        </Link>
        <Stations groups={groups} />
        <div className="mt-auto">
          <Account adminName={adminName} />
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-forest/15 bg-leaf-pale px-gutter py-2 text-navy lg:hidden">
        <Link
          href={ADMIN_ROUTES.overview}
          aria-label={ADMIN_TEXT.dashboard}
          className="inline-flex min-h-touch min-w-0 max-w-[70%] items-center"
        >
          <Logo priority className="h-8 w-auto" />
        </Link>
        <span className="ms-auto truncate font-semibold">{current?.label}</span>
        <button
          type="button"
          onClick={() => setMenu(true)}
          className="grid size-touch shrink-0 place-items-center rounded-control hover:bg-leaf/20"
          aria-label={ADMIN_TEXT.menu}
        >
          <Pictogram name="menu" size="md" />
        </button>
      </header>
      <Dialog open={menu} onClose={() => setMenu(false)} title={ADMIN_TEXT.menu}>
        <div className="grid gap-6 rounded-panel bg-leaf-pale p-5">
          <Stations groups={groups} onNavigate={() => setMenu(false)} />
          <Account adminName={adminName} onNavigate={() => setMenu(false)} />
        </div>
      </Dialog>

      <main id="main" tabIndex={-1} className="min-w-0 px-gutter py-8 focus:outline-none lg:px-12 lg:py-10">
        {children}
      </main>
    </div>
  );
}
