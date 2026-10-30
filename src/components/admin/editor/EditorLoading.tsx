import { ADMIN_TEXT } from "@/constants/admin-messages";

/** While an editor's draft is read: its rows' places, waiting. */
export function EditorLoading() {
  return (
    <div aria-busy="true" aria-label={ADMIN_TEXT.loading} className="grid max-w-5xl gap-3">
      {[0, 1, 2, 3, 4].map((placeholder) => (
        <div key={placeholder} className="h-14 animate-pulse rounded-panel bg-mist" />
      ))}
    </div>
  );
}
