"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { DraftEditor } from "@/components/admin/editor/DraftEditor";
import { EditorGroup } from "@/components/admin/editor/EditorGroup";
import { EditorLoading } from "@/components/admin/editor/EditorLoading";
import { EditorSelect } from "@/components/admin/editor/EditorSelect";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { FONT_IDS, FONT_NAMES, FONT_STACKS, type FontRole } from "@/constants/typography";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { typographySchema, type TypographyInput, type TypographyPayload } from "@/lib/validation/schemas/typography";

import { TypographyClient } from "../api.client";
import type { TypographyDraftItem } from "../types";

const OPTIONS = FONT_IDS.map((id) => [id, FONT_NAMES[id]] as const);
const GROUPS: { title: string; roles: FontRole[] }[] = [
  { title: ADMIN_TEXT.fontGroups.headings, roles: ["h1", "h2", "h3", "h4"] },
  { title: ADMIN_TEXT.fontGroups.reading, roles: ["lead", "paragraph", "small", "caption"] },
  { title: ADMIN_TEXT.fontGroups.forms, roles: ["label", "legend", "input", "placeholder", "error"] },
  { title: ADMIN_TEXT.fontGroups.actions, roles: ["button", "link"] },
  { title: ADMIN_TEXT.fontGroups.other, roles: ["list", "status", "detail", "emphasis", "summary"] },
];

/** Only the specimen changes font; the editor's labels, fields and toolbar remain unchanged. */
function FontChoice({ role }: { role: FontRole }) {
  const id = useWatch<TypographyInput, `roles.${FontRole}`>({ name: `roles.${role}` });
  return (
    <div className="grid min-w-0 gap-3 border-b border-rule pb-5 sm:grid-cols-2 sm:items-center sm:gap-6">
      <EditorSelect name={`roles.${role}`} label={ADMIN_TEXT.fontRoleLabels[role]} options={OPTIONS} />
      <p
        aria-label={ADMIN_TEXT.fontSample(ADMIN_TEXT.fontRoleLabels[role])}
        className={`min-w-0 wrap-anywhere ${role.startsWith("h") ? "text-title font-semibold" : "text-body"}`}
        style={{ fontFamily: FONT_STACKS[id] }}
      >
        {ADMIN_TEXT.fontSamples[role]}
      </p>
    </div>
  );
}

function FontsForm({ initial }: { initial: TypographyDraftItem }) {
  const [item, setItem] = useState(initial);
  const form = useForm<TypographyInput, unknown, TypographyPayload>({
    resolver: zodResolver(typographySchema),
    defaultValues: initial.draft,
  });
  const refresh = useRevalidate();
  const show = async (saved: TypographyDraftItem, reset = true) => {
    setItem(saved);
    if (reset) form.reset(saved.draft);
    await refresh([ADMIN_API_ROUTES.adminTypography]);
  };
  return (
    <DraftEditor
      form={form}
      name={ADMIN_TEXT.fontManager}
      state={item}
      path={ROUTES.home}
      save={async (document) => show(await TypographyClient.save(document))}
      publish={async () => show(await TypographyClient.publish(), false)}
      discard={async () => show(await TypographyClient.discard())}
    >
      <p className="max-w-prose text-ink-2">{ADMIN_TEXT.fontManagerIntro}</p>
      <p className="max-w-prose text-small text-ink-2">{ADMIN_TEXT.fontManagerHint}</p>
      {GROUPS.map((group) => (
        <EditorGroup key={group.title} title={group.title}>
          {group.roles.map((role) => (
            <FontChoice key={role} role={role} />
          ))}
        </EditorGroup>
      ))}
    </DraftEditor>
  );
}

export function FontManager() {
  const { data, error, isLoading, mutate } = useApiQuery<TypographyDraftItem>(ADMIN_API_ROUTES.adminTypography);
  if (error)
    return (
      <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
        <p>{errorMessage(error)}</p>
        <Button variant="secondary" onClick={() => mutate()} className="mt-3">
          {ADMIN_TEXT.tryAgain}
        </Button>
      </Notice>
    );
  if (isLoading || !data) return <EditorLoading />;
  return <FontsForm initial={data} />;
}
