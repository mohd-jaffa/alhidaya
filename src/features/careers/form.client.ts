import { API_ROUTES } from "@/constants/routes";
import { postForm } from "@/lib/api/client";

/**
 * The endpoint the application form calls (AGENTS.md §14), apart from the
 * inbox's in `api.client.ts`, so the public page never carries the admin's
 * addresses (plan §31).
 */
export const CareersClient = {
  /**
   * What was typed goes as one JSON part, to be read once more by the route's
   * schema exactly as a JSON body would be, and the CV as a file beside it.
   */
  apply: (values: Record<string, unknown>) => {
    const { cv, ...fields } = values;
    const form = new FormData();
    form.set("fields", JSON.stringify(fields));
    if (cv instanceof File) form.set("cv", cv);
    return postForm<{ received: true }>(API_ROUTES.applications, form);
  },
};
