import { UI_TEXT } from "@/constants/messages";

/** The first stop for a keyboard (plan §32): straight past the header to the page's content. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed start-4 top-4 z-(--z-overlay) -translate-y-[200%] rounded-control bg-deep px-4 py-3 font-semibold text-on-deep focus:translate-y-0 focus-visible:outline-focus-on-deep"
    >
      {UI_TEXT.skipToContent}
    </a>
  );
}
