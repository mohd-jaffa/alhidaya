"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

/** The dialog, opened from a button, for the kit page (plan D64). */
export function DialogDemo({ label, title, body }: { label: string; title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <p>{body}</p>
      </Dialog>
    </>
  );
}
