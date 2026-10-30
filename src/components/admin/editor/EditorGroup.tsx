import { type ReactNode, useId } from "react";

/**
 * One group of an editor's fields (D88, D92): a heading, what it is for, and
 * its fields at a reading width, divided from the group above by a rule.
 */
export function EditorGroup({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="grid gap-4 border-t border-rule pt-6 first-of-type:border-t-0 first-of-type:pt-0"
    >
      <div className="grid gap-1">
        <h2 id={id} className="text-title font-bold">
          {title}
        </h2>
        {hint ? <p className="text-small text-ink-2">{hint}</p> : null}
      </div>
      <div className="grid max-w-3xl gap-4">{children}</div>
    </section>
  );
}
