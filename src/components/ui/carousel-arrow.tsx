import { UI_TEXT } from "@/constants/messages";

import { Pictogram } from "./pictogram";

/** A plain chevron with a full touch target, inheriting its carousel's ink and focus colour. */
export function CarouselArrow({ direction, onClick }: { direction: "previous" | "next"; onClick: () => void }) {
  const previous = direction === "previous";
  return (
    <button
      type="button"
      aria-label={previous ? UI_TEXT.previousSlide : UI_TEXT.nextSlide}
      onClick={onClick}
      className="grid size-touch shrink-0 place-items-center rounded-control transition-transform duration-(--duration-press) ease-out hover:bg-current/10 focus-visible:outline-current active:scale-95"
    >
      <Pictogram name="chevronDown" className={previous ? "rotate-90 rtl:-rotate-90" : "-rotate-90 rtl:rotate-90"} />
    </button>
  );
}
