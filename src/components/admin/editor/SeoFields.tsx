"use client";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { TEXT_LIMITS } from "@/constants/limits";

import { EditorGroup } from "./EditorGroup";
import { EditorText } from "./EditorText";

/** The words search engines and shares read (plan §19), last in every editor; `hint` says what stands in when empty. */
export function SeoFields({ hint }: { hint: string }) {
  return (
    <EditorGroup title={ADMIN_TEXT.seo} hint={hint}>
      <EditorText name="seo.title.en" label={ADMIN_TEXT.seoTitle} max={TEXT_LIMITS.seoTitle} />
      <EditorText
        name="seo.description.en"
        label={ADMIN_TEXT.seoDescription}
        max={TEXT_LIMITS.seoDescription}
        multiline
        rows={2}
      />
    </EditorGroup>
  );
}
