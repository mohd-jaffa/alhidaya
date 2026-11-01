"use client";

import { type ChangeEvent, type ComponentProps, useState } from "react";

import { UI_TEXT } from "@/constants/messages";
import { formatBytes } from "@/lib/files/size";

import { useFieldControl } from "./field";
import { Pictogram } from "./pictogram";

/**
 * A file to send inside a `Field` (plan §9.2): the browser's own picker, out
 * of sight but in reach, behind a large target that says what was chosen and
 * how big it is. The field's hint names the types and the size allowed.
 */
export function FileInput({ onChange, ...props }: Omit<ComponentProps<"input">, "type" | "id">) {
  const control = useFieldControl();
  const [chosen, setChosen] = useState<{ name: string; size: number } | null>(null);

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setChosen(file ? { name: file.name, size: file.size } : null);
    onChange?.(event);
  };

  return (
    <div className="relative">
      <input
        {...control}
        type="file"
        {...props}
        onChange={change}
        className="peer absolute inset-0 size-full cursor-pointer opacity-0"
      />
      <div
        className={`flex min-h-touch items-center gap-4 border-[1.5px] border-dashed border-ink-2 px-4 py-4 peer-hover:border-navy peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-focus peer-aria-invalid:border-2 peer-aria-invalid:border-error rounded-control bg-mist`}
      >
        <Pictogram name="upload" size="lg" className="text-deep" />
        <div className="grid min-w-0 gap-1">
          <span className="font-semibold text-deep">{chosen ? UI_TEXT.replaceFile : UI_TEXT.chooseFile}</span>
          <span className="truncate text-small text-ink-2">
            {chosen ? `${chosen.name} · ${formatBytes(chosen.size)}` : UI_TEXT.noFileChosen}
          </span>
        </div>
      </div>
    </div>
  );
}
