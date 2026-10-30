import type { ReactNode } from "react";

/** Who a section speaks to (D97, D105): a pale-green pill above its heading, as the reference sets it. */
export function PillLabel({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex min-h-9 items-center rounded-pill bg-leaf-pale px-4 text-body font-medium text-forest">
      {children}
    </p>
  );
}
