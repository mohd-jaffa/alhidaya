const KB = 1024;
const MB = KB * 1024;

const format = (unit: "kilobyte" | "megabyte") =>
  new Intl.NumberFormat("en", { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: 1 });

/** A file's size as a person reads it: "820 kB", "4.2 MB"; a file with anything in it is never "0 kB". */
export function formatBytes(bytes: number): string {
  if (bytes >= MB) return format("megabyte").format(bytes / MB);
  return format("kilobyte").format(bytes === 0 ? 0 : Math.max(bytes / KB, 0.1));
}
