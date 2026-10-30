"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ADMIN_TEXT } from "@/constants/admin-messages";

/**
 * Asks before unsaved changes are left behind (D88). Closing or reloading
 * the tab, or going to another site, gets the browser's own question; a link
 * to another admin page gets this dialog, with Stay as the way out. Links
 * that open a new tab or download, and modified clicks, are let through.
 */
export function LeaveGuard({ active }: { active: boolean }) {
  const router = useRouter();
  const [leavingTo, setLeavingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const click = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      // Caught before the page's own handlers, so the link's navigation never starts.
      event.preventDefault();
      event.stopPropagation();
      setLeavingTo(`${url.pathname}${url.search}${url.hash}`);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
    };
  }, [active]);

  return (
    <Dialog open={leavingTo !== null} onClose={() => setLeavingTo(null)} title={ADMIN_TEXT.leaveTitle}>
      <div className="grid gap-5">
        <p>{ADMIN_TEXT.leaveBody}</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setLeavingTo(null)}>{ADMIN_TEXT.stay}</Button>
          <Button
            variant="secondary"
            onClick={() => {
              router.push(leavingTo!);
              setLeavingTo(null);
            }}
          >
            {ADMIN_TEXT.leave}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
