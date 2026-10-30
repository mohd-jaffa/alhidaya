import type { ReactNode } from "react";

/**
 * Who a section or page speaks to (D97, D105): a pale-green pill above its
 * heading, as the reference sets it; a heading itself where it names a group.
 */
export function PillLabel({ as: Tag = "p", children }: { as?: "p" | "h2" | "h3"; children: ReactNode }) {
  return (
    <Tag className="inline-flex min-h-9 items-center rounded-pill bg-leaf-pale px-4 text-body font-medium text-forest">
      {children}
    </Tag>
  );
}
