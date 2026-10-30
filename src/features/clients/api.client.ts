import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { postJson, putJson } from "@/lib/api/client";
import type { ClientDocument } from "@/lib/validation";

import type { ClientDraftItem, ClientListItems } from "./types";

/** The endpoints the Clients screens call (plan §11, §14, D92). */
export const ClientsClient = {
  create: (document: ClientDocument) => postJson<ClientDraftItem>(ADMIN_API_ROUTES.adminClients, document),
  save: ({ id, document }: { id: string; document: ClientDocument }) =>
    putJson<ClientDraftItem>(ADMIN_API_ROUTES.adminClient(id), document),
  publish: (id: string) => postJson<ClientDraftItem>(ADMIN_API_ROUTES.adminClientPublish(id)),
  discard: (id: string) => postJson<ClientDraftItem>(ADMIN_API_ROUTES.adminClientDiscard(id)),
  setArchived: ({ id, archived }: { id: string; archived: boolean }) =>
    postJson<ClientDraftItem>(ADMIN_API_ROUTES.adminClientArchive(id), { archived }),
  saveOrder: (ids: string[]) => putJson<ClientListItems>(ADMIN_API_ROUTES.adminClientOrder, ids),
  publishOrder: () => postJson<ClientListItems>(ADMIN_API_ROUTES.adminClientOrderPublish),
  discardOrder: () => postJson<ClientListItems>(ADMIN_API_ROUTES.adminClientOrderDiscard),
};
