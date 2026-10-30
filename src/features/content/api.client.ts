import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import type { PageKey } from "@/constants/sections";
import { postJson, putJson } from "@/lib/api/client";
import type { PageDocument } from "@/lib/validation";

import type { PageDraftItem } from "./types";

/** The endpoints the Pages editor calls (plan §14, D88): save a page's draft whole, publish it, discard it. */
export const PagesClient = {
  save: ({ page, document }: { page: PageKey; document: PageDocument }) =>
    putJson<PageDraftItem>(ADMIN_API_ROUTES.adminPage(page), document),
  publish: (page: PageKey) => postJson<{ publishedAt: string }>(ADMIN_API_ROUTES.adminPagePublish(page)),
  discard: (page: PageKey) => postJson<PageDraftItem>(ADMIN_API_ROUTES.adminPageDiscard(page)),
};
