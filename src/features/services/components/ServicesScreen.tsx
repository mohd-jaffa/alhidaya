"use client";

import Link from "next/link";

import { RecordOrder } from "@/components/admin/editor/RecordOrder";
import { Button, buttonClasses } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

import { ServicesClient } from "../api.client";
import type { ServiceListItems, ServiceSummaryItem } from "../types";

/** One service's row: its name, line and address, where it stands, opening its editor. */
function ServiceLink({ service }: { service: ServiceSummaryItem }) {
  return (
    <Link
      href={ADMIN_ROUTES.service(service.id)}
      className="grid min-w-0 flex-1 basis-56 gap-0.5 rounded-control px-2 py-2 hover:bg-mist"
    >
      <span className="font-semibold">{service.name || ADMIN_TEXT.unnamed}</span>
      <span className="text-small text-ink-2">
        {ADMIN_TEXT.audienceNames[service.audience]} · {ROUTES.service(service.slug)}
      </span>
    </Link>
  );
}

/** Services (plan §16, D92): their order, each opening its editor, New service, and the archived folded below. */
export function ServicesScreen() {
  const { data, error, isLoading, mutate } = useApiQuery<ServiceListItems>(ADMIN_API_ROUTES.adminServices);
  return (
    <div className="grid max-w-5xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-section font-bold">{ADMIN_TEXT.services}</h1>
          <p className="max-w-prose text-ink-2">{ADMIN_TEXT.servicesIntro}</p>
        </div>
        <Link href={ADMIN_ROUTES.newService} className={buttonClasses({ variant: "secondary" })}>
          <Pictogram name="plus" size="sm" />
          <span>{ADMIN_TEXT.newService}</span>
        </Link>
      </div>
      {error ? (
        <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
          <p>{errorMessage(error)}</p>
          <Button variant="secondary" onClick={() => mutate()} className="mt-3">
            {ADMIN_TEXT.tryAgain}
          </Button>
        </Notice>
      ) : isLoading || !data ? (
        <div aria-busy="true" aria-label={ADMIN_TEXT.loading} className="grid gap-3">
          {[0, 1, 2, 3].map((placeholder) => (
            <div key={placeholder} className="h-16 animate-pulse rounded-panel bg-mist" />
          ))}
        </div>
      ) : (
        <RecordOrder
          list={data}
          client={ServicesClient}
          path={ROUTES.services}
          empty={ADMIN_TEXT.noServices}
          row={(service) => <ServiceLink service={service} />}
          update={async (next, optimistic) => {
            await mutate(next, {
              optimisticData: optimistic,
              rollbackOnError: true,
              populateCache: true,
              revalidate: false,
            });
          }}
        />
      )}
    </div>
  );
}
