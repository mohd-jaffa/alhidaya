import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { API_ROUTES } from "@/constants/routes";

/**
 * Tells the admin they are seeing unpublished changes (plan §14), with the
 * way out. Shown only in a preview, which only the signed-in admin can enter.
 */
export function PreviewBar({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div role="status" className="bg-navy text-on-deep">
      <p className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-x-6 gap-y-1 px-gutter py-2 text-small">
        <span className="flex items-center gap-2">
          <Pictogram name="info" size="sm" />
          {UI_TEXT.previewBar}
        </span>
        <a
          href={API_ROUTES.previewExit}
          className="font-semibold underline underline-offset-4 focus-visible:outline-focus-on-deep"
        >
          {UI_TEXT.previewExit}
        </a>
      </p>
    </div>
  );
}
