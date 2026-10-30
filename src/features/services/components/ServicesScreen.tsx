"use client";

import Link from "next/link";
import { useState } from "react";

import { AskedAction } from "@/components/admin/AskedAction";
import { DraftStateChip } from "@/components/admin/editor/DraftStateChip";
import { DragHandle, DropLine, useDragOrder } from "@/components/admin/editor/DragOrder";
import { ItemControls } from "@/components/admin/editor/ItemControls";
import { Button, buttonClasses } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { API_ROUTES, ROUTES } from "@/constants/routes";
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

/**
 * The services in their order (D92): dragged by their handles or moved with
 * Move up and Move down, each move saved as the order's draft at once and
 * said aloud; the new order goes live with its own Publish, asked first.
 */
function ServiceOrder({
  list,
  update,
}: {
  list: ServiceListItems;
  update: (next: Promise<ServiceListItems>, optimistic?: ServiceListItems) => Promise<void>;
}) {
  const shown = list.items.filter((service) => !service.archivedAt);
  const archived = list.items.filter((service) => service.archivedAt);
  const [said, setSaid] = useState("");
  const [failure, setFailure] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const move = async (from: number, to: number) => {
    const order = [...shown];
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    setSaid(ADMIN_TEXT.movedTo(moved.name, to + 1, order.length));
    setFailure(null);
    setPublished(false);
    try {
      await update(ServicesClient.saveOrder(order.map((service) => service.id)), {
        items: [...order, ...archived],
        order: { ...list.order, unpublishedChanges: true },
      });
    } catch (error) {
      setFailure(errorMessage(error));
    }
  };
  const drag = useDragOrder({ onMove: move });

  return (
    <div className="grid gap-6">
      {failure ? (
        <Notice tone="error" title={ADMIN_TEXT.orderNotSaved}>
          <p>{failure}</p>
        </Notice>
      ) : null}
      {published && !list.order.unpublishedChanges ? (
        <Notice tone="success" title={ADMIN_TEXT.orderPublished}>
          <a
            href={ROUTES.services}
            target="_blank"
            rel="noopener"
            className="font-semibold text-deep underline underline-offset-4"
          >
            {ADMIN_TEXT.seeOnSite}
          </a>
        </Notice>
      ) : null}
      {list.order.unpublishedChanges ? (
        <section
          aria-labelledby="order-heading"
          className="grid gap-3 rounded-panel border border-rule bg-mist p-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between"
        >
          <div className="grid gap-0.5">
            <h2 id="order-heading" className="font-bold">
              {ADMIN_TEXT.order}
            </h2>
            <p className="text-small text-ink-2">{ADMIN_TEXT.orderWaiting}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.services)}`}
              target="_blank"
              rel="noopener"
              className={buttonClasses({ variant: "quiet" })}
            >
              <span>{ADMIN_TEXT.preview}</span>
              <Pictogram name="external" size="sm" />
            </a>
            {list.order.publishedAt ? (
              <AskedAction
                label={ADMIN_TEXT.discardOrder}
                title={ADMIN_TEXT.discardOrderTitle}
                body={ADMIN_TEXT.discardOrderBody}
                keep={ADMIN_TEXT.keepChanges}
                failed={ADMIN_TEXT.notDiscarded}
                act={() => ServicesClient.discardOrder()}
                afterwards={(next) => update(Promise.resolve(next))}
              />
            ) : null}
            <AskedAction
              primary
              label={ADMIN_TEXT.publishOrder}
              pendingLabel={ADMIN_TEXT.publishing}
              title={ADMIN_TEXT.publishOrderTitle}
              body={ADMIN_TEXT.publishOrderBody}
              keep={ADMIN_TEXT.keepEditing}
              failed={ADMIN_TEXT.orderNotPublished}
              act={() => ServicesClient.publishOrder()}
              afterwards={(next) => {
                setPublished(true);
                void update(Promise.resolve(next));
              }}
            />
          </div>
        </section>
      ) : null}

      {shown.length === 0 ? (
        <p className="text-ink-2">{ADMIN_TEXT.noServices}</p>
      ) : (
        <ol className="grid">
          {shown.map((service, index) => {
            const thing = service.name || ADMIN_TEXT.unnamed;
            return (
              <li key={service.id} className="relative" {...drag.target(index)}>
                <DropLine side={drag.lineAt(index)} />
                <article className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-rule px-2 py-1.5">
                  <DragHandle
                    thing={thing}
                    hint={ADMIN_TEXT.orderHint}
                    onStart={() => drag.start(index)}
                    onEnd={drag.end}
                  />
                  <span aria-hidden="true" className="w-6 text-center text-small font-bold text-ink-2 tabular-nums">
                    {index + 1}
                  </span>
                  <ServiceLink service={service} />
                  <DraftStateChip state={service} />
                  <ItemControls thing={thing} index={index} count={shown.length} onMove={(to) => move(index, to)} />
                </article>
              </li>
            );
          })}
        </ol>
      )}
      <p aria-live="polite" className="sr-only">
        {said}
      </p>

      {archived.length > 0 ? (
        <details className="group grid gap-2">
          <summary className="flex min-h-touch cursor-pointer items-center gap-2 font-semibold text-deep">
            <Pictogram name="chevronDown" size="sm" className="transition-transform group-open:rotate-180" />
            {ADMIN_TEXT.archivedCount(archived.length)}
          </summary>
          <ul className="grid">
            {archived.map((service) => (
              <li key={service.id} className="flex flex-wrap items-center gap-2 border-b border-rule px-2 py-1.5">
                <ServiceLink service={service} />
                <DraftStateChip state={service} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
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
        <ServiceOrder
          list={data}
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
