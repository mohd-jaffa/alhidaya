/**
 * A small ring turning while an action is under way (D204): it takes the colour of the words beside it, turns by
 * transform alone and stands still, still visible as a ring with a gap, when motion is reduced. It is decoration; the
 * button that holds it says "busy" to a screen reader (`aria-busy`).
 */
export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 shrink-0 animate-spinner rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}
