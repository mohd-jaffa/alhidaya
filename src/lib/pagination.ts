/** A list's page from the address (`?page=`): a whole number from 2, else the first page, as a repeated one is. */
export function pageFrom(value: unknown): number {
  const page = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isInteger(page) && page > 1 ? page : 1;
}
