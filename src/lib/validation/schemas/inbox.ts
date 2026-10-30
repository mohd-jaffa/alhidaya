import * as z from "zod";

/** Today (D81, plan §16): what needs the admin, or everything, a page at a time. */
export const todayQuerySchema = z.object({
  needsYou: z
    .enum(["true"])
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});
export type TodayQueryInput = z.input<typeof todayQuerySchema>;
export type TodayQueryPayload = z.output<typeof todayQuerySchema>;
