"use client";

import { useState } from "react";
import { useController } from "react-hook-form";

import { EditorText, useEditorError } from "@/components/admin/editor/EditorText";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { TEXT_LIMITS } from "@/constants/limits";
import { PAGE_NAMES } from "@/constants/messages";
import { PAGE_ROUTES, ROUTES } from "@/constants/routes";
import { PAGE_KEYS } from "@/constants/sections";
import type { ServiceListItems } from "@/features/services/types";
import { useApiQuery } from "@/lib/query/useApiQuery";

/** The choice that turns the address into a field to type in. */
const OTHER = "other";

/**
 * Where a menu or footer link goes (D94): one of the site's pages, a
 * published service or the brochure, picked from a list; or another
 * address, typed in (a full https:// one, or a page of this site).
 */
export function LinkTarget({ name }: { name: string }) {
  const { field } = useController({ name });
  const value = (field.value as string | undefined) ?? "";
  const services = useApiQuery<ServiceListItems>(ADMIN_API_ROUTES.adminServices);
  const [typing, setTyping] = useState(false);
  const error = useEditorError(name);
  const options: (readonly [href: string, label: string])[] = [
    ...PAGE_KEYS.map((page) => [PAGE_ROUTES[page], PAGE_NAMES[page]] as const),
    ...(services.data?.items ?? [])
      .filter((service) => service.publishedAt && !service.archivedAt)
      .map((service) => [ROUTES.service(service.slug), `${ADMIN_TEXT.services} · ${service.name}`] as const),
    [ROUTES.brochure, ADMIN_TEXT.brochure],
  ];
  const known = options.some(([href]) => href === value);
  const other = typing || (value !== "" && !known);
  return (
    <div className="grid gap-4">
      <Field label={ADMIN_TEXT.goesTo} error={other ? undefined : error} required>
        <Select
          value={other ? OTHER : value}
          onBlur={field.onBlur}
          onChange={(event) => {
            const chosen = event.target.value;
            setTyping(chosen === OTHER);
            field.onChange(chosen === OTHER ? "" : chosen);
          }}
        >
          <option value="">{ADMIN_TEXT.chooseKind}</option>
          {options.map(([href, label]) => (
            <option key={href} value={href}>
              {label}
            </option>
          ))}
          <option value={OTHER}>{ADMIN_TEXT.anotherAddress}</option>
        </Select>
      </Field>
      {other ? (
        <EditorText
          name={name}
          label={ADMIN_TEXT.linkAddress}
          hint={ADMIN_TEXT.linkHint}
          max={TEXT_LIMITS.url}
          required
        />
      ) : null}
    </div>
  );
}
