"use client";

import { useFieldArray, useWatch } from "react-hook-form";

import { EditorSelect } from "@/components/admin/editor/EditorSelect";
import { EditorText, useEditorError } from "@/components/admin/editor/EditorText";
import { ItemControls } from "@/components/admin/editor/ItemControls";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { SOCIAL_NETWORK_LABELS, SOCIAL_NETWORKS } from "@/constants/statuses";

const NETWORK_OPTIONS = SOCIAL_NETWORKS.map((network) => [network, SOCIAL_NETWORK_LABELS[network]] as const);

/** The company's social profiles (plan §13): each its network and its https address, one per network. */
export function SocialLinksField() {
  const { fields, append, move, remove } = useFieldArray({ name: "social", keyName: "key" });
  const chosen = (useWatch({ name: "social" }) as { network: string }[]).map((link) => link.network);
  const error = useEditorError("social");
  const next = SOCIAL_NETWORKS.find((network) => !chosen.includes(network));
  return (
    <div className="grid gap-3">
      <ol className="grid gap-3 empty:hidden">
        {fields.map((field, index) => {
          const thing = ADMIN_TEXT.numbered(ADMIN_TEXT.socialLink, index + 1);
          return (
            <li key={field.key} className="grid gap-3 rounded-control border border-rule bg-ground p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-small font-bold text-ink-2">{thing}</p>
                <ItemControls
                  thing={thing}
                  index={index}
                  count={fields.length}
                  onMove={(to) => move(index, to)}
                  onRemove={() => remove(index)}
                />
              </div>
              <EditorSelect name={`social.${index}.network`} label={ADMIN_TEXT.network} options={NETWORK_OPTIONS} />
              <EditorText name={`social.${index}.url`} label={ADMIN_TEXT.profileLink} max={TEXT_LIMITS.url} required />
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {next && fields.length < LIST_LIMITS.social ? (
        <Button
          variant="quiet"
          pictogram="plus"
          onClick={() => append({ network: next, url: "" })}
          className="justify-self-start"
        >
          {ADMIN_TEXT.addSocial}
        </Button>
      ) : null}
    </div>
  );
}
