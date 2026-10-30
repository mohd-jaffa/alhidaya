"use client";

import Link from "next/link";

import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { PAGE_NAMES } from "@/constants/messages";
import type { JobSummaryItem } from "@/features/careers/types";
import type { PageStateItem } from "@/features/content/types";
import type { ServiceListItems } from "@/features/services/types";
import { useApiQuery } from "@/lib/query/useApiQuery";

/** What waits, read from the lists the rail counts from, so the two always agree (D86, D92). */
export function useWaiting(): { label: string; href: string }[] {
  const pages = useApiQuery<PageStateItem[]>(ADMIN_API_ROUTES.adminPages);
  const services = useApiQuery<ServiceListItems>(ADMIN_API_ROUTES.adminServices);
  const jobs = useApiQuery<JobSummaryItem[]>(ADMIN_API_ROUTES.adminJobs);
  const waits = (item: { unpublishedChanges: boolean; archivedAt?: string | null }) =>
    item.unpublishedChanges && !item.archivedAt;
  return [
    ...(pages.data ?? []).filter(waits).map((state) => ({
      label: PAGE_NAMES[state.page],
      href: ADMIN_ROUTES.page(state.page),
    })),
    ...(services.data?.order.unpublishedChanges
      ? [{ label: ADMIN_TEXT.servicesOrder, href: ADMIN_ROUTES.services }]
      : []),
    ...(services.data?.items ?? []).filter(waits).map((service) => ({
      label: service.name || ADMIN_TEXT.unnamed,
      href: ADMIN_ROUTES.service(service.id),
    })),
    ...(jobs.data ?? []).filter(waits).map((job) => ({
      label: job.title || ADMIN_TEXT.unnamed,
      href: ADMIN_ROUTES.job(job.id),
    })),
  ];
}

/**
 * What waits to be published, on Today (plan §14, D86): each page, service
 * or job with saved changes not on the website yet, and the services' order,
 * a link to its editor. Nothing waiting, or the lists not read, and it is
 * not shown: each screen says why.
 */
export function WaitingToPublish() {
  const waiting = useWaiting();
  if (waiting.length === 0) return null;
  return (
    <section aria-labelledby="unpublished-heading" className="grid gap-3 rounded-panel border border-rule p-4">
      <div className="grid gap-1">
        <h2 id="unpublished-heading" className="font-bold">
          {ADMIN_TEXT.notPublishedYet}
        </h2>
        <p className="text-small text-ink-2">{ADMIN_TEXT.waitingBody}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {waiting.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-touch items-center gap-2 rounded-control bg-mist px-4 font-semibold text-deep hover:bg-sky/15"
            >
              {item.label}
              <Pictogram name="arrow" size="sm" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
