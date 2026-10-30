import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { postForm, postJson, putJson } from "@/lib/api/client";
import type { OperationsPayload, SiteDocument } from "@/lib/validation";

import type { OperationsViewItem, SiteDraftItem } from "./types";

/** The endpoints Settings calls (plan §13, D94). */
export const SiteClient = {
  save: (document: SiteDocument) => putJson<SiteDraftItem>(ADMIN_API_ROUTES.adminSite, document),
  publish: () => postJson<SiteDraftItem>(ADMIN_API_ROUTES.adminSitePublish),
  discard: () => postJson<SiteDraftItem>(ADMIN_API_ROUTES.adminSiteDiscard),
  /** A new brochure, sent as its file beside an empty part for its words. */
  uploadBrochure: (file: File) => {
    const form = new FormData();
    form.set("fields", "{}");
    form.set("file", file);
    return postForm<NonNullable<SiteDraftItem["brochure"]>>(ADMIN_API_ROUTES.adminSiteBrochure, form);
  },
};

/** The endpoint Operations calls (plan §13, D95): its settings saved, at once. */
export const OperationsClient = {
  save: (operations: OperationsPayload) => putJson<OperationsViewItem>(ADMIN_API_ROUTES.adminOperations, operations),
};
