/**
 * How many fields a form's errors mark (D88): each message once, wherever it
 * sits, a list's own rule on its root included; a field's element (`ref`) is
 * never looked inside.
 */
export function countErrors(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const record = node as Record<string, unknown>;
  if (typeof record.message === "string") return 1;
  return Object.entries(record).reduce((sum, [key, value]) => (key === "ref" ? sum : sum + countErrors(value)), 0);
}
