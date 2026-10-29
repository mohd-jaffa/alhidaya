import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";

import { getAdminSession } from "@/lib/auth/session";

/** Which copy of the content a request sees (plan §14): what is published, or the admin's drafts. */
export type ContentView = "published" | "preview";

/**
 * The admin's preview shows drafts only while both hold (plan §14, §26.1):
 * draft mode is on, which only the signed-in admin can turn on, and the
 * admin's session is still valid. A preview cookie left after signing out
 * shows what is published.
 */
export async function contentView(): Promise<ContentView> {
  if (!(await draftMode()).isEnabled) return "published";
  return (await getAdminSession(await headers())) ? "preview" : "published";
}

/** A preview is never indexed (plan §19); what is published is. */
export async function previewMetadata(): Promise<Metadata> {
  return (await contentView()) === "preview" ? { robots: { index: false, follow: false } } : {};
}
