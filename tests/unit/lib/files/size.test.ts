import { describe, expect, it } from "vitest";

import { formatBytes } from "@/lib/files/size";

describe("formatBytes", () => {
  it("reads a size as a person would", () => {
    expect(formatBytes(4.2 * 1024 * 1024)).toBe("4.2 MB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatBytes(820 * 1024)).toBe("820 kB");
    expect(formatBytes(1536)).toBe("1.5 kB");
  });

  it("never calls a file with anything in it empty", () => {
    expect(formatBytes(0)).toBe("0 kB");
    expect(formatBytes(1)).toBe("0.1 kB");
    expect(formatBytes(80)).toBe("0.1 kB");
  });
});
