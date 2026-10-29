import * as z from "zod";

import { VALIDATION_MESSAGES } from "@/constants/messages";

import { isSafeHref } from "./content";

/** A page of the public site: never another site, the admin or the API. */
const isPublicPath = (path: string) =>
  path.startsWith("/") && isSafeHref(path) && !/^\/(admin|api)(\/|$|\?|#)/.test(path);

/** Which page the admin's preview opens on (plan §14); Home when none is named. */
export const previewQuerySchema = z.object({
  path: z.string().refine(isPublicPath, VALIDATION_MESSAGES.link).default("/"),
});
export type PreviewQueryPayload = z.output<typeof previewQuerySchema>;
