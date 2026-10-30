import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { deleteJson, patchJson, postForm } from "@/lib/api/client";
import type { ImageDetailsInput } from "@/lib/validation";

import type { LibraryImageItem } from "./types";

/** The endpoints the media library calls (plan §15, D93). */
export const MediaClient = {
  /** The image goes as a file beside its words, sent as one JSON part, read by the route's schema. */
  upload: ({ file, details }: { file: File; details: ImageDetailsInput }) => {
    const form = new FormData();
    form.set("fields", JSON.stringify(details));
    form.set("file", file);
    return postForm<LibraryImageItem>(ADMIN_API_ROUTES.adminMedia, form);
  },
  update: ({ id, details }: { id: string; details: ImageDetailsInput }) =>
    patchJson<LibraryImageItem>(ADMIN_API_ROUTES.adminMediaItem(id), details),
  remove: (id: string) => deleteJson<{ deleted: true }>(ADMIN_API_ROUTES.adminMediaItem(id)),
};
