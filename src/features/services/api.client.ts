import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { postJson, putJson } from "@/lib/api/client";
import type { ServiceDocument } from "@/lib/validation";

import type { ServiceDraftItem, ServiceListItems } from "./types";

/** The endpoints the Services screens call (plan §14, D92). */
export const ServicesClient = {
  create: (document: ServiceDocument) => postJson<ServiceDraftItem>(ADMIN_API_ROUTES.adminServices, document),
  save: ({ id, document }: { id: string; document: ServiceDocument }) =>
    putJson<ServiceDraftItem>(ADMIN_API_ROUTES.adminService(id), document),
  publish: (id: string) => postJson<ServiceDraftItem>(ADMIN_API_ROUTES.adminServicePublish(id)),
  discard: (id: string) => postJson<ServiceDraftItem>(ADMIN_API_ROUTES.adminServiceDiscard(id)),
  setArchived: ({ id, archived }: { id: string; archived: boolean }) =>
    postJson<ServiceDraftItem>(ADMIN_API_ROUTES.adminServiceArchive(id), { archived }),
  saveOrder: (ids: string[]) => putJson<ServiceListItems>(ADMIN_API_ROUTES.adminServiceOrder, ids),
  publishOrder: () => postJson<ServiceListItems>(ADMIN_API_ROUTES.adminServiceOrderPublish),
  discardOrder: () => postJson<ServiceListItems>(ADMIN_API_ROUTES.adminServiceOrderDiscard),
};
