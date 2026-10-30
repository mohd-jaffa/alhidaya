"use client";

import Link from "next/link";

import { RecordOrder } from "@/components/admin/editor/RecordOrder";
import { Button, buttonClasses } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

import { ClientsClient } from "../api.client";
import type { ClientListItems, ClientSummaryItem } from "../types";

/** One logo's row: the logo in its fixed frame (plan §11), the organisation and its site, opening its editor. */
function ClientLink({ client }: { client: ClientSummaryItem }) {
  return (
    <Link
      href={ADMIN_ROUTES.client(client.id)}
      className="flex min-w-0 flex-1 basis-56 items-center gap-4 rounded-control px-2 py-2 hover:bg-mist"
    >
      <span className="grid aspect-[4/3] w-16 shrink-0 place-items-center rounded-control border border-rule bg-ground p-1.5">
        {client.logo ? (
          <MediaImage image={{ ...client.logo, alt: "" }} sizes="4rem" className="size-full object-contain" />
        ) : null}
      </span>
      <span className="grid min-w-0 gap-0.5">
        <span className="font-semibold">{client.name || ADMIN_TEXT.unnamed}</span>
        {client.url ? <span className="truncate text-small text-ink-2">{client.url}</span> : null}
      </span>
    </Link>
  );
}

/** Clients (plan §11, §16, D92): the logos in their order, each opening its editor, New client, the archived below. */
export function ClientsScreen() {
  const { data, error, isLoading, mutate } = useApiQuery<ClientListItems>(ADMIN_API_ROUTES.adminClients);
  return (
    <div className="grid max-w-5xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-section font-bold">{ADMIN_TEXT.clients}</h1>
          <p className="max-w-prose text-ink-2">{ADMIN_TEXT.clientsIntro}</p>
        </div>
        <Link href={ADMIN_ROUTES.newClient} className={buttonClasses({ variant: "secondary" })}>
          <Pictogram name="plus" size="sm" />
          <span>{ADMIN_TEXT.newClient}</span>
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
          {[0, 1, 2].map((placeholder) => (
            <div key={placeholder} className="h-16 animate-pulse rounded-panel bg-mist" />
          ))}
        </div>
      ) : (
        <RecordOrder
          list={data}
          client={ClientsClient}
          path={ROUTES.home}
          empty={ADMIN_TEXT.noClients}
          row={(client) => <ClientLink client={client} />}
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
