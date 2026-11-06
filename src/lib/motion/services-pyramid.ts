import { REDUCED_MOTION_QUERY } from "./preferences";

/** Approved three-card landscape composition (D185), independent of the hero's three-second clock. */
export const SERVICES_PYRAMID = {
  first: 2,
  spread: 0.14,
  scales: [1, 0.88],
  photos: [1, 0.72],
  swipe: 35,
} as const;

export function mountServicesPyramid(root: HTMLElement): () => void {
  const list = root.querySelector<HTMLUListElement>("ul")!;
  const cards = Array.from(list.children) as HTMLElement[];
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-step]");
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
  let at = cards.length > SERVICES_PYRAMID.first ? SERVICES_PYRAMID.first : 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let visible = false;
  let touching: { id: number; x: number; y: number } | null = null;
  let keyboard = false;
  let swiped = false;
  root.dataset.pyramid = "true";

  const render = () => {
    const width = list.clientWidth;
    const spread = width * SERVICES_PYRAMID.spread;
    const style = getComputedStyle(root);
    const rtl = style.direction === "rtl" ? -1 : 1;
    // Keep the native row's layout boxes fixed. Only transforms compose the
    // pyramid, so the deferred enhancement cannot cause a layout shift.
    const centres = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
    cards.forEach((card, index) => {
      let offset = (index - at + cards.length) % cards.length;
      if (offset > cards.length / 2) offset -= cards.length;
      const depth = Math.abs(offset);
      const shown = depth <= 1;
      const layer = Math.min(depth, 1);
      card.dataset.current = String(index === at);
      card.inert = !shown;
      card.setAttribute("aria-hidden", String(!shown));
      card.style.zIndex = String(cards.length - layer);
      card.style.opacity = shown ? "1" : "0";
      card.style.transform = `translateX(${width / 2 - centres[index] + rtl * offset * spread}px) scale(${SERVICES_PYRAMID.scales[layer]})`;
      card.style.setProperty("--pyramid-photo-opacity", String(SERVICES_PYRAMID.photos[layer]));
    });
  };
  const schedule = () => {
    clearTimeout(timer);
    if (
      cards.length < 2 ||
      reduced.matches ||
      !visible ||
      document.hidden ||
      (keyboard && root.contains(document.activeElement))
    )
      return;
    timer = setTimeout(
      () => move(1),
      Number.parseFloat(getComputedStyle(root).getPropertyValue("--duration-slide")) * 1000,
    );
  };
  const move = (step: number) => {
    at = (at + step + cards.length) % cards.length;
    render();
    schedule();
  };
  const click = (event: Event) => move(Number((event.currentTarget as HTMLElement).dataset.step));
  const key = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      keyboard = true;
      swiped = false;
    }
  };
  const focus = (event: FocusEvent) => {
    const card = (event.target as HTMLElement).closest("li");
    if (card && keyboard) {
      at = cards.indexOf(card);
      render();
    }
    schedule();
  };
  const down = (event: PointerEvent) => {
    keyboard = false;
    swiped = false;
    schedule();
    if (touching || event.isPrimary === false || event.button > 0) return;
    touching = { id: event.pointerId ?? 0, x: event.clientX, y: event.clientY ?? 0 };
  };
  const up = (event: PointerEvent) => {
    if (!touching || touching.id !== (event.pointerId ?? 0)) return;
    const { x, y } = touching;
    touching = null;
    const dx = event.clientX - x;
    if (Math.abs(dx) > SERVICES_PYRAMID.swipe && Math.abs(dx) > Math.abs((event.clientY ?? 0) - y)) {
      swiped = true;
      move((dx < 0 ? 1 : -1) * (getComputedStyle(root).direction === "rtl" ? -1 : 1));
    }
  };
  const cancel = () => {
    touching = null;
  };
  const preventSwipeClick = (event: MouseEvent) => {
    if (swiped) {
      event.preventDefault();
      swiped = false;
    }
  };
  const visibility = () => {
    if (document.hidden) cancel();
    schedule();
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    },
    { threshold: 0.1 },
  );
  const resize = new ResizeObserver(render);
  observer.observe(root);
  resize.observe(list);
  buttons.forEach((button) => button.addEventListener("click", click));
  root.addEventListener("focusin", focus);
  root.addEventListener("focusout", schedule);
  root.addEventListener("pointerdown", down);
  root.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", cancel);
  root.addEventListener("lostpointercapture", cancel);
  root.addEventListener("click", preventSwipeClick, true);
  window.addEventListener("pointerup", up);
  window.addEventListener("blur", cancel);
  document.addEventListener("keydown", key);
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", schedule);
  render();
  return () => {
    clearTimeout(timer);
    observer.disconnect();
    resize.disconnect();
    buttons.forEach((button) => button.removeEventListener("click", click));
    root.removeEventListener("focusin", focus);
    root.removeEventListener("focusout", schedule);
    root.removeEventListener("pointerdown", down);
    root.removeEventListener("pointerup", up);
    root.removeEventListener("pointercancel", cancel);
    root.removeEventListener("lostpointercapture", cancel);
    root.removeEventListener("click", preventSwipeClick, true);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("blur", cancel);
    document.removeEventListener("keydown", key);
    document.removeEventListener("visibilitychange", visibility);
    reduced.removeEventListener("change", schedule);
  };
}
