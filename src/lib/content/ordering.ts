/**
 * Records in their published order (plan D59): those the order names first, as
 * it names them; any it does not name yet after, oldest published first, so a
 * new record still shows before the order is published again.
 */
export function inOrder<T extends { id: string; publishedAt: Date }>(items: T[], order: readonly string[] | null): T[] {
  const position = new Map((order ?? []).map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const left = position.get(a.id) ?? Number.POSITIVE_INFINITY;
    const right = position.get(b.id) ?? Number.POSITIVE_INFINITY;
    if (left !== right) return left - right;
    return a.publishedAt.getTime() - b.publishedAt.getTime() || a.id.localeCompare(b.id);
  });
}
