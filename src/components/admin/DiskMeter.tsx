import { ADMIN_TEXT } from "@/constants/admin-messages";
import { DISK_BUDGETS } from "@/constants/limits";
import { formatBytes } from "@/lib/files/size";

/** How full a folder is, as a whole percent of its budget (plan §21.2). */
export const percentUsed = ({ bytes, budget }: { bytes: number; budget: number }) => Math.round((bytes / budget) * 100);

/** Whether a folder is past the point the admin is warned at (D95). */
export const nearlyFull = (use: { bytes: number; budget: number }) => percentUsed(use) >= DISK_BUDGETS.warnAtPercent;

/** Whether a folder has no room left for one more file this large: it is refused (D84). */
export const noRoomFor = (use: { bytes: number; budget: number }, bytes: number) => use.bytes + bytes > use.budget;

/**
 * One folder's room (plan §21.2, D95): its use against its budget in words
 * and as a bar, sky while there is room, the error red past the warning.
 */
export function DiskMeter({ label, use }: { label: string; use: { bytes: number; budget: number } }) {
  const percent = percentUsed(use);
  const full = nearlyFull(use);
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="font-semibold">{label}</span>
        <span className="text-small text-ink-2">
          {ADMIN_TEXT.diskUsed(formatBytes(use.bytes), formatBytes(use.budget), percent)}
          {full ? <strong className="ms-2 text-error">{ADMIN_TEXT.diskNearlyFull}</strong> : null}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(percent, 100)}
        aria-valuetext={ADMIN_TEXT.diskUsed(formatBytes(use.bytes), formatBytes(use.budget), percent)}
        className="h-2 overflow-hidden rounded-full bg-mist"
      >
        <div
          className={`h-full rounded-full ${full ? "bg-error" : "bg-sky"}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
