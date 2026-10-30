"use client";

import { type ReactNode, useState } from "react";

import { AskedAction } from "@/components/admin/AskedAction";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { buttonClasses } from "@/components/ui/button";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { API_ROUTES } from "@/constants/routes";
import { errorMessage } from "@/lib/errors/errorMessage";

import { DraftStateChip, type DraftState } from "./DraftStateChip";
import { DragHandle, DropLine, useDragOrder } from "./DragOrder";
import { ItemControls } from "./ItemControls";

/** A record in an ordered list (D92): its id, the name its row says, and where it stands. */
export interface OrderedItem extends DraftState {
  id: string;
  name: string;
}

export interface OrderedList<T extends OrderedItem> {
  items: T[];
  order: { publishedAt: string | null; unpublishedChanges: boolean };
}

/**
 * A collection in its order (D92): the services, the client logos. Each row
 * is dragged by its handle or moved with Move up and Move down, each move
 * saved as the order's draft at once and said aloud; the new order goes live
 * with its own Publish, asked first, or is discarded. The archived fold below.
 */
export function RecordOrder<T extends OrderedItem>({
  list,
  update,
  client,
  path,
  empty,
  row,
}: {
  list: OrderedList<T>;
  /** Writes the list's cache: from an answer, shown at once when `optimistic` is given, put back if it fails. */
  update: (next: Promise<OrderedList<T>>, optimistic?: OrderedList<T>) => Promise<void>;
  client: {
    saveOrder: (ids: string[]) => Promise<OrderedList<T>>;
    publishOrder: () => Promise<OrderedList<T>>;
    discardOrder: () => Promise<OrderedList<T>>;
  };
  /** The page that shows the collection, for Preview and once published. */
  path: string;
  empty: string;
  /** A row's own words, opening its editor. */
  row: (item: T) => ReactNode;
}) {
  const shown = list.items.filter((item) => !item.archivedAt);
  const archived = list.items.filter((item) => item.archivedAt);
  const [said, setSaid] = useState("");
  const [failure, setFailure] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const move = async (from: number, to: number) => {
    const order = [...shown];
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    setSaid(ADMIN_TEXT.movedTo(moved.name || ADMIN_TEXT.unnamed, to + 1, order.length));
    setFailure(null);
    setPublished(false);
    try {
      await update(client.saveOrder(order.map((item) => item.id)), {
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
            href={path}
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
              href={`${API_ROUTES.preview}?path=${encodeURIComponent(path)}`}
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
                act={() => client.discardOrder()}
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
              act={() => client.publishOrder()}
              afterwards={(next) => {
                setPublished(true);
                void update(Promise.resolve(next));
              }}
            />
          </div>
        </section>
      ) : null}

      {shown.length === 0 ? (
        <p className="text-ink-2">{empty}</p>
      ) : (
        <ol className="grid">
          {shown.map((item, index) => {
            const thing = item.name || ADMIN_TEXT.unnamed;
            return (
              <li key={item.id} className="relative" {...drag.target(index)}>
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
                  {row(item)}
                  <DraftStateChip state={item} />
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
            {archived.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-2 border-b border-rule px-2 py-1.5">
                {row(item)}
                <DraftStateChip state={item} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
