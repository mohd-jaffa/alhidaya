"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { Checkbox } from "@/components/ui/choice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { TEXT_LIMITS } from "@/constants/limits";

import { EditorText } from "./EditorText";

/**
 * An image's words (plan §15, D93): what it shows, unless it is marked
 * decorative, and, folded, where a stock photo came from. The same fields
 * when it is uploaded and when its words are changed.
 */
export function ImageWords() {
  const { register } = useFormContext();
  const decorative = useWatch({ name: "decorative" }) as boolean;
  const source = useWatch({ name: "source" }) as { provider: string | null; url: string | null };
  const hasSource = Boolean(source.provider || source.url);
  return (
    <div className="grid gap-4">
      {decorative ? null : (
        <EditorText
          name="alt"
          label={ADMIN_TEXT.altText}
          hint={ADMIN_TEXT.altHint}
          max={TEXT_LIMITS.alt}
          required
          multiline
          rows={2}
        />
      )}
      <Checkbox {...register("decorative")}>{ADMIN_TEXT.decorative}</Checkbox>
      <details open={hasSource} className="group grid gap-3">
        <summary className="flex min-h-touch cursor-pointer items-center gap-2 font-semibold text-deep">
          <Pictogram name="chevronDown" size="sm" className="transition-transform group-open:rotate-180" />
          {ADMIN_TEXT.sourceTitle}
        </summary>
        <div className="grid gap-4 pt-2">
          <p className="text-small text-ink-2">{ADMIN_TEXT.sourceHint}</p>
          <EditorText
            name="source.provider"
            label={ADMIN_TEXT.sourceProvider}
            hint={ADMIN_TEXT.sourceProviderHint}
            max={TEXT_LIMITS.label}
          />
          <EditorText name="source.url" label={ADMIN_TEXT.sourceLink} max={TEXT_LIMITS.url} />
          <EditorText name="source.licence" label={ADMIN_TEXT.sourceLicence} max={TEXT_LIMITS.label} />
        </div>
      </details>
    </div>
  );
}

/** An image's words as its form starts them: from what is kept, or blank for a new one. */
export function imageWordsOf(image?: {
  alt: string;
  decorative: boolean;
  source: { provider: string | null; url: string | null; licence: string | null } | null;
}) {
  return {
    alt: image?.decorative ? "" : (image?.alt ?? ""),
    decorative: image?.decorative ?? false,
    source: {
      provider: image?.source?.provider ?? "",
      url: image?.source?.url ?? "",
      licence: image?.source?.licence ?? "",
    },
  };
}
