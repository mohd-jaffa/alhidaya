"use client";

import Link from "next/link";

import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import type { OperationsViewItem } from "@/features/settings/types";
import { useApiQuery } from "@/lib/query/useApiQuery";

import { nearlyFull, percentUsed } from "./DiskMeter";

/**
 * Today's warning that the server is running out of room (plan §21.2, D95):
 * only once a folder passes its warning point, saying what makes room.
 */
export function DiskWarning() {
  const { data } = useApiQuery<OperationsViewItem>(ADMIN_API_ROUTES.adminOperations);
  if (!data || !(nearlyFull(data.disk.media) || nearlyFull(data.disk.cvs))) return null;
  return (
    <Notice tone="error" title={ADMIN_TEXT.diskWarningTitle}>
      <ul className="grid gap-1">
        {nearlyFull(data.disk.media) ? (
          <li>
            {ADMIN_TEXT.diskWarningMedia(percentUsed(data.disk.media))}{" "}
            <Link href={ADMIN_ROUTES.media} className="font-semibold text-deep underline underline-offset-4">
              {ADMIN_TEXT.media}
            </Link>
          </li>
        ) : null}
        {nearlyFull(data.disk.cvs) ? (
          <li>
            {ADMIN_TEXT.diskWarningCvs(percentUsed(data.disk.cvs))}{" "}
            <Link href={ADMIN_ROUTES.operations} className="font-semibold text-deep underline underline-offset-4">
              {ADMIN_TEXT.operations}
            </Link>
          </li>
        ) : null}
      </ul>
    </Notice>
  );
}
