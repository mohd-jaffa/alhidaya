"use client";

import { ADMIN_TEXT } from "@/constants/admin-messages";

import { AskedAction } from "./AskedAction";

/**
 * Delete, asked first (D82): the dialog says what goes and that it cannot
 * be undone; Keep it is the way out, and Escape or Close the same. Deleted,
 * the lists it was in are refreshed and `afterwards` runs; a failure says
 * so in the dialog, and nothing went.
 */
export function DeleteAction({
  title,
  body,
  remove,
  revalidate,
  afterwards,
}: {
  title: string;
  body: string;
  remove: () => Promise<unknown>;
  /** The lists it leaves. */
  revalidate: readonly string[];
  afterwards?: () => void;
}) {
  return (
    <AskedAction
      label={ADMIN_TEXT.delete}
      pendingLabel={ADMIN_TEXT.deleting}
      title={title}
      body={body}
      keep={ADMIN_TEXT.keep}
      failed={ADMIN_TEXT.notDeleted}
      act={remove}
      revalidate={revalidate}
      afterwards={afterwards ? () => afterwards() : undefined}
    />
  );
}
