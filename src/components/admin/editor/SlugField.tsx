"use client";

import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { TEXT_LIMITS } from "@/constants/limits";
import { slugify } from "@/lib/text/slug";

import { EditorText } from "./EditorText";

/**
 * A web address (D92): filled in from the name as it is typed, while it
 * still is the name's and was never published; once the admin edits it, or
 * it is on the website, it stays as it is. Its full address shows beneath.
 */
export function SlugField({
  from,
  address,
  follow,
}: {
  /** The field it is made from: a service's name, a job's title. */
  from: string;
  /** The page it gives, for a slug: `/services/…`. */
  address: (slug: string) => string;
  /** Whether it may still follow the name: never published. */
  follow: boolean;
}) {
  const { setValue, getValues } = useFormContext();
  const name = useWatch({ name: from }) as string;
  const slug = useWatch({ name: "slug" }) as string;
  const before = useRef(name);

  useEffect(() => {
    const previous = before.current;
    if (previous === name) return;
    before.current = name;
    const current = getValues("slug") as string;
    if (follow && (current === "" || current === slugify(previous))) {
      setValue("slug", slugify(name), { shouldDirty: true });
    }
  }, [name, follow, getValues, setValue]);

  return (
    <EditorText
      name="slug"
      label={ADMIN_TEXT.webAddress}
      hint={ADMIN_TEXT.webAddressHint(address(slug || "…"), follow)}
      max={TEXT_LIMITS.slug}
      required
    />
  );
}
